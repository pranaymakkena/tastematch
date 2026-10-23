"use client";

import type { CulturalBridge, PersonProfile } from "@/types";

interface CulturalBridgeVizProps {
  bridge: CulturalBridge;
  personA: PersonProfile;
  personB: PersonProfile;
}

export function CulturalBridgeViz({ bridge, personA, personB }: CulturalBridgeVizProps) {
  return (
    <div className="rounded-2xl bg-white border overflow-hidden shadow-sm" style={{ borderColor: "var(--border)" }}>
      {/* Header banner */}
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ background: "var(--accent-yellow-light)", borderColor: "#F5C51840" }}>
        <span className="text-lg">✦</span>
        <h2 className="font-bold text-[#1A1A2E]">Your Cultural Bridge</h2>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5C518] text-[#1A1A2E]">Qloo AI</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Person A */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mb-3">
              {personA.name || "Person A"}
            </p>
            {bridge.personAConnections.map((conn, i) => (
              <div key={i} className="px-3 py-2 rounded-xl text-sm font-medium text-[#6D28D9]"
                style={{ background: "#F5F3FF", border: "1px solid #EDE9FE" }}>
                {conn}
              </div>
            ))}
          </div>

          {/* Bridge column */}
          <div className="flex flex-col items-center gap-2 px-2 pt-7">
            <div className="w-px h-6" style={{ background: "linear-gradient(to bottom, transparent, #F5C518)" }} />

            {bridge.themes.map((theme, i) => (
              <div key={i}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-center whitespace-nowrap shadow-sm border"
                style={{
                  background: i === 0 ? "#F5C518" : i === 1 ? "#FFF0A0" : "#FFF8DC",
                  borderColor: "#F5C51840",
                  color: "#1A1A2E",
                  transform: `scale(${1 - i * 0.04})`,
                }}
              >
                {theme}
              </div>
            ))}

            <div className="w-px h-6" style={{ background: "linear-gradient(to top, transparent, #4CAF50)" }} />
          </div>

          {/* Person B */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mb-3 text-right">
              {personB.name || "Person B"}
            </p>
            {bridge.personBConnections.map((conn, i) => (
              <div key={i} className="px-3 py-2 rounded-xl text-sm font-medium text-[#065F46] text-right"
                style={{ background: "#ECFDF5", border: "1px solid #D1FAE5" }}>
                {conn}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 p-4 rounded-2xl border text-sm text-[#5A5A72] leading-relaxed text-center"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
          {bridge.description}
        </div>
      </div>
    </div>
  );
}
