"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, Globe, Music2 } from "lucide-react";

function IconInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFacebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconYoutube({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

interface Props {
  displayName: string;
  city: string;
  photoUrl: string | null;
  gallery: { id: string; url: string }[];
  avgRating: number | null;
  reviewCount: number;
  isFeatured: boolean;
  trainerId: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
}

export default function TrainerHero({
  displayName,
  city,
  photoUrl,
  gallery,
  avgRating,
  reviewCount,
  isFeatured,
  trainerId,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  tiktokUrl,
  websiteUrl,
}: Props) {
  // Profile photo first, then gallery photos — deduplicated by URL
  const bgPhotos = [
    ...(photoUrl ? [{ id: "profile", url: photoUrl }] : []),
    ...gallery,
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

  const socialLinks = [
    { url: instagramUrl, Icon: IconInstagram, label: "Instagram" },
    { url: facebookUrl, Icon: IconFacebook, label: "Facebook" },
    { url: youtubeUrl, Icon: IconYoutube, label: "YouTube" },
    { url: tiktokUrl, Icon: Music2, label: "TikTok" },
    { url: websiteUrl, Icon: Globe, label: "Svetainė" },
  ].filter((s) => s.url);

  return (
    <section className="relative overflow-hidden min-h-[480px] lg:min-h-[580px]">
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
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
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
      <div className="relative z-10 container-tight flex flex-col justify-end min-h-[480px] lg:min-h-[580px] pb-10 pt-20 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
          {/* Circular avatar — profile photo */}
          {photoUrl && (
            <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-green-500/25 text-green-400 border border-green-500/40 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider">
                Patvirtintas
              </span>
              {isFeatured && (
                <span className="bg-[#FF5733]/25 text-[#FF5733] border border-[#FF5733]/40 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider">
                  Rekomenduojamas
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-5xl font-900 mb-3 drop-shadow-lg leading-tight">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin size={15} className="text-[#FF5733]" />
                <span>{city}</span>
              </div>

              {avgRating !== null && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(avgRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-white/30 fill-white/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-700 text-[#FF5733] text-sm">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-white/60 text-xs">
                    ({reviewCount})
                  </span>
                </div>
              )}

              {/* Social media icons */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ url, Icon, label }) => (
                    <a
                      key={label}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <Link
              href={`/booking?trainerId=${trainerId}`}
              className="btn-primary py-3 px-6 text-center whitespace-nowrap"
            >
              Rezervuoti
            </Link>
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
