/**
 * Qloo Taste AI™ API client
 *
 * Base URL:  https://hackathon.api.qloo.com
 * Auth:      X-Api-Key header
 * Key rule:  NEVER import this file in client-side code.
 *
 * Supported entity types for /v2/insights:
 *   urn:entity:artist | urn:entity:book | urn:entity:brand |
 *   urn:entity:destination | urn:entity:movie | urn:entity:person |
 *   urn:entity:place | urn:entity:podcast | urn:entity:tv_show |
 *   urn:entity:video_game
 *
 * /search types may differ — use the `types` param from /search docs.
 * /v2/insights is a GET; parameters go in the query string, never a POST body.
 * API key goes in the X-Api-Key header — not a Bearer token, not a query param.
 */

import type {
  QlooInsightEntity,
  QlooInsightsResponse,
  QlooSearchResult,
  QlooTag,
} from "@/types";

const BASE_URL = "https://hackathon.api.qloo.com";

function getApiKey(): string {
  const key = process.env.QLOO_API_KEY;
  if (!key) throw new Error("QLOO_API_KEY is not set");
  return key;
}

async function qlooGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Api-Key": getApiKey(),
      Accept: "application/json",
    },
    // Don't cache — we need fresh results for different users
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QlooError(res.status, `Qloo ${path} failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Entity Search ─────────────────────────────────────────────────────────────

export interface QlooSearchApiResponse {
  results?: Array<{
    entity_id?: string;
    id?: string;
    name?: string;
    type?: string;
    score?: number;
    images?: { url: string }[];
    description?: string;
  }>;
}

/**
 * Search for a Qloo entity by name.
 * Returns normalized results with entity_id and name.
 */
/**
 * Search for a Qloo entity by name.
 * The /search `types` param accepts repeated values (one per append).
 * Returns normalised results with entity_id and name.
 */
export async function searchEntities(
  query: string,
  types?: string
): Promise<QlooSearchResult[]> {
  const url = new URL("/search", BASE_URL);
  url.searchParams.set("query", query);

  // types is a comma-separated list of URNs — pass each as a separate param
  if (types) {
    for (const t of types.split(",").map((s) => s.trim()).filter(Boolean)) {
      url.searchParams.append("types", t);
    }
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "X-Api-Key": getApiKey(), Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QlooError(res.status, `Qloo search failed: ${res.status} ${text}`);
  }

  const data: QlooSearchApiResponse = await res.json();
  if (!data.results) return [];

  return data.results.map((r) => ({
    entity_id: r.entity_id ?? r.id ?? "",
    name: r.name ?? query,
    type: (r as { types?: string[] }).types?.[0] ?? r.type ?? "unknown",
    score: r.score,
    images: r.images,
    description: r.description,
  }));
}

// ── Tags Search ───────────────────────────────────────────────────────────────

export interface QlooTagsApiResponse {
  results?: Array<{
    tag_id?: string;
    id?: string;
    name?: string;
    type?: string;
  }>;
}

/**
 * Search for Qloo tags by keyword (e.g. "cinematic", "ambient").
 */
export async function searchTags(query: string): Promise<QlooTag[]> {
  const data = await qlooGet<QlooTagsApiResponse>("/v2/tags", { query });
  if (!data.results) return [];
  return data.results.map((t) => ({
    tag_id: t.tag_id ?? t.id ?? "",
    name: t.name ?? query,
    type: t.type,
  }));
}

// ── Insights ──────────────────────────────────────────────────────────────────

export interface InsightsOptions {
  filterType: string; // e.g. "urn:entity:movie"
  signalEntities?: string[]; // entity IDs as signal
  filterLocationQuery?: string; // city/region string
  signalLocationQuery?: string;
  filterTags?: string; // tag URN
  take?: number;
}

/**
 * Get recommendations from Qloo Insights API.
 * filter.type is always required.
 * signal.interests.entities accepts multiple values (repeated param).
 */
export async function getInsights(opts: InsightsOptions): Promise<QlooInsightEntity[]> {
  const url = new URL("/v2/insights", BASE_URL);

  url.searchParams.set("filter.type", opts.filterType);

  if (opts.signalEntities?.length) {
    for (const id of opts.signalEntities) {
      url.searchParams.append("signal.interests.entities", id);
    }
  }

  if (opts.filterLocationQuery) {
    url.searchParams.set("filter.location.query", opts.filterLocationQuery);
  }

  if (opts.signalLocationQuery) {
    url.searchParams.set("signal.location.query", opts.signalLocationQuery);
  }

  if (opts.filterTags) {
    url.searchParams.set("filter.tags", opts.filterTags);
  }

  if (opts.take) {
    url.searchParams.set("take", String(opts.take));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Api-Key": getApiKey(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QlooError(res.status, `Qloo insights failed: ${res.status} ${text}`);
  }

  const data: QlooInsightsResponse = await res.json();
  const raw = data.results?.entities ?? [];

  // Normalise: affinity lives inside entity.query.affinity in the API response
  return raw.map((e) => ({
    entity_id: e.entity_id ?? "",
    name: e.name ?? "",
    type: e.type ?? "",
    affinity: e.query?.affinity ?? 0,
    popularity: e.popularity,
    images: e.images,
    tags: e.tags,
  }));
}

/**
 * Get cross-category insights — given entities from one domain,
 * find affinities in another domain.
 */
export async function getCrossInsights(
  signalEntityIds: string[],
  targetType: string,
  locationQuery?: string,
  take = 8
): Promise<QlooInsightEntity[]> {
  if (!signalEntityIds.length) return [];
  return getInsights({
    filterType: targetType,
    signalEntities: signalEntityIds,
    filterLocationQuery: locationQuery,
    take,
  });
}

// ── Error ─────────────────────────────────────────────────────────────────────

export class QlooError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "QlooError";
  }
}

export function isQlooUnavailable(err: unknown): boolean {
  if (err instanceof QlooError) {
    return err.statusCode === 401 || err.statusCode === 403 || err.statusCode >= 500;
  }
  return true;
}
