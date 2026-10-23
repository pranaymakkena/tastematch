"use client";

import type { MatchScore } from "@/types";

interface MatchScoreBarProps {
  score: MatchScore;
}

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  return (
    <div className="rounded-2xl bg-white border p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9B9BAD] mb-1">Cultural Resonance</p>
          <div className="flex items-end gap-1">
            <span className="text-6xl font-black text-[#1A1A2E] leading-none">{score.overall}</span>
            <span className="text-2xl font-light text-[#C4C4CC] mb-1">/100</span>
          </div>
        </div>
        {/* Donut */}
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#F1EFEA" strokeWidth="10" />
            <circle
              cx="40" cy="40" r="30"
              fill="none"
              stroke="#F5C518"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - score.overall / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#1A1A2E] rotate-0">
            {score.overall}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {score.dimensions.map((dim) => (
          <div key={dim.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-[#1A1A2E]">{dim.label}</span>
              <span className="text-xs font-semibold text-[#5A5A72]">{dim.score}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full bg-[#F5C518] transition-all duration-700"
                style={{ width: `${dim.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[#9B9BAD] italic leading-relaxed">{score.caveat}</p>
    </div>
  );
}
