"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  allLabel?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface Props {
  groups: FilterGroup[];
  onClear: () => void;
  isPending?: boolean;
}

export default function FilterBar({ groups, onClear, isPending }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const hasFilter = groups.some((g) => g.value !== "");

  useEffect(() => {
    if (!openKey) return;
    function handler(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openKey]);

  // Close on Escape
  useEffect(() => {
    if (!openKey) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenKey(null);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openKey]);

  return (
    <div
      ref={barRef}
      className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {groups.map((group) => {
        const isOpen = openKey === group.key;
        const selected = group.value;
        const selectedOpt = group.options.find((o) => o.value === selected);

        return (
          <div key={group.key} className="relative">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : group.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-600 transition-all select-none ${
                selected
                  ? "bg-[#0B5C71] text-white border-[#0B5C71] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71] hover:text-[#0B5C71]"
              } ${isOpen ? "ring-2 ring-[#0B5C71]/20" : ""}`}
            >
              {selectedOpt ? (
                <span className="flex items-center gap-1.5">
                  {selectedOpt.icon && <span>{selectedOpt.icon}</span>}
                  {selectedOpt.label}
                </span>
              ) : (
                <span>{group.label}</span>
              )}
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 z-30 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 min-w-[190px] max-h-72 overflow-y-auto">
                {/* All / reset option */}
                <button
                  type="button"
                  onClick={() => { group.onChange(""); setOpenKey(null); }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    !selected
                      ? "font-700 text-[#0B5C71] bg-[#0B5C71]/6"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {group.allLabel ?? `Visi`}
                  {!selected && <Check size={14} className="ml-auto text-[#0B5C71]" />}
                </button>

                <div className="h-px bg-gray-100 mx-3 my-1" />

                {group.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { group.onChange(opt.value === selected ? "" : opt.value); setOpenKey(null); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      opt.value === selected
                        ? "font-700 text-[#0B5C71] bg-[#0B5C71]/6"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.icon && <span className="text-base">{opt.icon}</span>}
                    <span>{opt.label}</span>
                    {opt.value === selected && (
                      <Check size={14} className="ml-auto text-[#0B5C71]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {hasFilter && (
        <button
          type="button"
          onClick={() => { onClear(); setOpenKey(null); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-[#FF5733] transition-colors"
        >
          <X size={14} />
          Išvalyti
        </button>
      )}
    </div>
  );
}
