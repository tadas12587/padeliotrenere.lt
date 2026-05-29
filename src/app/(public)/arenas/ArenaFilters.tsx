"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import FilterBar, { FilterGroup } from "@/components/FilterBar";

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

  function navigate(city: string, sport: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city); else params.delete("city");
    if (sport) params.set("sport", sport); else params.delete("sport");
    startTransition(() => router.push(`/arenas?${params.toString()}`));
  }

  const groups: FilterGroup[] = [
    ...(availableSports.length > 0
      ? [{
          key: "sport",
          label: "Sportas",
          allLabel: "Visi sportai",
          options: availableSports.map((s) => ({
            value: s.slug,
            label: s.name,
            icon: s.icon ?? undefined,
          })),
          value: initialSport,
          onChange: (v: string) => navigate(initialCity, v),
        }]
      : []),
    ...(availableCities.length > 0
      ? [{
          key: "city",
          label: "Miestas",
          allLabel: "Visi miestai",
          options: availableCities.map((c) => ({ value: c, label: c })),
          value: initialCity,
          onChange: (v: string) => navigate(v, initialSport),
        }]
      : []),
  ];

  return (
    <FilterBar
      groups={groups}
      onClear={() => navigate("", "")}
      isPending={isPending}
    />
  );
}
