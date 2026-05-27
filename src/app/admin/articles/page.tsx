"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Eye, EyeOff, Trash2, Loader2, FileText } from "lucide-react";
import { formatDateLT, cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    published: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/articles?limit=50")
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.content) {
      setError("Pavadinimas ir turinys yra privalomi");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const article = await res.json();
      setArticles((prev) => [article, ...prev]);
      setShowForm(false);
      setForm({ title: "", excerpt: "", content: "", coverImage: "", published: false });
    } else {
      const data = await res.json();
      setError(data.error || "Klaida kuriant straipsnį");
    }
    setSaving(false);
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    const res = await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį straipsnį?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#16213e]">Straipsniai</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          Naujas straipsnis
        </button>
      </div>

      {/* New article form */}
      {showForm && (
        <div className="card p-6 space-y-4">
          <h2 className="font-black text-[#16213e]">Naujas straipsnis</h2>
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Pavadinimas *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Straipsnio pavadinimas"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Santrauka</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Trumpas aprašymas (neprivaloma)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Viršelio nuotraukos URL</label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Turinys (HTML arba tekstas) *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Straipsnio turinys..."
              rows={10}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] resize-y font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#e94560]"
              />
              <span className="text-sm font-semibold text-gray-700">Publikuoti iš karto</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving} className="btn-primary text-sm py-2 px-5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Kuriama..." : "Sukurti straipsnį"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-5">
              Atšaukti
            </button>
          </div>
        </div>
      )}

      {/* Articles list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          Kraunama...
        </div>
      ) : articles.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-500">Straipsnių dar nėra</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "badge text-xs",
                      article.published
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    )}
                  >
                    {article.published ? "Publikuota" : "Juodraštis"}
                  </span>
                </div>
                <h3 className="font-bold text-[#16213e] truncate">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-400 truncate mt-0.5">{article.excerpt}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateLT(article.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {article.published && (
                  <Link
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Žiūrėti"
                  >
                    <Eye size={15} />
                  </Link>
                )}
                <button
                  onClick={() => handleTogglePublish(article.id, article.published)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    article.published
                      ? "text-green-500 hover:bg-gray-50"
                      : "text-gray-400 hover:text-green-500 hover:bg-green-50"
                  )}
                  title={article.published ? "Nuimti nuo publikacijos" : "Publikuoti"}
                >
                  {article.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Ištrinti"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
