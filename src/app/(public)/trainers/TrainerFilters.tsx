"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

interface TrainerFiltersProps {
  initialCity: string;
  initialServiceType: string;
}

export function TrainerFilters({
  initialCity,
  initialServiceType,
}: TrainerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [city, setCity] = useState(initialCity);
  const [serviceType, setServiceType] = useState(initialServiceType);

  function applyFilters(newCity: string, newServiceType: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newCity) {
      params.set("city", newCity);
    } else {
      params.delete("city");
    }
    if (newServiceType) {
      params.set("serviceType", newServiceType);
    } else {
      params.delete("serviceType");
    }
    startTransition(() => {
      router.push(`/trainers?${params.toString()}`);
    });
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCity(e.target.value);
  }

  function handleServiceTypeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setServiceType(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(city, serviceType);
  }

  function handleClear() {
    setCity("");
    setServiceType("");
    startTransition(() => {
      router.push("/trainers");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 items-end"
    >
      <div className="flex-1">
        <label
          htmlFor="city-filter"
          className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-1"
        >
          Miestas
        </label>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="city-filter"
            type="text"
            placeholder="pvz. Vilnius"
            value={city}
            onChange={handleCityChange}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/30 transition-all"
          />
        </div>
      </div>

      <div className="flex-1">
        <label
          htmlFor="service-filter"
          className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-1"
        >
          Paslaugos tipas
        </label>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="service-filter"
            type="text"
            placeholder="pvz. Individualios"
            value={serviceType}
            onChange={handleServiceTypeChange}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/30 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          {isPending ? "Ieškoma..." : "Ieškoti"}
        </button>
        {(city || serviceType) && (
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary py-2.5 px-4 text-sm"
          >
            Išvalyti
          </button>
        )}
      </div>
    </form>
  );
}
