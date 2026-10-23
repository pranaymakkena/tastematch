import { NextRequest } from "next/server";
import { runTasteMatchPipeline } from "@/lib/agent/orchestrator";
import { parsePersonInput } from "@/lib/agent/taste-parser";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: AnalyzeRequest = await req.json();

    let { personA, personB } = body;

    // If entities are missing but rawInput exists, auto-parse server-side
    if (!personA?.entities?.length && personA?.rawInput?.trim()) {
      try {
        const parsed = await parsePersonInput(personA.rawInput);
        personA = { ...personA, entities: parsed.entities };
      } catch { /* keep empty */ }
    }

    if (!personB?.entities?.length && personB?.rawInput?.trim()) {
      try {
        const parsed = await parsePersonInput(personB.rawInput);
        personB = { ...personB, entities: parsed.entities };
      } catch { /* keep empty */ }
    }

    // Final check
    if (!personA?.entities?.length || !personB?.entities?.length) {
      return Response.json(
        {
          success: false,
          error: "Couldn't extract preferences. Try adding more specific interests like movies, artists, foods, or places.",
          qlooAvailable: true,
        } satisfies AnalyzeResponse,
        { status: 400 }
      );
    }

    const { result, qlooAvailable } = await runTasteMatchPipeline({
      ...body,
      personA,
      personB,
    });

    return Response.json({ success: true, result, qlooAvailable } satisfies AnalyzeResponse);
  } catch (err) {
    console.error("[/api/analyze]", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return Response.json(
      { success: false, error: message, qlooAvailable: false } satisfies AnalyzeResponse,
      { status: 500 }
    );
  }
}
