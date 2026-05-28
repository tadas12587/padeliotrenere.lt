import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateLT } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });
  if (!article) return { title: "Straipsnis nerastas" };
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });

  if (!article) notFound();

  return (
    <div className="min-h-screen">
      {/* Cover */}
      {article.coverImage && (
        <div className="h-72 lg:h-96 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-tight py-12 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF5733] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Grįžti į blog'ą
        </Link>

        <p className="text-sm text-gray-400 mb-3">
          {formatDateLT(article.publishedAt || article.createdAt)}
        </p>

        <h1 className="text-3xl lg:text-4xl font-900 text-[#0B5C71] mb-6 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed border-l-4 border-[#FF5733] pl-5 mb-8">
            {article.excerpt}
          </p>
        )}

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed
            prose-headings:font-900 prose-headings:text-[#0B5C71]
            prose-a:text-[#FF5733] prose-a:no-underline hover:prose-a:underline
            prose-strong:font-800 prose-strong:text-[#0B5C71]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF5733] transition-colors"
          >
            <ArrowLeft size={16} />
            Visi straipsniai
          </Link>
        </div>
      </div>
    </div>
  );
}
