import { NextRequest } from "next/server";
import { parsePersonInput } from "@/lib/agent/taste-parser";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { input } = await req.json();
    if (!input?.trim()) {
      return Response.json({ success: false, error: "Input is required" }, { status: 400 });
    }
    const profile = await parsePersonInput(input as string);

    // If entities came back empty it means Gemini couldn't extract anything
    // meaningful — treat this as a soft failure so the client can show a
    // helpful message rather than silently proceeding with no data.
    if (!profile.entities.length) {
      return Response.json(
        {
          success: false,
          error: "No preferences could be extracted. Try being more specific — e.g. \"I love Interstellar, jazz, and sushi.\"",
        },
        { status: 422 }
      );
    }

    return Response.json({ success: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed";

    // Surface quota errors with a friendlier message
    const isQuota =
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("all gemini models");

    return Response.json(
      {
        success: false,
        error: isQuota
          ? "The AI is temporarily rate-limited. Please wait a moment and try again."
          : message,
      },
      { status: isQuota ? 429 : 500 }
    );
  }
}
