"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

interface ArenaFiltersProps {
  initialCity: string;
  availableCities: string[];
}

export function ArenaFilters({ initialCity, availableCities }: ArenaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(newCity: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newCity) params.set("city", newCity); else params.delete("city");
    startTransition(() => router.push(`/arenas?${params.toString()}`));
  }

  function toggleCity(c: string) {
    navigate(initialCity === c ? "" : c);
  }

  return (
    <div className={`flex flex-col gap-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
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

      {initialCity && (
        <button
          type="button"
          onClick={() => navigate("")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF5733] transition-colors w-fit"
        >
          <X size={14} />
          Išvalyti filtrus
        </button>
      )}
    </div>
  );
}
