"use client";

import { useState, useRef } from "react";
import { PersonInput } from "./ui/PersonInput";
import { AgentProgress } from "./ui/AgentProgress";
import { CulturalBridgeViz } from "./ui/CulturalBridgeViz";
import { UnexpectedMatchCard } from "./ui/UnexpectedMatchCard";
import { SharedPlan } from "./ui/SharedPlan";
import { MatchScoreBar } from "./ui/MatchScoreBar";
import { QlooDiscovered } from "./ui/QlooDiscovered";
import { ReasoningDrawer } from "./ui/ReasoningDrawer";
import { DemoSelector } from "./ui/DemoSelector";
import type { AnalyzeRequest, AnalyzeResponse, DemoProfile, PersonProfile } from "@/types";
import { Sparkles, MapPin, ArrowRight, RefreshCw, Zap, ChevronDown } from "lucide-react";

const GOALS = [
  "Plan something we'd both love",
  "Date night", "Saturday plan", "Dinner",
  "Movie night", "Weekend trip", "Hangout", "Surprise us",
];
const BUDGETS = ["Flexible","₹1,000","₹2,500","₹5,000","₹10,000+","$50","$100","$200+"];

function emptyProfile(): PersonProfile {
  return { name: "", rawInput: "", entities: [] };
}

type Screen = "input" | "analyzing" | "results";

export function TasteMatchApp() {
  const [screen, setScreen] = useState<Screen>("input");
  const [personA, setPersonA] = useState<PersonProfile>(emptyProfile());
  const [personB, setPersonB] = useState<PersonProfile>(emptyProfile());
  const [location, setLocation] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [budget, setBudget] = useState("Flexible");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRequest = useRef<AnalyzeRequest | null>(null);

  function startAnalysis(req: AnalyzeRequest) {
    pendingRequest.current = req;
    setPersonA(req.personA); setPersonB(req.personB);
    setLocation(req.location); setGoal(req.goal); setBudget(req.budget);
    setError(""); setIsSubmitting(true); setScreen("analyzing");
  }

  async function handleAnimationComplete() {
    const req = pendingRequest.current;
    if (!req) return;

    // Final safety check — should never happen but guards against stale state
    if (!req.personA?.entities?.length || !req.personB?.entities?.length) {
      setError("No preferences were extracted. Please try again and click the ↗ button to extract before finding a match.");
      setScreen("input");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data: AnalyzeResponse = await res.json();
      if (!data.success) throw new Error(data.error ?? "Analysis failed");
      setResult(data); setScreen("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setScreen("input");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoSelect(demo: DemoProfile) {
    setIsSubmitting(true); setError("");
    try {
      const [resA, resB] = await Promise.all([
        fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: demo.personA.rawInput }) }),
        fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: demo.personB.rawInput }) }),
      ]);
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);

      if (!dataA.success) {
        throw new Error(dataA.error ?? "Couldn't parse Person A preferences");
      }
      if (!dataB.success) {
        throw new Error(dataB.error ?? "Couldn't parse Person B preferences");
      }

      startAnalysis({
        personA: { name: demo.personA.name, ageRange: demo.personA.ageRange, rawInput: demo.personA.rawInput, entities: dataA.success ? dataA.profile.entities : [] },
        personB: { name: demo.personB.name, ageRange: demo.personB.ageRange, rawInput: demo.personB.rawInput, entities: dataB.success ? dataB.profile.entities : [] },
        location: demo.location, goal: demo.goal, budget: "Flexible",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo failed");
      setIsSubmitting(false);
    }
  }

  async function handleFindMatch() {
    setError("");

    let pA = personA;
    let pB = personB;

    // Auto-parse any person who has rawInput but no extracted entities yet
    const needsParseA = !pA.entities.length && pA.rawInput.trim();
    const needsParseB = !pB.entities.length && pB.rawInput.trim();

    if (needsParseA || needsParseB) {
      setIsSubmitting(true);
      try {
        const parsePromises = [
          needsParseA
            ? fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: pA.rawInput }) })
            : Promise.resolve(null),
          needsParseB
            ? fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: pB.rawInput }) })
            : Promise.resolve(null),
        ];
        const [resA, resB] = await Promise.all(parsePromises);
        if (resA) {
          const dataA = await resA.json();
          if (dataA.success && dataA.profile.entities.length) {
            pA = { ...pA, entities: dataA.profile.entities };
            setPersonA(pA);
          } else if (!dataA.success && dataA.error) {
            setError(`Person A: ${dataA.error}`);
            setIsSubmitting(false);
            return;
          }
        }
        if (resB) {
          const dataB = await resB.json();
          if (dataB.success && dataB.profile.entities.length) {
            pB = { ...pB, entities: dataB.profile.entities };
            setPersonB(pB);
          } else if (!dataB.success && dataB.error) {
            setError(`Person B: ${dataB.error}`);
            setIsSubmitting(false);
            return;
          }
        }
      } catch {
        // parse failed — will hit the validation below
      } finally {
        setIsSubmitting(false);
      }
    }

    // Now validate
    if (!pA.entities.length && !pA.rawInput.trim()) {
      setError("Person A needs some preferences — type what they love and click ↗ to extract.");
      return;
    }
    if (!pB.entities.length && !pB.rawInput.trim()) {
      setError("Person B needs some preferences — type what they love and click ↗ to extract.");
      return;
    }
    if (!pA.entities.length) {
      setError("Couldn't extract preferences for Person A. Try being more specific — e.g. \"I love Interstellar, jazz, and sushi.\"");
      return;
    }
    if (!pB.entities.length) {
      setError("Couldn't extract preferences for Person B. Try being more specific — e.g. \"I love The Weeknd, Italian food, live music.\"");
      return;
    }

    startAnalysis({ personA: pA, personB: pB, location, goal, budget });
  }

  function handleReset() {
    setScreen("input"); setResult(null); setError("");
    setPersonA(emptyProfile()); setPersonB(emptyProfile());
    setLocation(""); setGoal(GOALS[0]); setBudget("Flexible");
    setIsSubmitting(false); pendingRequest.current = null;
  }

  // ── Analyzing ────────────────────────────────────────────────────────────────
  if (screen === "analyzing") {
    return <AgentProgress isRunning={true} onComplete={handleAnimationComplete} />;
  }

  // ── Results ───────────────────────────────────────────────────────────────────
  if (screen === "results" && result?.result) {
    const { result: res } = result;
    const displayA = personA.name || "Person A";
    const displayB = personB.name || "Person B";

    return (
      <div className="min-h-screen" style={{ background: "var(--surface-1)" }}>
        {/* Sticky navbar */}
        <nav className="sticky top-0 z-20 bg-white border-b" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F5C518] flex items-center justify-center font-black text-[#1A1A2E] text-sm">T</div>
                <span className="font-black text-[#1A1A2E]">TasteMatch</span>
              </div>
              <span className="hidden sm:inline text-[#E8E5DE]">|</span>
              <span className="hidden sm:inline text-sm text-[#9B9BAD]">{displayA} × {displayB}</span>
              {!result.qlooAvailable && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Qloo offline</span>
              )}
            </div>
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-sm font-medium text-[#5A5A72] hover:text-[#1A1A2E] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#F1EFEA]">
              <RefreshCw size={14} /> <span className="hidden sm:inline">Find Another Match</span>
            </button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          {/* Hero */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            {/* Yellow top band */}
            <div className="px-8 py-6 text-center" style={{ background: "#F5C518" }}>
              <p className="text-sm font-semibold text-[#1A1A2E]/70 mb-1">
                {displayA} × {displayB} · {location}
              </p>
              <h1 className="text-4xl font-black text-[#1A1A2E]">Your Cultural Match 🎉</h1>
            </div>
            {/* White info strip */}
            <div className="bg-white px-8 py-3 flex items-center justify-center gap-6 border-t" style={{ borderColor: "#F5C51840" }}>
              <div className="flex items-center gap-1.5 text-sm text-[#5A5A72]">
                <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                Analyzed by Qloo Taste AI™
              </div>
              {location && (
                <div className="flex items-center gap-1 text-sm text-[#9B9BAD]">
                  <MapPin size={12} /> {location}
                </div>
              )}
            </div>
          </div>

          <MatchScoreBar score={res.matchScore} />
          <CulturalBridgeViz bridge={res.culturalBridge} personA={personA} personB={personB} />
          <UnexpectedMatchCard match={res.unexpectedMatch} />
          <SharedPlan items={res.sharedPlan} whyItWorks={res.whyItWorks} />
          <ReasoningDrawer reasoning={res.reasoning} />
          <QlooDiscovered entities={res.qlooDiscovered} qlooAvailable={result.qlooAvailable} />

          {/* CTA */}
          <div className="text-center py-6">
            <button onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1A1A2E] text-white font-semibold hover:bg-[#2D2D4E] transition-all shadow-md hover:shadow-lg">
              Find Another Match <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Input screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--surface-1)" }}>
      {showDemo && (
        <DemoSelector
          onSelect={(demo) => { setShowDemo(false); handleDemoSelect(demo); }}
          onClose={() => setShowDemo(false)}
        />
      )}

      {/* Navbar */}
      <nav className="bg-white border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5C518] flex items-center justify-center font-black text-[#1A1A2E] text-sm">T</div>
            <span className="font-black text-[#1A1A2E]">TasteMatch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[#9B9BAD] px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--border)" }}>
              Powered by Qloo Taste AI™
            </span>
            <button onClick={() => setShowDemo(true)} disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1A1A2E] bg-[#F5C518] hover:bg-[#D4A800] transition-all shadow-sm">
              Try Demo
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: "var(--accent-yellow-light)", color: "#8A6E00" }}>
            <Zap size={12} className="text-[#F5C518]" />
            Qloo Taste AI™ · Cultural intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-[#1A1A2E] tracking-tight leading-[1.05] mb-4">
            TasteMatch
          </h1>
          <p className="text-xl text-[#5A5A72] font-medium mb-2">
            Find the cultural overlap between two people.
          </p>
          <p className="text-sm text-[#9B9BAD] max-w-sm mx-auto leading-relaxed">
            Not just what you like —{" "}
            <span className="text-[#5A5A72] italic font-medium">why</span> you like it, and what that means
            you might <span className="text-[#5A5A72] italic font-medium">love</span> together.
          </p>
        </div>

        {/* ── Person inputs ── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <PersonInput
            label="Person A"
            personLabel="A"
            profile={personA}
            onChange={setPersonA}
            placeholder={`"I love Interstellar, A.R. Rahman, Japanese food, quiet cafés…"`}
          />
          <PersonInput
            label="Person B"
            personLabel="B"
            profile={personB}
            onChange={setPersonB}
            placeholder={`"I love Dune, The Weeknd, Italian food, live music…"`}
          />
        </div>

        {/* ── Settings card ── */}
        <div className="rounded-2xl bg-white border shadow-sm p-5 mb-5" style={{ borderColor: "var(--border)" }}>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9B9BAD] mb-2">
                📍 Location
              </label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                <input
                  type="text"
                  placeholder="City or neighbourhood"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 pl-8 text-sm text-[#1A1A2E] placeholder-[#C4C4CC] outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C51820] transition-all"
                  style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                />
              </div>
            </div>
            {/* Goal */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9B9BAD] mb-2">
                🎯 Goal
              </label>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-sm text-[#1A1A2E] outline-none focus:border-[#F5C518] transition-all"
                  style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                >
                  {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
            </div>
            {/* Budget */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9B9BAD] mb-2">
                💰 Budget
              </label>
              <div className="relative">
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-sm text-[#1A1A2E] outline-none focus:border-[#F5C518] transition-all"
                  style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                >
                  {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleFindMatch}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: "#1A1A2E", color: "white" }}
          >
            <Sparkles size={18} className="text-[#F5C518]" />
            {isSubmitting ? "Extracting preferences…" : "Find Our Cultural Match"}
            <ArrowRight size={18} />
          </button>
          <p className="text-xs text-[#9B9BAD] text-center max-w-sm">
            Type what each person loves above — we'll auto-extract their preferences when you click the button.
            Or click ↗ in each box first for a preview.
          </p>
        </div>

        {/* ── How it works ── */}
        <div className="mt-14 rounded-2xl bg-white border shadow-sm p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mb-6 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { icon: "💬", label: "Describe your tastes",   sub: "In plain language",             color: "bg-[#FFF8DC]" },
              { icon: "✦",  label: "Qloo maps cultural DNA", sub: "10T+ behavioral signals",       color: "bg-[#E8F5E9]" },
              { icon: "◈",  label: "AI finds the bridge",    sub: "Hidden cultural overlap",       color: "bg-purple-50" },
              { icon: "🎉", label: "Get the unexpected",     sub: "Something new together",        color: "bg-orange-50" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-1 ${step.color}`}>
                  {step.icon}
                </div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{step.label}</p>
                <p className="text-xs text-[#9B9BAD]">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-[#C4C4CC] mt-8 pb-4">
          Built for the Qloo LLM Hackathon · © 2026 TasteMatch
        </p>
      </div>
    </div>
  );
}
