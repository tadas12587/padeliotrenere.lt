"use client";

import { useState, useRef } from "react";
import { Save, CheckCircle, AlertTriangle, Upload, Loader2 } from "lucide-react";

interface Settings {
  logoUrl: string | null;
  logoSquare: string | null;
  logoUrlDark: string | null;
  logoSquareDark: string | null;
  faviconUrl: string | null;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  maintenanceMode: boolean;
  maintenanceMsg: string | null;
}

// Simple upload without crop — preserves original aspect ratio, resizes if too large
function SimpleImageUpload({
  currentUrl,
  onUploaded,
  hint,
  maxDim = 800,
  uploadType = "logo",
  dark = false,
}: {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  hint?: string;
  maxDim?: number;
  uploadType?: string;
  dark?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const blob = await resizeImage(file, maxDim);
      const ext = file.type === "image/png" ? "png" : file.type === "image/svg+xml" ? "svg" : "jpg";
      const fd = new FormData();
      fd.append("file", blob, `upload.${ext}`);
      fd.append("type", uploadType);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
      const { url } = await res.json();
      onUploaded(url);
    } catch (err: any) {
      setError(err.message || "Klaida įkeliant");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="Preview" className="max-h-12 max-w-full object-contain" />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed text-sm font-600 transition-colors disabled:opacity-60 ${
            dark
              ? "border-white/40 text-white hover:border-white"
              : "border-gray-300 text-gray-600 hover:border-[#FF5733] hover:text-[#FF5733]"
          }`}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Keliama..." : currentUrl ? "Pakeisti" : "Įkelti"}
        </button>
        {hint && <p className={`text-xs ${dark ? "text-white/60" : "text-gray-400"}`}>{hint}</p>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function resizeImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") { resolve(file); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas failed")), mime, 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load failed")); };
    img.src = url;
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 flex flex-col gap-5">
      <h2 className="font-800 text-[#0B5C71] text-base border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-600 text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C71]/30 focus:border-[#0B5C71] transition-colors"
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 2,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C71]/30 focus:border-[#0B5C71] transition-colors resize-none"
    />
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [logoSquare, setLogoSquare] = useState(initial.logoSquare ?? "");
  const [logoUrlDark, setLogoUrlDark] = useState(initial.logoUrlDark ?? "");
  const [logoSquareDark, setLogoSquareDark] = useState(initial.logoSquareDark ?? "");
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl ?? "");
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtubeUrl ?? "");
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle ?? "");
  const [maintenanceMode, setMaintenanceMode] = useState(initial.maintenanceMode);
  const [maintenanceMsg, setMaintenanceMsg] = useState(initial.maintenanceMsg ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          logoSquare: logoSquare || null,
          logoUrlDark: logoUrlDark || null,
          logoSquareDark: logoSquareDark || null,
          faviconUrl: faviconUrl || null,
          tagline: tagline || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          instagramUrl: instagramUrl || null,
          facebookUrl: facebookUrl || null,
          youtubeUrl: youtubeUrl || null,
          heroTitle: heroTitle || null,
          heroSubtitle: heroSubtitle || null,
          maintenanceMode,
          maintenanceMsg: maintenanceMsg || null,
        }),
      });
      if (!res.ok) throw new Error("Klaida išsaugant");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "Klaida");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Brand */}
      <Section title="Logotipas ir prekės ženklas">
        {/* Light bg logos */}
        <div>
          <p className="text-xs font-700 uppercase tracking-widest text-gray-400 mb-3">Šviesus fonas — Navbar, auth puslapiai</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gulščias (landscape)" hint="Pagrindinis — plačiose vietose">
              <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center justify-center min-h-[72px]">
                <SimpleImageUpload currentUrl={logoUrl} onUploaded={setLogoUrl} maxDim={1200} uploadType="logo" />
              </div>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl("")} className="text-xs text-red-500 hover:underline">Pašalinti</button>
              )}
            </Field>
            <Field label="Kvadratas 1×1" hint="Kompaktinėse vietose (ateičiai)">
              <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center justify-center min-h-[72px]">
                <SimpleImageUpload currentUrl={logoSquare} onUploaded={setLogoSquare} maxDim={512} uploadType="logo" />
              </div>
              {logoSquare && (
                <button type="button" onClick={() => setLogoSquare("")} className="text-xs text-red-500 hover:underline">Pašalinti</button>
              )}
            </Field>
          </div>
        </div>

        {/* Dark bg logos */}
        <div>
          <p className="text-xs font-700 uppercase tracking-widest text-gray-400 mb-3">Tamsus fonas — Sidebar, footer, mobilė navigacija</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gulščias (landscape)" hint="Footer — plačioje juostoje">
              <div className="rounded-xl border border-[#0B5C71]/30 bg-[#0B5C71] p-3 flex items-center justify-center min-h-[72px]">
                <SimpleImageUpload currentUrl={logoUrlDark} onUploaded={setLogoUrlDark} maxDim={1200} uploadType="logo" dark />
              </div>
              {logoUrlDark && (
                <button type="button" onClick={() => setLogoUrlDark("")} className="text-xs text-red-500 hover:underline">Pašalinti</button>
              )}
            </Field>
            <Field label="Kvadratas 1×1" hint="Sidebar ir mobilė navigacija (prie teksto)">
              <div className="rounded-xl border border-[#0B5C71]/30 bg-[#0B5C71] p-3 flex items-center justify-center min-h-[72px]">
                <SimpleImageUpload currentUrl={logoSquareDark} onUploaded={setLogoSquareDark} maxDim={512} uploadType="logo" dark />
              </div>
              {logoSquareDark && (
                <button type="button" onClick={() => setLogoSquareDark("")} className="text-xs text-red-500 hover:underline">Pašalinti</button>
              )}
            </Field>
          </div>
        </div>

        {/* Favicon */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-700 uppercase tracking-widest text-gray-400 mb-3">Favicon</p>
          <div className="max-w-[220px]">
            <Field label="Naršyklės kortelė" hint="PNG, ICO — rekomenduojama ≥ 32×32">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-center min-h-[72px]">
                <SimpleImageUpload currentUrl={faviconUrl} onUploaded={setFaviconUrl} maxDim={256} uploadType="logo" />
              </div>
              {faviconUrl && (
                <button type="button" onClick={() => setFaviconUrl("")} className="text-xs text-red-500 hover:underline">Pašalinti</button>
              )}
            </Field>
          </div>
        </div>
        <Field label="Šūkis (tagline)" hint="Rodomas footer'yje po logotipu">
          <Input
            value={tagline}
            onChange={setTagline}
            placeholder="Rask geriausią sporto trenerį Lietuvoje"
          />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Kontaktinė informacija (footer)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Telefono numeris">
            <Input value={phone} onChange={setPhone} placeholder="+370 600 00000" type="tel" />
          </Field>
          <Field label="El. paštas">
            <Input value={email} onChange={setEmail} placeholder="info@padeliotrenere.lt" type="email" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Adresas">
              <Input value={address} onChange={setAddress} placeholder="Vilnius, Lietuva" />
            </Field>
          </div>
        </div>
      </Section>

      {/* Social */}
      <Section title="Socialiniai tinklai (footer)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram URL">
            <Input value={instagramUrl} onChange={setInstagramUrl} placeholder="https://instagram.com/..." type="url" />
          </Field>
          <Field label="Facebook URL">
            <Input value={facebookUrl} onChange={setFacebookUrl} placeholder="https://facebook.com/..." type="url" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="YouTube URL">
              <Input value={youtubeUrl} onChange={setYoutubeUrl} placeholder="https://youtube.com/..." type="url" />
            </Field>
          </div>
        </div>
      </Section>

      {/* Hero */}
      <Section title="Pagrindinio puslapio hero tekstas">
        <Field label="Antraštė" hint="Palikite tuščią — bus naudojamas numatytasis tekstas">
          <Input
            value={heroTitle}
            onChange={setHeroTitle}
            placeholder="Rask savo sporto trenerį Lietuvoje"
          />
        </Field>
        <Field label="Paantraštė">
          <Textarea
            value={heroSubtitle}
            onChange={setHeroSubtitle}
            placeholder="Profesionalūs treneriai visame šalyje..."
          />
        </Field>
      </Section>

      {/* Maintenance */}
      <Section title="Svetainės priežiūra">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
              maintenanceMode ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                maintenanceMode ? "left-7" : "left-1"
              }`}
            />
          </button>
          <div>
            <p className="font-700 text-sm text-gray-800">
              Priežiūros režimas{" "}
              {maintenanceMode && (
                <span className="text-red-500 text-xs font-600 ml-1">(ĮJUNGTAS)</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Kai įjungtas — viešieji puslapiai rodo priežiūros pranešimą. Adminas gali naršyti normaliai.
            </p>
          </div>
        </div>

        {maintenanceMode && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-700 text-red-700 mb-2">Priežiūros pranešimas lankytojams:</p>
              <Textarea
                value={maintenanceMsg}
                onChange={setMaintenanceMsg}
                placeholder="Svetainė šiuo metu tvarkoma. Grįžkite netrukus!"
                rows={2}
              />
            </div>
          </div>
        )}
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={15} />
          {saving ? "Saugoma..." : "Išsaugoti nustatymus"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-600 flex items-center gap-1">
            <CheckCircle size={15} />
            Išsaugota
          </span>
        )}
        {error && (
          <span className="text-red-600 text-sm">{error}</span>
        )}
      </div>
    </div>
  );
}
