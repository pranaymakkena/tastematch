/**
 * TasteMatch Agent Orchestrator
 *
 * Pipeline:
 *   Agent 1: Taste Parser  → structured entities from natural language
 *   Agent 2: Qloo Explorer → cultural fingerprints via Qloo Taste AI™
 *   Agent 3: Cultural Matchmaker → identify shared territory & bridge
 *   Agent 4: Experience Planner  → concrete plan + unexpected match
 */

import { buildTasteFingerprint, findSharedTaste } from "../qloo/explorer";
import {
  buildCulturalBridge,
  findUnexpectedMatch,
  buildExperiencePlan,
  buildWhyItWorks,
  buildMatchScore,
  buildReasoningChain,
  buildDiscoveredEntities,
} from "./matchmaker";
import type { AgentState, AnalyzeRequest, MatchResult } from "@/types";
import { isQlooUnavailable } from "../qloo/client";

export interface OrchestratorResult {
  result: MatchResult;
  qlooAvailable: boolean;
}

export async function runTasteMatchPipeline(
  request: AnalyzeRequest
): Promise<OrchestratorResult> {
  let qlooAvailable = true;
  let overlapScore = 50;

  // ── Initialize agent state ─────────────────────────────────────────────────
  const state: AgentState = {
    personA: request.personA,
    personB: request.personB,
    location: request.location,
    budget: request.budget,
    goal: request.goal,
    qlooEntitiesA: [],
    qlooEntitiesB: [],
    qlooTagsA: [],
    qlooTagsB: [],
    sharedTags: [],
    bridgeEntities: [],
  };

  // ── Agent 2: Qloo Explorer ─────────────────────────────────────────────────
  try {
    const [fingerprintA, fingerprintB] = await Promise.all([
      buildTasteFingerprint(state.personA, state.location),
      buildTasteFingerprint(state.personB, state.location),
    ]);

    // Update resolved entities back into profiles
    state.personA = { ...state.personA, entities: fingerprintA.resolvedEntities };
    state.personB = { ...state.personB, entities: fingerprintB.resolvedEntities };

    state.qlooEntitiesA = fingerprintA.insightEntities;
    state.qlooEntitiesB = fingerprintB.insightEntities;
    state.qlooTagsA = fingerprintA.tags;
    state.qlooTagsB = fingerprintB.tags;

    // Find shared taste territory
    const shared = await findSharedTaste(fingerprintA, fingerprintB, state.location);
    state.sharedTags = shared.sharedTags;
    state.bridgeEntities = shared.bridgeEntities;
    overlapScore = shared.overlapScore;
  } catch (err) {
    if (isQlooUnavailable(err)) {
      qlooAvailable = false;
      overlapScore = 50;
    } else {
      throw err;
    }
  }

  // ── Agent 3: Cultural Matchmaker ───────────────────────────────────────────
  const bridge = await buildCulturalBridge(state);

  // ── Agent 4: Experience Planner ────────────────────────────────────────────
  const [unexpected, whyItWorks] = await Promise.all([
    findUnexpectedMatch(state, bridge),
    buildWhyItWorks(state, bridge),
  ]);

  const plan = await buildExperiencePlan(state, bridge, unexpected);

  // ── Build final result ─────────────────────────────────────────────────────
  const matchScore = buildMatchScore(state, overlapScore);
  const reasoning = buildReasoningChain(state, bridge);
  const qlooDiscovered = buildDiscoveredEntities(state);

  const result: MatchResult = {
    culturalBridge: bridge,
    unexpectedMatch: unexpected,
    sharedPlan: plan,
    whyItWorks,
    qlooDiscovered,
    matchScore,
    reasoning,
  };

  return { result, qlooAvailable };
}
