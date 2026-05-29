"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import Script from "next/script";

export interface PlaceResult {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface Props {
  address: string;
  city: string;
  onAddressChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
}

const INPUT_CLS =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]";

export default function LocationPicker({
  address,
  city,
  onAddressChange,
  onCityChange,
  onPlaceSelect,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackRef = useRef(onPlaceSelect);
  callbackRef.current = onPlaceSelect;
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // If Google already loaded (e.g. SPA navigation back to this page)
  useEffect(() => {
    if ((window as any).google?.maps?.places) setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!apiKey || !scriptLoaded || !inputRef.current) return;
    const google = (window as any).google;
    if (!google?.maps?.places) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "address_components"],
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry) return;

      let placeCity = "";
      for (const comp of place.address_components || []) {
        if (comp.types.includes("locality")) { placeCity = comp.long_name; break; }
        if (comp.types.includes("administrative_area_level_1")) placeCity = comp.long_name;
      }

      callbackRef.current({
        address: place.formatted_address ?? "",
        city: placeCity,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });

    return () => google.maps.event.removeListener(listener);
  }, [apiKey, scriptLoaded]);

  return (
    <>
      {apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`}
          onLoad={() => setScriptLoaded(true)}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">Miestas</label>
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Pvz., Vilnius"
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5 flex items-center gap-1.5">
            Adresas
            {apiKey && (
              <span className="text-xs text-[#FF5733] font-400 flex items-center gap-0.5">
                <MapPin size={10} /> Google Maps
              </span>
            )}
          </label>

          {apiKey ? (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  placeholder="Ieškoti adreso..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Pasirinkite iš pasiūlymų – automatiškai išsaugos koordinates
              </p>
            </>
          ) : (
            <input
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className={INPUT_CLS}
            />
          )}
        </div>
      </div>
    </>
  );
}
