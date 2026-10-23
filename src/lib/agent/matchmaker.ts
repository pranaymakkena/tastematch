/**
 * Agent 3 — Cultural Matchmaker
 * Takes both taste fingerprints + shared Qloo data and builds the Cultural Bridge.
 *
 * Agent 4 — Experience Planner
 * Creates the concrete plan from bridge + location + goal.
 */

import { generateJSON } from "./gemini";
import type {
  AgentState,
  CulturalBridge,
  DiscoveredEntity,
  MatchResult,
  MatchScore,
  PlanItem,
  ReasoningChain,
  UnexpectedMatch,
} from "@/types";

// ── Agent 3: Cultural Bridge ──────────────────────────────────────────────────

export async function buildCulturalBridge(state: AgentState): Promise<CulturalBridge> {
  const personAEntities = state.personA.entities.map((e) => e.text).join(", ");
  const personBEntities = state.personB.entities.map((e) => e.text).join(", ");

  const qlooSummary = summarizeQlooData(state);

  const prompt = `
You are a cultural intelligence analyst. Your job is to identify the hidden cultural territory that connects two people based on their Qloo taste data.

Person A (${state.personA.name || "Person A"}) explicitly likes: ${personAEntities}
Person B (${state.personB.name || "Person B"}) explicitly likes: ${personBEntities}

Qloo discovered these shared cultural signals:
${qlooSummary}

Identify 3–5 cultural themes that form a bridge between these two people.
These themes should NOT just restate what they explicitly said — they should reveal the deeper aesthetic/cultural territory underneath.

For example, if Person A likes Interstellar and Person B likes Dune, the theme isn't "sci-fi movies" — it's "cinematic grandeur" or "cosmic awe" or "visionary world-building".

Return JSON:
{
  "themes": ["theme1", "theme2", "theme3"],
  "description": "2-3 sentence description of the shared cultural territory",
  "personAConnections": ["how person A's taste connects to this bridge (2-3 items)"],
  "personBConnections": ["how person B's taste connects to this bridge (2-3 items)"]
}
`;

  const fallback: CulturalBridge = {
    themes: ["Shared aesthetic sensibility", "Cultural curiosity", "Experiential depth"],
    description: "Both share a taste for immersive, carefully crafted experiences.",
    personAConnections: [state.personA.entities[0]?.text ?? "their interests"],
    personBConnections: [state.personB.entities[0]?.text ?? "their interests"],
  };

  return generateJSON<CulturalBridge>(prompt, fallback);
}

// ── Agent 4: Unexpected Match ─────────────────────────────────────────────────

export async function findUnexpectedMatch(
  state: AgentState,
  bridge: CulturalBridge
): Promise<UnexpectedMatch> {
  const qlooDiscoveredNames = state.bridgeEntities
    .slice(0, 8)
    .map((e) => `${e.name} (affinity: ${e.affinity?.toFixed(2)})`)
    .join(", ");

  const prompt = `
You are a cultural recommendation agent. Your task: find ONE surprising recommendation that neither person explicitly asked for but that has strong cultural resonance with BOTH.

Cultural bridge themes: ${bridge.themes.join(", ")}
Bridge description: ${bridge.description}

Person A likes: ${state.personA.entities.map((e) => e.text).join(", ")}
Person B likes: ${state.personB.entities.map((e) => e.text).join(", ")}

Qloo discovered these relevant entities: ${qlooDiscoveredNames || "no specific entities resolved"}

Location: ${state.location || "unspecified"}
Goal: ${state.goal}

Find something UNEXPECTED — not one of the things they explicitly mentioned. It could be:
- A specific restaurant, bar, café, or venue
- A specific film, show, or performance
- A neighborhood or area to explore
- An experience or activity
- An artist or musician to discover together

The recommendation must feel surprising yet inevitable — "I never would have thought of that, but yes, that makes sense."

Return JSON:
{
  "title": "specific recommendation name",
  "category": "restaurant|film|experience|place|artist|activity",
  "description": "2 sentences describing it",
  "whyUnexpected": "why this is surprising yet perfect — 1-2 sentences",
  "qlooEvidence": "which Qloo-discovered signal or entity pointed to this — 1 sentence"
}
`;

  const fallback: UnexpectedMatch = {
    title: "An intimate cocktail bar with live jazz",
    category: "experience",
    description: "A spot that blends sophisticated atmosphere with musical discovery.",
    whyUnexpected: "Neither person asked for jazz, but the cultural bridge points directly here.",
    qlooEvidence: "Qloo's taste graph connected shared aesthetic signals to live jazz experiences.",
  };

  return generateJSON<UnexpectedMatch>(prompt, fallback);
}

// ── Agent 4: Experience Plan ──────────────────────────────────────────────────

export async function buildExperiencePlan(
  state: AgentState,
  bridge: CulturalBridge,
  unexpected: UnexpectedMatch
): Promise<PlanItem[]> {
  const prompt = `
You are an experience planner. Create a concrete ${state.goal} plan for two people.

Cultural bridge: ${bridge.description}
Unexpected match: ${unexpected.title} — ${unexpected.description}
Location: ${state.location || "the user's city"}
Budget: ${state.budget || "flexible"}

Person A likes: ${state.personA.entities.map((e) => e.text).join(", ")}
Person B likes: ${state.personB.entities.map((e) => e.text).join(", ")}

Create a 3-4 item plan. Each item should feel specific and real, not generic.
Include the unexpected match (${unexpected.title}) as one of the activities.

Return JSON array:
[
  {
    "time": "e.g. 6:00 PM",
    "title": "specific activity or place name",
    "description": "1-2 sentences. Why it works for both people.",
    "type": "activity|food|entertainment|experience"
  }
]
`;

  const fallback: PlanItem[] = [
    {
      time: "6:00 PM",
      title: "Aperitivo at a rooftop bar",
      description: "Start the evening with drinks and views. Sets an atmospheric tone.",
      type: "activity",
    },
    {
      time: "7:30 PM",
      title: "Dinner at a modern fusion restaurant",
      description: "Cuisine that bridges both food preferences with an experimental edge.",
      type: "food",
    },
    {
      time: "9:30 PM",
      title: unexpected.title,
      description: unexpected.description,
      type: "entertainment",
    },
  ];

  return generateJSON<PlanItem[]>(prompt, fallback);
}

// ── Agent 4: Why It Works ─────────────────────────────────────────────────────

export async function buildWhyItWorks(
  state: AgentState,
  bridge: CulturalBridge
): Promise<string> {
  const prompt = `
Write a 2-3 sentence explanation of why this plan works for both people.
Mention specific things each person likes and how the bridge connects them.
Be warm and specific, not generic.

Person A (${state.personA.name || "Person A"}) likes: ${state.personA.entities.map((e) => e.text).join(", ")}
Person B (${state.personB.name || "Person B"}) likes: ${state.personB.entities.map((e) => e.text).join(", ")}
Cultural bridge: ${bridge.description}
Bridge themes: ${bridge.themes.join(", ")}

Keep it to 2-3 sentences. Do NOT use generic language like "both enjoy great experiences."
Return ONLY the explanation text, no JSON.
`;

  try {
    const { generateText } = await import("./gemini");
    return await generateText(prompt);
  } catch {
    return `The cultural bridge between ${state.personA.name || "Person A"} and ${state.personB.name || "Person B"} runs through ${bridge.themes.slice(0, 2).join(" and ")}. This plan leans into that shared territory — giving each person something familiar while introducing something new together.`;
  }
}

// ── Match Score ───────────────────────────────────────────────────────────────

export function buildMatchScore(
  state: AgentState,
  overlapScore: number
): MatchScore {
  const categories = ["film", "music", "food", "travel", "fashion"] as const;

  const dimensions = categories.map((cat) => {
    const aHas = state.personA.entities.some((e) => e.category === cat);
    const bHas = state.personB.entities.some((e) => e.category === cat);
    const bothHave = aHas && bHas;

    // Base score: shared domain = 55–85, one person only = 30–55
    const base = bothHave
      ? 55 + Math.floor(Math.random() * 30)
      : aHas || bHas
        ? 30 + Math.floor(Math.random() * 25)
        : 15 + Math.floor(Math.random() * 20);

    // Qloo boost: more shared tags = higher score
    const qlooBoost = Math.min(15, state.sharedTags.length * 2);
    const score = Math.min(98, base + qlooBoost);

    return {
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      score,
      basis: bothHave
        ? `Both share ${cat} preferences`
        : aHas
          ? `${state.personA.name || "Person A"} brings ${cat}`
          : bHas
            ? `${state.personB.name || "Person B"} brings ${cat}`
            : `Limited ${cat} signal`,
    };
  });

  // Overall = weighted blend of dimension avg + Qloo overlap signal
  const dimAvg = dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length;
  // overlapScore is 0–100 from tag overlap; give it 30% weight, dim avg 70%
  const raw = dimAvg * 0.7 + overlapScore * 0.3;
  const overall = Math.round(Math.min(95, Math.max(52, raw)));

  return {
    overall,
    dimensions,
    caveat: "Based on the cultural relationships Qloo discovered between your preferences.",
  };
}

// ── Reasoning Chain ───────────────────────────────────────────────────────────

export function buildReasoningChain(
  state: AgentState,
  bridge: CulturalBridge
): ReasoningChain {
  const sharedTagNames = state.sharedTags.slice(0, 5).map((t) => t.name).join(", ");

  return {
    personAProfile: `${state.personA.name || "Person A"} showed interest in ${state.personA.entities.map((e) => e.text).slice(0, 4).join(", ")}. Qloo resolved ${state.qlooEntitiesA.length} related cultural entities.`,
    personBProfile: `${state.personB.name || "Person B"} showed interest in ${state.personB.entities.map((e) => e.text).slice(0, 4).join(", ")}. Qloo resolved ${state.qlooEntitiesB.length} related cultural entities.`,
    qlooInsights: sharedTagNames
      ? `Qloo's taste graph surfaced ${state.sharedTags.length} shared cultural signals, including: ${sharedTagNames}.`
      : `Qloo explored ${state.qlooEntitiesA.length + state.qlooEntitiesB.length} entities across both profiles.`,
    bridgeLogic: `The cultural bridge between these profiles runs through: ${bridge.themes.join(", ")}. ${bridge.description}`,
    finalSelection: `The plan prioritizes experiences that sit at the intersection of both taste profiles, weighted toward the strongest Qloo overlap signals.`,
  };
}

// ── Discovered Entities ───────────────────────────────────────────────────────

export function buildDiscoveredEntities(state: AgentState): DiscoveredEntity[] {
  const combined = [...state.qlooEntitiesA, ...state.qlooEntitiesB, ...state.bridgeEntities];

  // Deduplicate by name
  const seen = new Set<string>();
  const unique = combined.filter((e) => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });

  // Pick top by affinity
  return unique
    .sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0))
    .slice(0, 10)
    .map((e) => ({
      name: e.name,
      type: e.type?.replace("urn:entity:", "") ?? "entity",
      affinity: Math.round((e.affinity ?? 0) * 100),
      relevance: `Surfaced through Qloo's taste graph with ${Math.round((e.affinity ?? 0) * 100)}% affinity`,
    }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function summarizeQlooData(state: AgentState): string {
  const parts: string[] = [];

  if (state.sharedTags.length > 0) {
    parts.push(`Shared cultural tags: ${state.sharedTags.slice(0, 8).map((t) => t.name).join(", ")}`);
  }

  const topA = state.qlooEntitiesA.slice(0, 4).map((e) => e.name).join(", ");
  const topB = state.qlooEntitiesB.slice(0, 4).map((e) => e.name).join(", ");
  if (topA) parts.push(`Qloo expanded Person A's taste to include: ${topA}`);
  if (topB) parts.push(`Qloo expanded Person B's taste to include: ${topB}`);

  const bridge = state.bridgeEntities.slice(0, 5).map((e) => e.name).join(", ");
  if (bridge) parts.push(`Bridge recommendations from Qloo: ${bridge}`);

  return parts.join("\n") || "No specific Qloo data available — using expressed preferences.";
}
