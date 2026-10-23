/**
 * Gemini client -- server-side only
 *
 * Model fallback chain (free tier, highest quota first):
 *   1. gemini-2.0-flash        -- 1,500 req/day, 15 RPM
 *   2. gemini-1.5-flash        -- 1,500 req/day, 15 RPM
 *   3. gemini-1.5-flash-8b     -- 1,500 req/day, 15 RPM (smallest/fastest)
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

// Ordered by preference -- first model that isn't rate-limited wins
const MODEL_CHAIN = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
] as const;

type GeminiModel = (typeof MODEL_CHAIN)[number];

// Track per-model quota exhaustion within this process lifetime so we skip
// known-exhausted models quickly without burning an extra network round-trip.
const exhausted = new Set<GeminiModel>();

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/** Returns true when the error is a 429 / quota error from the Gemini API. */
function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit")
  );
}

/**
 * Iterate through MODEL_CHAIN and call fn with the first model that works.
 * On a 429 / quota error the model is marked exhausted for this process
 * lifetime and the next model in the chain is tried automatically.
 * Any non-quota error is re-thrown immediately.
 */
async function withFallback<T>(
  fn: (model: GenerativeModel, modelName: string) => Promise<T>
): Promise<T> {
  const genAI = getGenAI();
  let lastErr: unknown;

  for (const name of MODEL_CHAIN) {
    if (exhausted.has(name)) continue;

    try {
      const model = genAI.getGenerativeModel({ model: name });
      return await fn(model, name);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn(`[gemini] ${name} quota exhausted -- trying next model`);
        exhausted.add(name);
        lastErr = err;
      } else {
        throw err; // surface non-quota errors immediately
      }
    }
  }

  // All models exhausted
  throw new Error(
    `All Gemini models hit quota limits. Last error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`
  );
}

/** Plain text generation with automatic model fallback. */
export async function generateText(prompt: string): Promise<string> {
  return withFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * JSON generation with automatic model fallback.
 *
 * Attempt order per model:
 *   1. JSON mode (responseMimeType: "application/json") -- cleanest output
 *   2. Text mode with explicit "no markdown" instruction + cleanup
 *
 * Returns fallback only if JSON parsing itself fails after all retries --
 * quota errors are NOT silently swallowed; they trigger the model fallback chain.
 */
export async function generateJSON<T>(prompt: string, fallback: T): Promise<T> {
  return withFallback(async (_, modelName) => {
    const genAI = getGenAI();

    // Attempt 1: JSON mode
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return JSON.parse(text) as T;
    } catch (firstErr) {
      // Re-throw quota errors so withFallback can switch models
      if (isQuotaError(firstErr)) throw firstErr;

      // Attempt 2: text mode + cleanup
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
          prompt + "\n\nReturn ONLY a raw JSON value -- no prose, no markdown code fences."
        );
        const raw = result.response.text().trim();
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/i, "")
          .trim();
        return JSON.parse(cleaned) as T;
      } catch (secondErr) {
        if (isQuotaError(secondErr)) throw secondErr;
        // JSON parse / generation failure -- log and use fallback value
        console.error(`[generateJSON] ${modelName} parse failed:`, secondErr);
        return fallback;
      }
    }
  });
}