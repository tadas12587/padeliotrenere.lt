"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

interface ArenaFiltersProps {
  initialCity: string;
  initialSport: string;
  availableCities: string[];
  availableSports: Array<{ id: string; name: string; slug: string; icon: string | null }>;
}

export function ArenaFilters({
  initialCity,
  initialSport,
  availableCities,
  availableSports,
}: ArenaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(newCity: string, newSport: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newCity) params.set("city", newCity); else params.delete("city");
    if (newSport) params.set("sport", newSport); else params.delete("sport");
    startTransition(() => router.push(`/arenas?${params.toString()}`));
  }

  function toggleCity(c: string) {
    navigate(initialCity === c ? "" : c, initialSport);
  }

  function toggleSport(s: string) {
    navigate(initialCity, initialSport === s ? "" : s);
  }

  const hasFilter = initialCity || initialSport;

  return (
    <div className={`flex flex-col gap-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {availableSports.length > 0 && (
        <div>
          <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-2">Sporto šaka</p>
          <div className="flex flex-wrap gap-2">
            {availableSports.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => toggleSport(sp.slug)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
                  initialSport === sp.slug
                    ? "bg-[#0B5C71] text-white border-[#0B5C71]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71] hover:text-[#0B5C71]"
                }`}
              >
                {sp.icon ? `${sp.icon} ` : ""}{sp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableCities.length > 0 && (
        <div>
          <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-2">Miestas</p>
          <div className="flex flex-wrap gap-2">
            {availableCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCity(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
                  initialCity === c
                    ? "bg-[#0B5C71] text-white border-[#0B5C71]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71] hover:text-[#0B5C71]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilter && (
        <button
          type="button"
          onClick={() => navigate("", "")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF5733] transition-colors w-fit"
        >
          <X size={14} />
          Išvalyti filtrus
        </button>
      )}
    </div>
  );
}
