"use client";

import type { PlanItem } from "@/types";

interface SharedPlanProps {
  items: PlanItem[];
  whyItWorks: string;
}

const TYPE_STYLES: Record<string, { accent: string; bg: string; icon: string }> = {
  activity:      { accent: "bg-purple-400",    bg: "bg-purple-50 border-purple-100", icon: "🎯" },
  food:          { accent: "bg-[#F5C518]",     bg: "bg-[#FFF8DC] border-[#F5C51840]", icon: "🍽️" },
  entertainment: { accent: "bg-rose-400",      bg: "bg-rose-50 border-rose-100",    icon: "🎬" },
  experience:    { accent: "bg-[#4CAF50]",     bg: "bg-[#E8F5E9] border-[#4CAF5040]", icon: "✨" },
};

export function SharedPlan({ items, whyItWorks }: SharedPlanProps) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold text-[#1A1A2E]">Your Shared Plan</h2>
      </div>

      <div className="p-6 space-y-3">
        {items.map((item, i) => {
          const s = TYPE_STYLES[item.type] ?? TYPE_STYLES.activity;
          return (
            <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${s.bg}`}>
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${s.accent} mt-1`} />
                {i < items.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px]" style={{ background: "var(--surface-3)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-[#9B9BAD]">{item.time}</span>
                  <span className="text-sm">{s.icon}</span>
                  <h4 className="font-semibold text-[#1A1A2E] text-sm">{item.title}</h4>
                </div>
                <p className="text-sm text-[#5A5A72] leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}

        {whyItWorks && (
          <div className="mt-2 p-4 rounded-2xl border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mb-2">Why this works</p>
            <p className="text-sm text-[#5A5A72] leading-relaxed">{whyItWorks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
