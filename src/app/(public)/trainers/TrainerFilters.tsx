"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface TrainerFiltersProps {
  initialCity: string;
  initialServiceType: string;
  initialSport: string;
  availableCities: string[];
  availableServiceTypes: string[];
  availableSports: Sport[];
}

export function TrainerFilters({
  initialCity,
  initialServiceType,
  initialSport,
  availableCities,
  availableServiceTypes,
  availableSports,
}: TrainerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(newCity: string, newServiceType: string, newSport: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newCity) params.set("city", newCity); else params.delete("city");
    if (newServiceType) params.set("serviceType", newServiceType); else params.delete("serviceType");
    if (newSport) params.set("sport", newSport); else params.delete("sport");
    startTransition(() => router.push(`/trainers?${params.toString()}`));
  }

  const toggleCity = (c: string) => navigate(initialCity === c ? "" : c, initialServiceType, initialSport);
  const toggleService = (s: string) => navigate(initialCity, initialServiceType === s ? "" : s, initialSport);
  const toggleSport = (s: string) => navigate(initialCity, initialServiceType, initialSport === s ? "" : s);

  const hasFilter = initialCity || initialServiceType || initialSport;

  return (
    <div className={`flex flex-col gap-4 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>

      {/* Sporto šaka — PIRMA */}
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

      {/* Miestas */}
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

      {/* Paslaugos tipas */}
      {availableServiceTypes.length > 0 && (
        <div>
          <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-2">Paslaugos tipas</p>
          <div className="flex flex-wrap gap-2">
            {availableServiceTypes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
                  initialServiceType === s
                    ? "bg-[#FF5733] text-white border-[#FF5733]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#FF5733] hover:text-[#FF5733]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilter && (
        <div>
          <button
            type="button"
            onClick={() => navigate("", "", "")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF5733] transition-colors"
          >
            <X size={14} />
            Išvalyti filtrus
          </button>
        </div>
      )}
    </div>
  );
}
