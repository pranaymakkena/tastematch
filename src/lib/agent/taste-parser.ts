/**
 * Agent 1 — Taste Parser
 * Converts natural-language input into structured cultural entities.
 */

import { generateJSON } from "./gemini";
import type { ExtractedEntity, PersonProfile } from "@/types";

// Simple UUID replacement using crypto.randomUUID available in Node 19+
function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

interface ParsedEntities {
  entities: Array<{
    text: string;
    category: "film" | "music" | "food" | "fashion" | "travel" | "hobby" | "other";
  }>;
}

const CATEGORY_EXAMPLES: Record<string, string> = {
  film: 'movies, TV shows, directors — e.g. "Interstellar", "Breaking Bad"',
  music: 'musicians, bands, genres — e.g. "A.R. Rahman", "The Weeknd"',
  food: 'cuisines, restaurants, dishes — e.g. "Japanese cuisine", "ramen"',
  fashion: 'brands, styles — e.g. "Nike", "vintage clothing"',
  travel: 'places, destinations — e.g. "Tokyo", "quiet cafés"',
  hobby: 'activities, interests — e.g. "live music", "rock climbing"',
};

export async function parsePersonInput(rawInput: string): Promise<PersonProfile> {
  const prompt = `
You are a cultural entity extractor. The user has described their tastes and interests.
Extract every cultural entity mentioned. Assign each a category.

Categories:
${Object.entries(CATEGORY_EXAMPLES)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

User input: "${rawInput}"

Return JSON in this exact shape:
{
  "entities": [
    { "text": "entity name as mentioned", "category": "film|music|food|fashion|travel|hobby|other" }
  ]
}

Rules:
- Extract every specific entity mentioned (movies, artists, places, brands, foods, drinks, etc.)
- Be generous: "coffee" is a valid food entity, "Dune" is a valid film entity, "Odyssey" is a valid film entity
- Common drinks like coffee, tea, matcha are valid food/hobby entities — include them
- Short inputs are fine — extract whatever is there, even if it is just one or two things
- Use the most specific category for each entity
- Keep entity text close to the original wording but clean it up slightly
- Only return an empty entities array if the input is completely nonsensical or blank
- Maximum 12 entities
`;

  const parsed = await generateJSON<ParsedEntities>(prompt, { entities: [] });

  const entities: ExtractedEntity[] = (parsed.entities ?? []).map((e) => ({
    id: makeId(),
    text: e.text,
    category: e.category ?? "other",
  }));

  return {
    name: "",
    rawInput,
    entities,
  };
}
