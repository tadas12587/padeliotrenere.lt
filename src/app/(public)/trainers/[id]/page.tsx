import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Star, MapPin, Clock, CheckCircle, Calendar } from "lucide-react";
import SportBadge from "@/components/SportBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trainer = await prisma.trainerProfile.findUnique({
    where: { id },
    select: { displayName: true, city: true, bio: true },
  });
  if (!trainer) return { title: "Treneris nerastas" };

  const title = `${trainer.displayName} – Padelio treneris`;
  const description = trainer.bio
    ? trainer.bio.slice(0, 200)
    : `${trainer.displayName} – profesionalus padelio treneris${trainer.city ? ` ${trainer.city} mieste` : ""}. Individualios ir grupinės treniruotės. Rezervuokite laiką internetu.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      // og:image is handled by opengraph-image.tsx (1200×630, HTTPS)
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 fill-gray-300"
          }
        />
      ))}
    </div>
  );
}

function InitialsAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const cls =
    size === "lg"
      ? "w-32 h-32 text-4xl rounded-full"
      : "w-10 h-10 text-base rounded-full";
  return (
    <div
      className={`${cls} bg-[#FF5733]/20 border-2 border-[#FF5733]/40 flex items-center justify-center font-900 text-white shrink-0`}
    >
      {initials}
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function formatSlotDate(d: Date) {
  return new Intl.DateTimeFormat("lt-LT", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("lt-LT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default async function TrainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      services: true,
      certifications: true,
      arenas: {
        include: { arena: true },
      },
      sports: {
        include: { sport: true },
      },
      reviews: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
      slots: {
        where: {
          status: "AVAILABLE",
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: "asc" },
        take: 30,
        include: { arena: true },
      },
    },
  });

  if (!trainer || trainer.status !== "APPROVED") {
    notFound();
  }

  const avgRating =
    trainer.reviews.length > 0
      ? trainer.reviews.reduce((s, r) => s + r.rating, 0) /
        trainer.reviews.length
      : null;

  // Group slots by date string
  const slotsByDate = trainer.slots.reduce<
    Record<string, typeof trainer.slots>
  >((acc, slot) => {
    const key = slot.startTime.toISOString().slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: trainer.displayName,
            description: trainer.bio || undefined,
            image: trainer.photoUrl || undefined,
            jobTitle: "Sporto treneris",
            address: {
              "@type": "PostalAddress",
              addressLocality: trainer.city || undefined,
              addressCountry: "LT",
            },
            url: `${
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://padeliotrenere.lt"
            }/trainers/${trainer.id}`,
          }),
        }}
      />
      {/* Header */}
      <section className="bg-[#0B5C71] text-white py-12">
        <div className="container-tight">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Photo / Avatar */}
            <div className="shrink-0">
              {trainer.photoUrl ? (
                <img
                  src={trainer.photoUrl}
                  alt={trainer.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#FF5733]/40"
                />
              ) : (
                <InitialsAvatar name={trainer.displayName} size="lg" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl lg:text-4xl font-900 leading-tight">
                  {trainer.displayName}
                </h1>
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider">
                  Patvirtintas
                </span>
                {trainer.isFeatured && (
                  <span className="bg-[#FF5733]/20 text-[#FF5733] border border-[#FF5733]/30 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider">
                    Rekomenduojamas
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-400 mb-3">
                <MapPin size={15} />
                <span>{trainer.city}</span>
              </div>

              {avgRating !== null && (
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} />
                  <span className="font-700 text-[#FF5733]">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({trainer.reviews.length} atsiliepimų)
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <Link
                href={`/booking?trainerId=${trainer.id}`}
                className="btn-primary py-3 px-7"
              >
                Rezervuoti
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-tight py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Bio */}
          {trainer.bio && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#0B5C71] mb-4">
                Apie trenerį
              </h2>
              <p className="text-gray-600 leading-relaxed">{trainer.bio}</p>
            </div>
          )}

          {/* Certifications */}
          {trainer.certifications.length > 0 && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#0B5C71] mb-4">
                Sertifikatai
              </h2>
              <ul className="flex flex-col gap-3">
                {trainer.certifications.map((cert) => (
                  <li key={cert.id} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#FF5733] shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-700 text-[#0B5C71] text-sm">
                        {cert.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {cert.issuedBy} · {cert.year}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {trainer.services.length > 0 && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#0B5C71] mb-4">
                Paslaugos
              </h2>
              <div className="flex flex-col gap-4">
                {trainer.services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-700 text-[#0B5C71]">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-800 text-[#FF5733]">
                          {service.price
                            ? `${service.price.toString()} €`
                            : "Nemokama"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Clock size={13} />
                      <span>{service.durationMinutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-7">
            <h2 className="text-xl font-800 text-[#0B5C71] mb-4">
              Atsiliepimai
              {trainer.reviews.length > 0 && (
                <span className="text-gray-400 font-600 text-base ml-2">
                  ({trainer.reviews.length})
                </span>
              )}
            </h2>

            {trainer.reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">Atsiliepimų kol kas nėra.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {trainer.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-5 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF5733]/10 flex items-center justify-center font-800 text-[#FF5733] text-xs shrink-0">
                          {(review.author.name ?? review.author.email)[0].toUpperCase()}
                        </div>
                        <span className="font-700 text-sm text-[#0B5C71]">
                          {review.author.name ?? review.author.email}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Sports */}
          {trainer.sports.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-800 text-[#0B5C71] mb-4">
                Sporto šakos
              </h2>
              <div className="flex flex-wrap gap-2">
                {trainer.sports.map(({ sport }) => (
                  <SportBadge key={sport.id} name={sport.name} icon={sport.icon} iconUrl={sport.iconUrl} />
                ))}
              </div>
            </div>
          )}

          {/* Arenas */}
          {trainer.arenas.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-800 text-[#0B5C71] mb-4">
                Arenos
              </h2>
              <ul className="flex flex-col gap-3">
                {trainer.arenas.map(({ arena }) => (
                  <li key={arena.id}>
                    <Link
                      href={`/arenas/${arena.id}`}
                      className="flex items-start gap-2 text-sm group hover:text-[#FF5733] transition-colors"
                    >
                      <MapPin
                        size={14}
                        className="text-[#FF5733] shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-700 text-[#0B5C71] group-hover:text-[#FF5733] transition-colors">
                          {arena.name}
                        </p>
                        <p className="text-gray-400 text-xs">{arena.city}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Availability */}
          <div className="card p-6">
            <h2 className="text-lg font-800 text-[#0B5C71] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#FF5733]" />
              Laisvi laikai
            </h2>

            {Object.keys(slotsByDate).length === 0 ? (
              <p className="text-gray-400 text-sm">
                Šiuo metu laisvų laikų nėra.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(slotsByDate).map(([dateKey, slots]) => (
                  <div key={dateKey}>
                    <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">
                      {formatSlotDate(new Date(dateKey + "T00:00:00"))}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between bg-[#F4F4F4] rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="font-700 text-[#0B5C71]">
                            {formatTime(slot.startTime)} –{" "}
                            {formatTime(slot.endTime)}
                          </span>
                          <span className="text-gray-400 text-xs truncate max-w-[100px]">
                            {slot.arena.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link
                href={`/booking?trainerId=${trainer.id}`}
                className="btn-primary w-full text-center text-sm py-3"
              >
                Rezervuoti laiką
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
