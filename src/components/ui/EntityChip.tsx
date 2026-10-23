"use client";

import { X } from "lucide-react";
import type { ExtractedEntity } from "@/types";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  film:    { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200", icon: "🎬" },
  music:   { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",   icon: "🎵" },
  food:    { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200", icon: "🍜" },
  fashion: { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",   icon: "👟" },
  travel:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",icon: "✈️" },
  hobby:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   icon: "🎯" },
  other:   { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-200",   icon: "✦"  },
};

interface EntityChipProps {
  entity: ExtractedEntity;
  onRemove?: (id: string) => void;
  compact?: boolean;
}

export function EntityChip({ entity, onRemove, compact }: EntityChipProps) {
  const s = CATEGORY_STYLES[entity.category] ?? CATEGORY_STYLES.other;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-all
        ${s.bg} ${s.text} ${s.border}
        ${compact ? "text-xs px-2 py-0.5" : "text-sm"}
      `}
    >
      <span className="text-xs leading-none">{s.icon}</span>
      <span>{entity.qlooEntityName ?? entity.text}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(entity.id)}
          className="ml-0.5 rounded-full p-0.5 opacity-50 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${entity.text}`}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
