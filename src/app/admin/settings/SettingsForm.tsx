"use client";

import { useState } from "react";
import { Save, CheckCircle, AlertTriangle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Settings {
  logoUrl: string | null;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Svetainės logotipas" hint="Rekomenduojamas dydis: kvadratas, PNG su skaidriu fonu">
            <ImageUpload
              currentUrl={logoUrl || undefined}
              onUploaded={setLogoUrl}
              aspectRatio={1}
              uploadType="logo"
            />
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="text-xs text-red-500 hover:underline mt-1 text-left"
              >
                Pašalinti logotipą
              </button>
            )}
          </Field>
          <Field label="Favicon (naršyklės kortelės ikona)" hint="Rekomenduojama: 32×32 arba 64×64 PNG">
            <ImageUpload
              currentUrl={faviconUrl || undefined}
              onUploaded={setFaviconUrl}
              aspectRatio={1}
              uploadType="logo"
            />
            {faviconUrl && (
              <button
                type="button"
                onClick={() => setFaviconUrl("")}
                className="text-xs text-red-500 hover:underline mt-1 text-left"
              >
                Pašalinti favicon
              </button>
            )}
          </Field>
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
