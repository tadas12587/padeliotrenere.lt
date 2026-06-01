"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  FileText,
  CheckCircle,
  ExternalLink,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface GlobalSeo {
  id: string;
  siteName: string;
  siteUrl: string | null;
  defaultOgImage: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  googleSiteVerification: string | null;
  updatedAt: string;
}

interface PageSeo {
  id: string;
  pageSlug: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  keywords: string | null;
  updatedAt: string;
}

const PREDEFINED_PAGES = [
  { slug: "home", label: "Pagrindinis puslapis", path: "/" },
  { slug: "trainers", label: "Treneriai", path: "/trainers" },
  { slug: "arenas", label: "Arenos", path: "/arenas" },
  { slug: "booking", label: "Rezervacija", path: "/booking" },
  { slug: "blog", label: "Blogas", path: "/blog" },
  { slug: "contact", label: "Kontaktai", path: "/contact" },
  { slug: "about", label: "Apie mus", path: "/about" },
  { slug: "privacy", label: "Privatumo politika", path: "/privacy" },
  { slug: "terms", label: "Naudojimo sąlygos", path: "/terms" },
];

const SEO_CHECKLIST = [
  { label: "Sitemap aktyvus (/sitemap.xml)", href: "/sitemap.xml" },
  { label: "Robots.txt aktyvus (/robots.txt)", href: "/robots.txt" },
  { label: "JSON-LD (struktūrizuoti duomenys)", href: null },
  { label: "OpenGraph žymos", href: null },
  { label: "Twitter kortelės", href: null },
];

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-600 text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C71]/30 focus:border-[#0B5C71] transition-colors"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-600 text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C71]/30 focus:border-[#0B5C71] transition-colors resize-none"
      />
    </div>
  );
}

function GlobalTab({
  globalSeo,
  onSaved,
}: {
  globalSeo: GlobalSeo | null;
  onSaved: (g: GlobalSeo) => void;
}) {
  const [siteName, setSiteName] = useState(globalSeo?.siteName ?? "Padėlio Treneris");
  const [siteUrl, setSiteUrl] = useState(globalSeo?.siteUrl ?? "");
  const [defaultOgImage, setDefaultOgImage] = useState(globalSeo?.defaultOgImage ?? "");
  const [twitterHandle, setTwitterHandle] = useState(globalSeo?.twitterHandle ?? "");
  const [facebookUrl, setFacebookUrl] = useState(globalSeo?.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(globalSeo?.instagramUrl ?? "");
  const [googleSiteVerification, setGoogleSiteVerification] = useState(
    globalSeo?.googleSiteVerification ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "global",
          data: {
            siteName,
            siteUrl: siteUrl || null,
            defaultOgImage: defaultOgImage || null,
            twitterHandle: twitterHandle || null,
            facebookUrl: facebookUrl || null,
            instagramUrl: instagramUrl || null,
            googleSiteVerification: googleSiteVerification || null,
          },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Svetainės pavadinimas"
          value={siteName}
          onChange={setSiteName}
          placeholder="Padėlio Treneris"
        />
        <InputField
          label="Svetainės URL"
          value={siteUrl}
          onChange={setSiteUrl}
          placeholder="https://padeliotrenere.lt"
          type="url"
        />
        <InputField
          label="Numatytoji OG nuotrauka (URL)"
          value={defaultOgImage}
          onChange={setDefaultOgImage}
          placeholder="https://padeliotrenere.lt/og-default.jpg"
          type="url"
        />
        <InputField
          label="Twitter Handle"
          value={twitterHandle}
          onChange={setTwitterHandle}
          placeholder="@padeliotrenere"
        />
        <InputField
          label="Facebook URL"
          value={facebookUrl}
          onChange={setFacebookUrl}
          placeholder="https://facebook.com/padeliotrenere"
          type="url"
        />
        <InputField
          label="Instagram URL"
          value={instagramUrl}
          onChange={setInstagramUrl}
          placeholder="https://instagram.com/padeliotrenere"
          type="url"
        />
        <div className="sm:col-span-2">
          <InputField
            label="Google Site Verification"
            value={googleSiteVerification}
            onChange={setGoogleSiteVerification}
            placeholder="google-site-verification raktas"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={15} />
          {saving ? "Saugoma..." : "Išsaugoti"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-600 flex items-center gap-1">
            <CheckCircle size={15} />
            Išsaugota
          </span>
        )}
      </div>
    </div>
  );
}

function PageRow({
  page,
  existing,
  onSaved,
}: {
  page: { slug: string; label: string; path: string };
  existing: PageSeo | undefined;
  onSaved: (p: PageSeo) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(existing?.ogImageUrl ?? "");
  const [keywords, setKeywords] = useState(existing?.keywords ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasData = !!existing;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page",
          data: {
            pageSlug: page.slug,
            title: title || null,
            description: description || null,
            ogImageUrl: ogImageUrl || null,
            keywords: keywords || null,
          },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            hasData ? "bg-green-500" : "bg-gray-300"
          }`}
          title={hasData ? "Individualūs nustatymai" : "Naudojami numatytieji"}
        />
        <span className="flex-1 font-600 text-sm text-[#0B5C71]">{page.label}</span>
        <span className="text-xs text-gray-400 font-mono">{page.path}</span>
        {expanded ? (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 flex flex-col gap-4 bg-gray-50/50">
          <InputField
            label="Puslapio pavadinimas (title)"
            value={title}
            onChange={setTitle}
            placeholder="Pagrindinis puslapis – Padėlio Treneris"
          />
          <TextareaField
            label="Aprašymas (meta description)"
            value={description}
            onChange={setDescription}
            placeholder="Trumpas puslapio aprašymas paieškos sistemoms..."
            rows={2}
          />
          <InputField
            label="OG nuotraukos URL"
            value={ogImageUrl}
            onChange={setOgImageUrl}
            placeholder="https://padeliotrenere.lt/og-home.jpg"
            type="url"
          />
          <TextareaField
            label="Raktažodžiai (per kablelį)"
            value={keywords}
            onChange={setKeywords}
            placeholder="padelio treneris, padel Lietuva, ..."
            rows={2}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              <Save size={14} />
              {saving ? "Saugoma..." : "Išsaugoti"}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Išsaugota
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<"global" | "pages">("global");
  const [globalSeo, setGlobalSeo] = useState<GlobalSeo | null>(null);
  const [pageSeos, setPageSeos] = useState<PageSeo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        setGlobalSeo(data.global ?? null);
        setPageSeos(data.pages ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  function handlePageSaved(updated: PageSeo) {
    setPageSeos((prev) => {
      const idx = prev.findIndex((p) => p.pageSlug === updated.pageSlug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">SEO nustatymai</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite paieškos optimizacijos nustatymus visai svetainei ir atskiroms puslapiams.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 transition-colors ${
            activeTab === "global"
              ? "bg-white text-[#0B5C71] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe size={15} />
          Globalūs nustatymai
        </button>
        <button
          onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 transition-colors ${
            activeTab === "pages"
              ? "bg-white text-[#0B5C71] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={15} />
          Puslapiai
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Kraunama...</div>
      ) : (
        <>
          {activeTab === "global" && (
            <GlobalTab globalSeo={globalSeo} onSaved={setGlobalSeo} />
          )}

          {activeTab === "pages" && (
            <div className="card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Individualūs nustatymai</span>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 ml-3" />
                <span className="text-xs text-gray-500">Naudojami numatytieji</span>
              </div>
              {PREDEFINED_PAGES.map((page) => (
                <PageRow
                  key={page.slug}
                  page={page}
                  existing={pageSeos.find((p) => p.pageSlug === page.slug)}
                  onSaved={handlePageSaved}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* SEO Checklist */}
      <div className="card p-6">
        <h2 className="text-base font-800 text-[#0B5C71] mb-4">SEO tikrinimo sąrašas</h2>
        <ul className="flex flex-col gap-2.5">
          {SEO_CHECKLIST.map(({ label, href }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm">
              <CheckCircle size={16} className="text-green-500 shrink-0" />
              <span className="text-gray-700">{label}</span>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[#FF5733] hover:underline flex items-center gap-1 text-xs font-600"
                >
                  Peržiūrėti <ExternalLink size={11} />
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-600 text-[#0B5C71] hover:text-[#FF5733] transition-colors"
          >
            Peržiūrėti sitemapą <ExternalLink size={13} />
          </a>
          <span className="text-gray-300">·</span>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-600 text-[#0B5C71] hover:text-[#FF5733] transition-colors"
          >
            Peržiūrėti robots.txt <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
