"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

interface Props {
  photos: Photo[];
}

export default function HeroBanner({ photos }: Props) {
  const hasBg = photos.length > 0;
  const [currentIdx, setCurrentIdx] = useState(0);

  const advance = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(advance, 5000);
    return () => clearInterval(t);
  }, [advance, photos.length]);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background images — crossfade */}
      {hasBg ? (
        photos.map((photo, i) => (
          <div
            key={photo.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentIdx ? 1 : 0 }}
            aria-hidden={i !== currentIdx}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          </div>
        ))
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B5C71] via-[#041f28] to-[#041f28]" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,87,51,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,87,51,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </>
      )}

      {/* Heavy dark overlay */}
      {hasBg && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.58) 100%)",
          }}
        />
      )}

      {/* Hero content */}
      <div className="container-wide relative z-10 py-24 text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#FF5733]/15 border border-[#FF5733]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF5733] animate-pulse" />
            <span className="text-[#FF5733] text-sm font-700 uppercase tracking-wider">
              Sporto trenerių platforma
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-900 leading-[1.05] mb-6 drop-shadow-lg">
            Rask savo{" "}
            <span className="text-[#FF5733]">sporto trenerį</span>{" "}
            Lietuvoje
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl max-w-2xl mb-8 leading-relaxed">
            Profesionalūs treneriai visame šalyje – padelis, tenisas, krepšinis ir daugiau.
            Pasirink trenerį, areną ir rezervuok laiką.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/trainers" className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2">
              🏆 Rasti trenerį
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 text-base py-4 px-8 rounded-lg font-700 border-2 border-white/30 text-white hover:border-[#FF5733] hover:text-[#FF5733] transition-all"
            >
              Rezervuoti treniruotę
            </Link>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              aria-label={`Nuotrauka ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIdx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
