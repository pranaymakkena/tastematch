"use client";

import { useState, useRef } from "react";
import { Send, Loader2, User } from "lucide-react";
import { EntityChip } from "./EntityChip";
import type { ExtractedEntity, PersonProfile } from "@/types";

interface PersonInputProps {
  label: string;
  personLabel: "A" | "B";
  profile: PersonProfile;
  onChange: (profile: PersonProfile) => void;
  placeholder?: string;
}

export function PersonInput({ label, personLabel, profile, onChange, placeholder }: PersonInputProps) {
  const [inputValue, setInputValue] = useState(profile.rawInput ?? "");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const accentA = { pill: "bg-[#F5C518] text-[#1A1A2E]", btn: "bg-[#F5C518] hover:bg-[#D4A800] text-[#1A1A2E]" };
  const accentB = { pill: "bg-[#4CAF50] text-white", btn: "bg-[#4CAF50] hover:bg-[#3d9140] text-white" };
  const accent = personLabel === "A" ? accentA : accentB;

  async function handleParse() {
    if (!inputValue.trim()) return;
    setIsParsing(true);
    setError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputValue }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Parse failed");
      onChange({
        ...data.profile,
        name: profile.name,
        ageRange: profile.ageRange,
        rawInput: inputValue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsParsing(false);
    }
  }

  function handleRemoveEntity(id: string) {
    onChange({ ...profile, entities: profile.entities.filter((e) => e.id !== id) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleParse(); }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm shadow-sm ${accent.pill}`}>
          {personLabel}
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A2E]">{label}</h3>
          <p className="text-xs text-[#9B9BAD]">Describe their cultural tastes</p>
        </div>
      </div>

      {/* Name + age */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
          <input
            type="text"
            placeholder="Name (optional)"
            value={profile.name ?? ""}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 pl-8 text-sm text-[#1A1A2E] placeholder-[#C4C4CC] outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C51820] transition-all bg-[#F8F7F4]"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <select
          value={profile.ageRange ?? ""}
          onChange={(e) => onChange({ ...profile, ageRange: e.target.value })}
          className="rounded-xl border px-2 py-2 text-sm text-[#5A5A72] outline-none focus:border-[#F5C518] transition-all bg-[#F8F7F4]"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">Age</option>
          <option value="18–24">18–24</option>
          <option value="25–34">25–34</option>
          <option value="35–44">35–44</option>
          <option value="45–54">45–54</option>
          <option value="55+">55+</option>
        </select>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? `"I love Interstellar, A.R. Rahman, Japanese food…"`}
          className="w-full resize-none rounded-xl border px-4 py-3 pr-12 text-sm text-[#1A1A2E] placeholder-[#C4C4CC] outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C51820] transition-all bg-[#F8F7F4] leading-relaxed"
          style={{ borderColor: "var(--border)" }}
          rows={3}
        />
        <button
          onClick={handleParse}
          disabled={isParsing || !inputValue.trim()}
          className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 ${accent.btn}`}
          aria-label="Extract preferences"
          title="Extract (⌘+Enter)"
        >
          {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-[#9B9BAD]">⌘+Enter to extract</p>

      {error && (
        <div className="mt-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>
      )}

      {/* Chips */}
      {profile.entities.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-semibold text-[#9B9BAD] uppercase tracking-wider mb-2">Extracted</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.entities.map((entity) => (
              <EntityChip key={entity.id} entity={entity} onRemove={handleRemoveEntity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
