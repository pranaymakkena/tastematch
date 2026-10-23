"use client";

import { DEMO_PROFILES } from "@/lib/demos";
import type { DemoProfile } from "@/types";
import { X, ArrowRight } from "lucide-react";

interface DemoSelectorProps {
  onSelect: (demo: DemoProfile) => void;
  onClose: () => void;
}

export function DemoSelector({ onSelect, onClose }: DemoSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,26,46,0.45)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">Try a demo</h2>
            <p className="text-sm text-[#9B9BAD] mt-0.5">Pick two people — we'll run the full Qloo analysis</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-[#F1EFEA] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {DEMO_PROFILES.map((demo, i) => {
            const colors = [
              { dot: "bg-[#F5C518]", badge: "bg-[#FFF8DC] text-[#8A6E00]" },
              { dot: "bg-[#4CAF50]", badge: "bg-[#E8F5E9] text-[#2E7D32]" },
              { dot: "bg-purple-400",badge: "bg-purple-50 text-purple-700" },
            ][i] ?? { dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600" };

            return (
              <button
                key={demo.id}
                onClick={() => { onSelect(demo); onClose(); }}
                className="w-full text-left rounded-2xl border p-4 hover:border-[#F5C518] hover:shadow-md transition-all group"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors.badge} flex-shrink-0`}>
                    {demo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A2E] group-hover:text-[#1A1A2E]">{demo.title}</p>
                    <p className="text-xs text-[#9B9BAD] mt-0.5">{demo.subtitle}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF8DC] text-[#8A6E00] text-xs font-medium">{demo.personA.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-medium">{demo.personB.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#F1EFEA] text-[#5A5A72] text-xs">📍 {demo.location}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#C4C4CC] group-hover:text-[#F5C518] transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
