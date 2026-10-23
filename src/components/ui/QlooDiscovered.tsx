"use client";

import type { DiscoveredEntity } from "@/types";

interface QlooDiscoveredProps {
  entities: DiscoveredEntity[];
  qlooAvailable: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  movie: "🎬", tv_show: "📺", artist: "🎵", place: "📍",
  brand: "🏷️", destination: "✈️", book: "📖",
  podcast: "🎙️", person: "👤", video_game: "🎮",
};

const TYPE_COLORS: Record<string, string> = {
  movie: "bg-purple-50 text-purple-600",
  tv_show: "bg-blue-50 text-blue-600",
  artist: "bg-rose-50 text-rose-600",
  place: "bg-emerald-50 text-emerald-600",
  brand: "bg-orange-50 text-orange-600",
  destination: "bg-cyan-50 text-cyan-600",
};

export function QlooDiscovered({ entities, qlooAvailable }: QlooDiscoveredProps) {
  if (!qlooAvailable) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-500">⚠</span>
          <h3 className="font-semibold text-amber-800">Cultural intelligence temporarily unavailable</h3>
        </div>
        <p className="text-sm text-amber-700">
          Qloo's Taste AI™ could not be reached. Recommendations are based on expressed preferences only — without Qloo's cultural graph, cross-domain connections are limited.
        </p>
      </div>
    );
  }

  if (!entities.length) return null;

  return (
    <div className="rounded-2xl bg-white border shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold text-[#1A1A2E]">Qloo Discovered</h2>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
          Taste AI™
        </span>
      </div>
      <div className="px-6 pb-2 pt-3">
        <p className="text-xs text-[#9B9BAD]">
          Cultural entities surfaced by Qloo's behavioral graph — things neither person explicitly mentioned
        </p>
      </div>

      <div className="p-6 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entities.map((entity, i) => {
          const colorClass = TYPE_COLORS[entity.type] ?? "bg-gray-50 text-gray-600";
          return (
            <div key={i} className="rounded-2xl border p-3 hover:shadow-sm transition-shadow"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className={`text-sm px-2 py-0.5 rounded-lg font-medium ${colorClass}`}>
                  {TYPE_ICONS[entity.type] ?? "✦"} {entity.type.replace("_", " ")}
                </span>
                <span className="text-xs font-mono font-bold text-[#5A5A72]">{entity.affinity}%</span>
              </div>
              <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">{entity.name}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full bg-[#F5C518]" style={{ width: `${entity.affinity}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#9B9BAD] pb-5 px-6">
        These connections emerged from Qloo's behavioral patterns across 10T+ signals — not keywords.
      </p>
    </div>
  );
}
