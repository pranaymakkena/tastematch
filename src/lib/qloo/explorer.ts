/**
 * Qloo Explorer — Agent 2
 *
 * Resolves extracted entities against the Qloo knowledge graph and
 * pulls cross-domain affinities to build each person's "cultural fingerprint".
 */

import {
  searchEntities,
  getInsights,
  getCrossInsights,
  QlooError,
} from "./client";
import type {
  ExtractedEntity,
  PersonProfile,
  QlooInsightEntity,
  QlooTag,
} from "@/types";

// Map our category → Qloo entity type URN used for /search
// Note: /search uses full URNs AND different names than /v2/insights
// (e.g. "videogame" not "video_game")
const CATEGORY_SEARCH_TYPES: Record<string, string> = {
  film: "urn:entity:movie,urn:entity:tv_show",
  music: "urn:entity:artist",
  food: "urn:entity:place,urn:entity:brand",
  fashion: "urn:entity:brand",
  travel: "urn:entity:destination,urn:entity:place",
  hobby: "urn:entity:brand,urn:entity:person",
  other: "urn:entity:movie,urn:entity:artist,urn:entity:brand,urn:entity:place",
};

// Map our category → Qloo filter.type for /v2/insights
const CATEGORY_INSIGHT_TYPES: Record<string, string[]> = {
  film: ["urn:entity:movie", "urn:entity:tv_show"],
  music: ["urn:entity:artist"],
  food: ["urn:entity:place"],
  fashion: ["urn:entity:brand"],
  travel: ["urn:entity:destination"],
  hobby: ["urn:entity:brand"],
  other: ["urn:entity:movie", "urn:entity:artist"],
};

// ── Step 1: Resolve entity names → Qloo IDs ──────────────────────────────────

export async function resolveEntities(
  entities: ExtractedEntity[]
): Promise<ExtractedEntity[]> {
  const resolved: ExtractedEntity[] = [];

  for (const entity of entities) {
    try {
      const searchTypes = CATEGORY_SEARCH_TYPES[entity.category] ?? "";
      const results = await searchEntities(entity.text, searchTypes || undefined);

      if (results.length > 0) {
        const top = results[0];
        resolved.push({
          ...entity,
          qlooEntityId: top.entity_id,
          qlooEntityType: top.type,
          qlooEntityName: top.name,
        });
      } else {
        resolved.push(entity);
      }
    } catch (err) {
      if (err instanceof QlooError) {
        // If Qloo is unavailable, keep unresolved but don't crash
        resolved.push(entity);
      } else {
        throw err;
      }
    }
  }

  return resolved;
}

// ── Step 2: Get taste fingerprint for a person ────────────────────────────────

export interface TasteFingerprint {
  resolvedEntities: ExtractedEntity[];
  insightEntities: QlooInsightEntity[]; // Qloo-recommended entities
  tags: QlooTag[];
  entityIds: string[];
}

export async function buildTasteFingerprint(
  profile: PersonProfile,
  location?: string
): Promise<TasteFingerprint> {
  // Step 2a: Resolve all entities to Qloo IDs
  const resolvedEntities = await resolveEntities(profile.entities);

  const resolvedIds = resolvedEntities
    .filter((e) => e.qlooEntityId)
    .map((e) => e.qlooEntityId as string);

  if (!resolvedIds.length) {
    return { resolvedEntities, insightEntities: [], tags: [], entityIds: [] };
  }

  // Step 2b: Get broader taste insights for each major domain
  const insightPromises: Promise<QlooInsightEntity[]>[] = [];

  // Get movie/TV insights driven by the user's expressed entities
  insightPromises.push(
    getInsights({
      filterType: "urn:entity:movie",
      signalEntities: resolvedIds,
      take: 5,
    }).catch(() => [])
  );

  // Get artist insights
  insightPromises.push(
    getInsights({
      filterType: "urn:entity:artist",
      signalEntities: resolvedIds,
      take: 5,
    }).catch(() => [])
  );

  // Get place insights (location-aware)
  insightPromises.push(
    getInsights({
      filterType: "urn:entity:place",
      signalEntities: resolvedIds,
      filterLocationQuery: location,
      take: 6,
    }).catch(() => [])
  );

  // Get brand insights
  insightPromises.push(
    getInsights({
      filterType: "urn:entity:brand",
      signalEntities: resolvedIds,
      take: 4,
    }).catch(() => [])
  );

  const insightResults = await Promise.all(insightPromises);
  const insightEntities = insightResults.flat();

  // Step 2c: Extract all unique tags from insight entities
  const tagMap = new Map<string, QlooTag>();
  for (const e of insightEntities) {
    for (const tag of e.tags ?? []) {
      if (tag.tag_id) tagMap.set(tag.tag_id, tag);
    }
  }

  return {
    resolvedEntities,
    insightEntities,
    tags: Array.from(tagMap.values()),
    entityIds: resolvedIds,
  };
}

// ── Step 3: Find shared taste territory between two fingerprints ──────────────

export interface SharedTaste {
  sharedTags: QlooTag[];
  sharedEntityNames: string[];
  bridgeEntities: QlooInsightEntity[];
  overlapScore: number;
}

export async function findSharedTaste(
  fingerprintA: TasteFingerprint,
  fingerprintB: TasteFingerprint,
  location?: string
): Promise<SharedTaste> {
  // Find tag overlap
  const tagIdsA = new Set(fingerprintA.tags.map((t) => t.tag_id));
  const sharedTags = fingerprintB.tags.filter((t) => tagIdsA.has(t.tag_id));

  // Find entity name overlap (cross-domain)
  const entityNamesA = new Set(
    fingerprintA.insightEntities.map((e) => e.name.toLowerCase())
  );
  const sharedEntityNames = fingerprintB.insightEntities
    .filter((e) => entityNamesA.has(e.name.toLowerCase()))
    .map((e) => e.name);

  // Combine entity IDs from both people to find bridge recommendations
  const combinedIds = [
    ...fingerprintA.entityIds.slice(0, 3),
    ...fingerprintB.entityIds.slice(0, 3),
  ];

  // Get place recommendations that satisfy both taste profiles
  let bridgeEntities: QlooInsightEntity[] = [];
  if (combinedIds.length > 0) {
    bridgeEntities = await getCrossInsights(
      combinedIds,
      "urn:entity:place",
      location,
      8
    ).catch(() => []);
  }

  // Compute overlap score (0–100)
  const maxPossibleTags = Math.max(
    fingerprintA.tags.length,
    fingerprintB.tags.length,
    1
  );
  const tagOverlap = Math.min(sharedTags.length / maxPossibleTags, 1);
  const entityOverlap =
    sharedEntityNames.length /
    Math.max(fingerprintA.insightEntities.length, fingerprintB.insightEntities.length, 1);
  const overlapScore = Math.round((tagOverlap * 0.6 + entityOverlap * 0.4) * 100);

  return { sharedTags, sharedEntityNames, bridgeEntities, overlapScore };
}
