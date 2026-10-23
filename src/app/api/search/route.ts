import { NextRequest } from "next/server";
import { searchEntities } from "@/lib/qloo/client";
import type { SearchResponse } from "@/types";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const types = searchParams.get("types") ?? "";

  if (!query.trim()) {
    return Response.json(
      { success: false, error: "Query is required", results: [] } satisfies SearchResponse
    );
  }

  try {
    const results = await searchEntities(query, types || undefined);
    return Response.json({ success: true, results } satisfies SearchResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return Response.json(
      { success: false, error: message, results: [] } satisfies SearchResponse,
      { status: 500 }
    );
  }
}
