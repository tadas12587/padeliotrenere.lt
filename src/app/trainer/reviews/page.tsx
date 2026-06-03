import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
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

export default async function TrainerReviewsPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;

  const profile = await prisma.trainerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <div className="card p-8 text-center text-gray-400">
        Trenerio profilis nerastas.
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { trainerId: profile.id },
    include: { author: { select: { name: true, image: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-900 text-[#0B5C71]">Mano atsiliepimai</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-900 text-[#FF5733]">{reviews.length}</p>
          <p className="text-sm text-gray-500 mt-1">Iš viso atsiliepimų</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-900 text-[#FF5733]">
            {avg !== null ? avg.toFixed(1) : "–"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Vidurkis</p>
        </div>
        {avg !== null && (
          <div className="card p-5 flex flex-col items-center justify-center gap-1 col-span-2 sm:col-span-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(avg)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">Vertinimas</p>
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div className="card p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-600">Atsiliepimų dar nėra</p>
            <p className="text-sm mt-1">
              Klientai galės palikti atsiliepimą po treniruotės.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {reviews.map((review) => {
              const initials = (review.author.name ?? review.author.email ?? "?")[0].toUpperCase();
              return (
                <div key={review.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {review.author.image ? (
                      <img
                        src={review.author.image}
                        alt={review.author.name ?? ""}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#0B5C71]/10 flex items-center justify-center font-800 text-[#0B5C71] text-sm shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-700 text-sm text-[#0B5C71]">
                          {review.author.name ?? review.author.email}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
