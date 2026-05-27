import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateLT } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog'as",
  description:
    "Padelio trenerio blog'as – patarimai, treniruočių metodikos, naujienos iš padelio pasaulio.",
};

export default async function BlogPage() {
  const articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
  }[] = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#16213e] text-white py-14">
        <div className="container-tight text-center">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Blog'as
          </span>
          <h1 className="text-4xl font-900 mt-2 mb-3">Padelio žinios</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Patarimai, technikos, taktikos ir naujienos iš padelio pasaulio
          </p>
        </div>
      </div>

      <div className="container-tight py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-700 text-lg">Straipsnių dar nėra</p>
            <p className="text-sm mt-1">Greitai pasirodys naujas turinys!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="card flex flex-col overflow-hidden group"
              >
                {/* Cover */}
                <div className="aspect-video bg-gradient-to-br from-[#16213e] to-[#0f3460] flex items-center justify-center text-5xl overflow-hidden">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    "🎾"
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-2">
                    {formatDateLT(article.publishedAt || article.createdAt)}
                  </p>
                  <h2 className="font-800 text-[#16213e] text-lg leading-snug mb-2 group-hover:text-[#e94560] transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[#e94560] text-sm font-700 mt-4">
                    Skaityti <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
