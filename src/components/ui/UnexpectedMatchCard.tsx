"use client";

import type { UnexpectedMatch } from "@/types";

interface UnexpectedMatchCardProps {
  match: UnexpectedMatch;
}

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: "🍽️", film: "🎬", experience: "✨",
  place: "📍", artist: "🎵", activity: "🎯",
};

export function UnexpectedMatchCard({ match }: UnexpectedMatchCardProps) {
  const icon = CATEGORY_ICONS[match.category] ?? "✦";

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: "var(--border)" }}>
      {/* Yellow header banner */}
      <div className="px-6 pt-5 pb-4" style={{ background: "#F5C518" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-[#1A1A2E]/15 text-[#1A1A2E] text-xs font-semibold uppercase tracking-wider">
            ✦ The Unexpected Match
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-2xl font-black text-[#1A1A2E]">{match.title}</h3>
            <p className="text-sm text-[#1A1A2E]/70 capitalize font-medium">{match.category}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-6 py-5 space-y-3">
        <p className="text-[#1A1A2E] leading-relaxed">{match.description}</p>

        <div className="rounded-xl p-4 border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mb-1.5">Why it's unexpected</p>
          <p className="text-sm text-[#5A5A72]">{match.whyUnexpected}</p>
        </div>

        <div className="rounded-xl p-4 border border-[#4CAF50]/30" style={{ background: "#E8F5E9" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2E7D32] mb-1.5">Qloo signal</p>
          <p className="text-sm text-[#1A5C20]">{match.qlooEvidence}</p>
        </div>
      </div>
    </div>
  );
}
