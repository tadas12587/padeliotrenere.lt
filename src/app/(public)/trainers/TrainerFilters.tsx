"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import FilterBar, { FilterGroup } from "@/components/FilterBar";

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

  function navigate(city: string, serviceType: string, sport: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city); else params.delete("city");
    if (serviceType) params.set("serviceType", serviceType); else params.delete("serviceType");
    if (sport) params.set("sport", sport); else params.delete("sport");
    startTransition(() => router.push(`/trainers?${params.toString()}`));
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
          onChange: (v: string) => navigate(initialCity, initialServiceType, v),
        }]
      : []),
    ...(availableCities.length > 0
      ? [{
          key: "city",
          label: "Miestas",
          allLabel: "Visi miestai",
          options: availableCities.map((c) => ({ value: c, label: c })),
          value: initialCity,
          onChange: (v: string) => navigate(v, initialServiceType, initialSport),
        }]
      : []),
    ...(availableServiceTypes.length > 0
      ? [{
          key: "serviceType",
          label: "Paslauga",
          allLabel: "Visos paslaugos",
          options: availableServiceTypes.map((s) => ({ value: s, label: s })),
          value: initialServiceType,
          onChange: (v: string) => navigate(initialCity, v, initialSport),
        }]
      : []),
  ];

  return (
    <FilterBar
      groups={groups}
      onClear={() => navigate("", "", "")}
      isPending={isPending}
    />
  );
}
