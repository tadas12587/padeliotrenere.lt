"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

interface Props {
  name: string;
  city: string;
  address: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  photos: Photo[];
  mapsUrl: string;
  arenaId: string;
  courtBookingUrl: string | null;
}

export default function ArenaHero({
  name,
  city,
  address,
  logoUrl,
  bannerUrl,
  photos,
  mapsUrl,
  arenaId,
  courtBookingUrl,
}: Props) {
  // Banner first, then gallery photos — deduplicated by URL
  const bgPhotos = [
    ...(bannerUrl ? [{ id: "banner", url: bannerUrl }] : []),
    ...photos,
  ].filter((p, i, arr) => arr.findIndex((x) => x.url === p.url) === i);

  const hasBg = bgPhotos.length > 0;
  const [currentIdx, setCurrentIdx] = useState(0);

  const advance = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % bgPhotos.length);
  }, [bgPhotos.length]);

  useEffect(() => {
    if (bgPhotos.length <= 1) return;
    const t = setInterval(advance, 4500);
    return () => clearInterval(t);
  }, [advance, bgPhotos.length]);

  return (
    <section className="relative overflow-hidden min-h-[520px] lg:min-h-[640px]">
      {/* Background images — crossfade */}
      {hasBg ? (
        bgPhotos.map((photo, i) => (
          <div
            key={photo.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentIdx ? 1 : 0 }}
            aria-hidden={i !== currentIdx}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 25%" }} />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B5C71] to-[#083d4e]" />
      )}

      {/* Darkening overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: hasBg
            ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.12) 100%)"
            : "none",
        }}
      />

      {/* Content — anchored to bottom */}
      <div className="relative z-10 container-tight flex flex-col justify-end min-h-[520px] lg:min-h-[640px] pb-10 pt-20 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
          {/* Logo */}
          {logoUrl && (
            <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-lg border-2 border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Name + location */}
          <div className="flex-1 min-w-0">
            <span className="bg-green-500/25 text-green-400 border border-green-500/40 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Patvirtinta
            </span>
            <h1 className="text-3xl lg:text-5xl font-900 mb-3 drop-shadow-lg leading-tight">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin size={15} className="text-[#FF5733]" />
                <span>{city}{address ? `, ${address}` : ""}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20"
              >
                <ExternalLink size={11} />
                Google Maps
              </a>
            </div>
          </div>

          {/* CTAs */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <Link
              href={`/booking?arenaId=${arenaId}`}
              className="btn-primary py-3 px-6 text-center whitespace-nowrap"
            >
              Rezervuoti trenerį
            </Link>
            {courtBookingUrl && (
              <a
                href={courtBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 text-center whitespace-nowrap rounded-xl font-700 text-sm bg-white/15 hover:bg-white/25 border border-white/30 text-white transition-colors backdrop-blur-sm"
              >
                Rezervuoti kortą
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Slideshow dots */}
      {bgPhotos.length > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5">
          {bgPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              aria-label={`Nuotrauka ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
