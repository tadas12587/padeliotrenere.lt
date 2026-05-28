export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  Star,
  MapPin,
  ArrowRight,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-[#0d0d0d] text-white overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#16213e] via-[#0d0d0d] to-[#0d0d0d]" />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#e94560]/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#0f3460]/30 blur-3xl" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(233,69,96,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(233,69,96,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="container-wide relative z-10 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#e94560]/15 border border-[#e94560]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#e94560] animate-pulse" />
            <span className="text-[#e94560] text-sm font-700 uppercase tracking-wider">
              Padelio trenerių platforma
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-900 leading-[1.05] mb-6">
            Rask savo{" "}
            <span className="text-[#e94560]">padelio trenerį</span>{" "}
            Lietuvoje
          </h1>
          <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mb-8 leading-relaxed">
            Profesionalūs padelio treneriai visame šalyje. Pasirink trenerį, areną
            ir rezervuok laiką – viskas vienoje vietoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/trainers" className="btn-primary text-base py-4 px-8">
              🎾 Rasti trenerį
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/booking"
              className="btn-secondary text-base py-4 px-8 border-white/30 text-white hover:border-[#e94560] hover:text-[#e94560]"
            >
              Rezervuoti treniruotę
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Featured Trainers ─────────────────────────────────────────────────────────
async function FeaturedTrainersSection() {
  const trainers = await prisma.trainerProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      services: { take: 3 },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
    take: 6,
  });

  if (trainers.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-tight">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
              Treneriai
            </span>
            <h2 className="text-4xl font-900 mt-2 text-[#16213e]">
              Mūsų treneriai
            </h2>
          </div>
          <Link
            href="/trainers"
            className="hidden sm:flex items-center gap-1 text-sm font-600 text-[#e94560] hover:underline"
          >
            Visi treneriai <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((t) => {
            const avgRating =
              t.reviews.length > 0
                ? t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length
                : null;
            return (
              <Link
                key={t.id}
                href={`/trainers/${t.id}`}
                className="card p-6 flex flex-col gap-4 group"
              >
                {/* Photo / Avatar */}
                <div className="flex items-center gap-4">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photoUrl}
                      alt={t.displayName}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#e94560]/10 flex items-center justify-center text-2xl font-900 text-[#e94560]">
                      {t.displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-800 text-[#16213e] truncate">{t.displayName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {t.city}
                    </p>
                    {avgRating !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-[#e94560] fill-[#e94560]" />
                        <span className="text-xs font-700 text-gray-700">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({t.reviews.length})
                        </span>
                      </div>
                    )}
                  </div>
                  {t.isFeatured && (
                    <span className="shrink-0 text-xs font-700 bg-[#e94560]/10 text-[#e94560] px-2 py-0.5 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Services */}
                {t.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.services.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-xs font-600 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {t.services.length} paslaug{t.services.length === 1 ? "a" : "os"}
                  </span>
                  <span className="text-sm font-700 text-[#e94560] group-hover:underline">
                    Žiūrėti profilį →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/trainers" className="btn-primary">
            Visi treneriai <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Arenas ────────────────────────────────────────────────────────────────────
async function ArenasSection() {
  const arenas = await prisma.arena.findMany({
    where: { status: "APPROVED" },
    include: {
      trainers: { where: { trainer: { status: "APPROVED" } } },
    },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  if (arenas.length === 0) return null;

  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="container-tight">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
              Arenos
            </span>
            <h2 className="text-4xl font-900 mt-2 text-[#16213e]">
              Kortai ir arenos
            </h2>
          </div>
          <Link
            href="/arenas"
            className="hidden sm:flex items-center gap-1 text-sm font-600 text-[#e94560] hover:underline"
          >
            Visos arenos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {arenas.map((a) => (
            <Link
              key={a.id}
              href={`/arenas/${a.id}`}
              className="card overflow-hidden group"
            >
              {a.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.photoUrl}
                  alt={a.name}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-[#16213e] to-[#0f3460] flex items-center justify-center text-4xl">
                  🏟️
                </div>
              )}
              <div className="p-4">
                <p className="font-800 text-[#16213e] mb-1">{a.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin size={12} />
                  {a.city}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={11} />
                  {a.trainers.length} trener{a.trainers.length === 1 ? "is" : "ių"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { step: "01", title: "Pasirink trenerį", desc: "Naršyk trenerius pagal miestą arba paslaugų tipą." },
    { step: "02", title: "Žiūrėk laisvus laikus", desc: "Trenerio profilyje matosi visi laisvi laikai ir arenos." },
    { step: "03", title: "Rezervuok", desc: "Vienu paspaudimu rezervuok patogų laiką." },
    { step: "04", title: "Ateik ir žaisk!", desc: "Gauk patvirtinimą el. paštu ir atvyk į kortą." },
  ];

  return (
    <section className="py-20 bg-[#16213e] text-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Kaip tai veikia?
          </span>
          <h2 className="text-4xl font-900 mt-2">4 žingsniai iki treniruotės</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e94560]/15 border border-[#e94560]/30 flex items-center justify-center mx-auto mb-5">
                <span className="text-[#e94560] font-900 text-xl">{step}</span>
              </div>
              <h3 className="font-800 text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/trainers" className="btn-primary">
            Rasti trenerį <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Recent Reviews ────────────────────────────────────────────────────────────
async function ReviewsSection() {
  const reviews = await prisma.review.findMany({
    where: { trainer: { status: "APPROVED" } },
    include: {
      author: { select: { name: true } },
      trainer: { select: { displayName: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Atsiliepimai
          </span>
          <h2 className="text-4xl font-900 mt-2 text-[#16213e]">
            Ką sako klientai
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="card p-7 flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-[#e94560] fill-[#e94560]" />
                ))}
              </div>
              {r.comment && (
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e94560]/10 flex items-center justify-center font-800 text-[#e94560] text-sm">
                    {(r.author.name ?? "?")[0].toUpperCase()}
                  </div>
                  <p className="font-700 text-sm text-[#16213e]">
                    {r.author.name ?? "Anonimai"}
                  </p>
                </div>
                <Link
                  href={`/trainers/${r.trainer.id}`}
                  className="text-xs text-gray-400 hover:text-[#e94560] transition-colors"
                >
                  {r.trainer.displayName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#e94560] to-[#c73352]">
      <div className="container-tight text-center text-white">
        <h2 className="text-4xl lg:text-5xl font-900 mb-4">
          Pradėk savo padelio kelionę šiandien
        </h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
          Rask geriausią trenerį šalia tavęs ir rezervuok pirmą treniruotę.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/trainers"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#e94560] font-800 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            🎾 Rasti trenerį
          </Link>
          <Link
            href="/auth/register-trainer"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-700 px-8 py-4 rounded-lg hover:bg-white hover:text-[#e94560] transition-all"
          >
            Tapti treneriu
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTrainersSection />
      <ArenasSection />
      <HowItWorksSection />
      <ReviewsSection />
      <CTASection />
    </>
  );
}
