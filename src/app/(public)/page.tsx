export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Star,
  MapPin,
  ArrowRight,
  ChevronRight,
  Users,
} from "lucide-react";

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-[#041f28] text-white overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B5C71] via-[#041f28] to-[#041f28]" />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#FF5733]/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#083d4e]/30 blur-3xl" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,87,51,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,87,51,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="container-wide relative z-10 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#FF5733]/15 border border-[#FF5733]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF5733] animate-pulse" />
            <span className="text-[#FF5733] text-sm font-700 uppercase tracking-wider">
              Sporto trenerių platforma
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-900 leading-[1.05] mb-6">
            Rask savo{" "}
            <span className="text-[#FF5733]">sporto trenerį</span>{" "}
            Lietuvoje
          </h1>
          <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mb-8 leading-relaxed">
            Profesionalūs treneriai visame šalyje – padelis, tenisas, krepšinis ir daugiau. Pasirink trenerį, areną ir rezervuok laiką.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/trainers" className="btn-primary text-base py-4 px-8">
              🏆 Rasti trenerį
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/booking"
              className="btn-secondary text-base py-4 px-8 border-white/30 text-white hover:border-[#FF5733] hover:text-[#FF5733]"
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
      services: true,
      reviews: { select: { rating: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
    take: 8,
  });

  if (trainers.length === 0) return null;

  return (
    <section className="py-20 bg-[#F4F4F4]">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
              Treneriai
            </span>
            <h2 className="text-4xl font-900 mt-2 text-[#0B5C71]">
              Mūsų treneriai
            </h2>
          </div>
          <Link
            href="/trainers"
            className="hidden sm:flex items-center gap-1 text-sm font-600 text-[#FF5733] hover:underline"
          >
            Visi treneriai <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer) => {
            const avgRating =
              trainer.reviews.length > 0
                ? trainer.reviews.reduce((s, r) => s + r.rating, 0) / trainer.reviews.length
                : null;
            const initials = trainer.displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={trainer.id} className="card p-0 overflow-hidden flex flex-col">
                {/* 3:4 portrait photo */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#0B5C71] to-[#083d4e] flex items-center justify-center">
                  {trainer.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={trainer.photoUrl}
                      alt={trainer.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#FF5733]/20 border-2 border-[#FF5733]/40 flex items-center justify-center">
                      <span className="text-3xl font-900 text-white">{initials}</span>
                    </div>
                  )}
                  {trainer.isFeatured && (
                    <div className="absolute top-3 right-3 bg-[#FF5733] text-white text-xs font-700 px-2 py-1 rounded-full">
                      Rekomenduojamas
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h2 className="font-800 text-base text-[#0B5C71] leading-tight">
                      {trainer.displayName}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin size={11} />
                      {trainer.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {avgRating !== null ? (
                      <div className="flex items-center gap-1 text-[#FF5733]">
                        <span className="font-800">{avgRating.toFixed(1)}</span>
                        <Star size={12} className="fill-[#FF5733]" />
                        <span className="text-gray-400">({trainer.reviews.length})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Nėra atsiliepimų</span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <Link
                      href={`/trainers/${trainer.id}`}
                      className="btn-primary w-full text-center text-sm py-2.5"
                    >
                      Žiūrėti profilį
                    </Link>
                  </div>
                </div>
              </div>
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
      trainers: {
        include: { trainer: { select: { status: true } } },
      },
    },
    orderBy: { name: "asc" },
    take: 6,
  });

  if (arenas.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
              Arenos
            </span>
            <h2 className="text-4xl font-900 mt-2 text-[#0B5C71]">
              Kortai ir arenos
            </h2>
          </div>
          <Link
            href="/arenas"
            className="hidden sm:flex items-center gap-1 text-sm font-600 text-[#FF5733] hover:underline"
          >
            Visos arenos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map((arena) => {
            const approvedTrainers = arena.trainers.filter(
              (ta) => ta.trainer.status === "APPROVED"
            ).length;

            return (
              <div key={arena.id} className="card p-0 overflow-hidden flex flex-col">
                {/* Photo */}
                <div className="relative h-44 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] flex items-center justify-center">
                  {arena.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={arena.photoUrl}
                      alt={arena.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🏟️</span>
                  )}
                  {arena.logoUrl && (
                    <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-white shadow-md overflow-hidden border-2 border-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={arena.logoUrl} alt={`${arena.name} logo`} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h2 className="font-800 text-lg text-[#0B5C71] leading-tight">{arena.name}</h2>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                      <MapPin size={13} className="text-[#FF5733]" />
                      <span>{arena.city}{arena.address ? `, ${arena.address}` : ""}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Users size={13} />
                    <span>{approvedTrainers} {approvedTrainers === 1 ? "treneris" : "treneriai"}</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <Link
                      href={`/arenas/${arena.id}`}
                      className="btn-primary w-full text-center text-sm py-2.5"
                    >
                      Žiūrėti
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
    <section className="py-20 bg-[#0B5C71] text-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
            Kaip tai veikia?
          </span>
          <h2 className="text-4xl font-900 mt-2">4 žingsniai iki treniruotės</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5733]/15 border border-[#FF5733]/30 flex items-center justify-center mx-auto mb-5">
                <span className="text-[#FF5733] font-900 text-xl">{step}</span>
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
          <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
            Atsiliepimai
          </span>
          <h2 className="text-4xl font-900 mt-2 text-[#0B5C71]">
            Ką sako klientai
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="card p-7 flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-[#FF5733] fill-[#FF5733]" />
                ))}
              </div>
              {r.comment && (
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FF5733]/10 flex items-center justify-center font-800 text-[#FF5733] text-sm">
                    {(r.author.name ?? "?")[0].toUpperCase()}
                  </div>
                  <p className="font-700 text-sm text-[#0B5C71]">
                    {r.author.name ?? "Anonimai"}
                  </p>
                </div>
                <Link
                  href={`/trainers/${r.trainer.id}`}
                  className="text-xs text-gray-400 hover:text-[#FF5733] transition-colors"
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
    <section className="py-20 bg-gradient-to-br from-[#FF5733] to-[#E04520]">
      <div className="container-tight text-center text-white">
        <h2 className="text-4xl lg:text-5xl font-900 mb-4">
          Pradėk savo sporto kelionę šiandien
        </h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
          Rask geriausią trenerį šalia tavęs ir rezervuok pirmą treniruotę.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/trainers"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#FF5733] font-800 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            🏆 Rasti trenerį
          </Link>
          <Link
            href="/auth/register-trainer"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-700 px-8 py-4 rounded-lg hover:bg-white hover:text-[#FF5733] transition-all"
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
