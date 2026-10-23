"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReasoningChain } from "@/types";

interface ReasoningDrawerProps {
  reasoning: ReasoningChain;
}

export function ReasoningDrawer({ reasoning }: ReasoningDrawerProps) {
  const [open, setOpen] = useState(false);

  const steps = [
    { label: "What Person A likes",       text: reasoning.personAProfile, icon: "①", color: "bg-[#FFF8DC] text-[#8A6E00]" },
    { label: "What Person B likes",       text: reasoning.personBProfile, icon: "②", color: "bg-[#E8F5E9] text-[#2E7D32]" },
    { label: "What Qloo discovered",      text: reasoning.qlooInsights,   icon: "✦", color: "bg-purple-50 text-purple-700" },
    { label: "How they connect",          text: reasoning.bridgeLogic,    icon: "◈", color: "bg-orange-50 text-orange-700" },
    { label: "Why this recommendation",   text: reasoning.finalSelection, icon: "◆", color: "bg-[#F5C518]/20 text-[#8A6E00]" },
  ];

  return (
    <div className="rounded-2xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F8F7F4] transition-colors"
        aria-expanded={open}
      >
        <span className="font-bold text-[#1A1A2E]">Why this recommendation?</span>
        {open
          ? <ChevronUp size={18} className="text-[#9B9BAD]" />
          : <ChevronDown size={18} className="text-[#9B9BAD]" />
        }
      </button>

      {open && (
        <div className="px-6 pb-6 border-t space-y-4 pt-4" style={{ borderColor: "var(--border)" }}>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-xl text-xs font-bold ${step.color}`}>
                {step.icon}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#9B9BAD] mb-0.5">{step.label}</p>
                <p className="text-sm text-[#5A5A72] leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
