"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

interface Props {
  photos: Photo[];
}

const PREVIEW_COUNT = 5;

export default function GallerySection({ photos }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const preview = photos.slice(0, PREVIEW_COUNT);
  const remaining = photos.length - PREVIEW_COUNT;

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="card p-6">
        <h2 className="text-lg font-800 text-[#0B5C71] mb-4">Galerija</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {preview.map((photo, i) => {
            const isOverlay = i === PREVIEW_COUNT - 1 && remaining > 0;
            return (
              <button
                key={photo.id}
                onClick={() => openAt(isOverlay ? PREVIEW_COUNT - 1 : i)}
                className="relative aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {isOverlay && (
                  <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center">
                    <span className="text-white font-900 text-2xl leading-none">+{remaining + 1}</span>
                    <span className="text-white/75 text-xs mt-1">daugiau</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {photos.length > PREVIEW_COUNT && (
          <button
            onClick={() => openAt(0)}
            className="mt-3 w-full py-2.5 text-sm font-700 text-[#0B5C71] border border-gray-200 rounded-xl hover:bg-[#0B5C71] hover:text-white hover:border-[#0B5C71] transition-colors"
          >
            Peržiūrėti visą galeriją ({photos.length})
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Uždaryti"
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-600 pointer-events-none">
            {idx + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              className="absolute left-3 sm:left-6 z-10 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Ankstesnė"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative flex items-center justify-center w-full h-full px-16 sm:px-20 py-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[idx].url}
              alt=""
              className="max-w-full max-h-full rounded-xl object-contain shadow-2xl select-none"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              className="absolute right-3 sm:right-6 z-10 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Kita"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Dot indicators */}
          {photos.length > 1 && photos.length <= 20 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  aria-label={`Nuotrauka ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
