"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { id: "parse-a", label: "01 — Understanding your tastes",        sub: "Mapping Person A's cultural fingerprint…",          icon: "◉" },
  { id: "parse-b", label: "02 — Understanding their tastes",       sub: "Mapping Person B's cultural fingerprint…",          icon: "◉" },
  { id: "qloo",   label: "03 — Searching the Qloo taste graph",   sub: "Finding hidden cultural relationships…",            icon: "✦" },
  { id: "bridge", label: "04 — Finding the cultural bridge",       sub: "Identifying overlap neither of you mentioned…",     icon: "◈" },
  { id: "plan",   label: "05 — Building your experience",          sub: "Creating something you'd both love…",               icon: "◆" },
];

interface AgentProgressProps {
  isRunning: boolean;
  onComplete?: () => void;
}

export function AgentProgress({ isRunning, onComplete }: AgentProgressProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isRunning) return;
    setCurrentStep(0);
    setCompleted(new Set());

    const timings = [1200, 1400, 2200, 1800, 1500];
    let elapsed = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timings.forEach((delay, i) => {
      elapsed += delay;
      timeouts.push(setTimeout(() => {
        setCurrentStep(i + 1);
        setCompleted((prev) => new Set([...prev, i]));
        if (i === timings.length - 1) setTimeout(() => onComplete?.(), 600);
      }, elapsed));
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isRunning, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--surface-1)" }}>
      <div className="w-full max-w-lg">
        {/* Header card */}
        <div className="rounded-2xl bg-white border p-6 mb-6 text-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "var(--accent-yellow-light)", color: "#8A6E00" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
            Qloo Taste AI™ analyzing
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Finding your cultural match</h2>
          <p className="text-sm text-[#9B9BAD] mt-1">This usually takes about 10 seconds</p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isDone = completed.has(i);
            const isActive = currentStep === i;
            const isPending = currentStep < i;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500 ${
                  isDone
                    ? "bg-white border-[#4CAF50]/30 shadow-sm"
                    : isActive
                      ? "bg-white border-[#F5C518]/60 shadow-md"
                      : "bg-white/50 border-transparent opacity-50"
                }`}
              >
                {/* Step icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  isDone
                    ? "bg-[#4CAF50] text-white"
                    : isActive
                      ? "bg-[#F5C518] text-[#1A1A2E]"
                      : "bg-[#F1EFEA] text-[#9B9BAD]"
                }`}>
                  {isDone ? "✓" : <span className={isActive ? "animate-pulse" : ""}>{step.icon}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? "text-[#4CAF50]" : isActive ? "text-[#1A1A2E]" : "text-[#9B9BAD]"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDone ? "text-[#9B9BAD]" : isActive ? "text-[#5A5A72]" : "text-[#C4C4CC]"}`}>
                    {isDone ? "Complete" : step.sub}
                  </p>
                </div>

                {isActive && (
                  <div className="flex gap-1 shrink-0">
                    {[0, 1, 2].map((dot) => (
                      <span key={dot} className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce"
                        style={{ animationDelay: `${dot * 120}ms` }} />
                    ))}
                  </div>
                )}
                {isDone && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <span className="text-[#4CAF50] text-xs">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Cultural intelligence by <span className="font-semibold text-[#5A5A72]">Qloo Taste AI™</span>
        </p>
      </div>
    </div>
  );
}
