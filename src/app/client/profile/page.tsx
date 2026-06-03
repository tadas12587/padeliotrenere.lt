"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Phone, Mail, Save, Loader2, Bell, BellOff, Camera, CheckCircle } from "lucide-react";

function resizeImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
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
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas failed")), "image/jpeg", 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load failed")); };
    img.src = url;
  });
}

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) throw new Error("Naršyklė nepalaiko Service Worker");

  // Try existing active SW first
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing?.active) return existing;

  // Register (or re-register) and wait for activation
  const reg = await navigator.serviceWorker.register("/sw.js");
  if (reg.active) return reg;

  // Wait for the installing/waiting SW to become active
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Service worker neaktyvus — perkraukite puslapį ir bandykite dar kartą")),
      10000
    );
    const done = (r: ServiceWorkerRegistration) => { clearTimeout(timeout); resolve(r); };
    const fail = (msg: string) => { clearTimeout(timeout); reject(new Error(msg)); };

    const sw = reg.installing ?? reg.waiting;
    if (!sw) { fail("Nepavyko užregistruoti service worker"); return; }

    sw.addEventListener("statechange", function () {
      if (this.state === "activated") done(reg);
      else if (this.state === "redundant") fail("Service worker įdiegimas nepavyko — perkraukite puslapį");
    });
  });
}

export default function ClientProfilePage() {
  const { data: session, update } = useSession();
  const user = (session?.user as any) || {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  // Load everything from DB — single source of truth
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setName(d.name || "");
        setPhone(d.phone || "");
        setPhotoUrl(d.image || null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    setPhotoUploading(true);
    try {
      const blob = await resizeImage(file, 400);
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      fd.append("type", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
      const { url } = await res.json();
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      setPhotoUrl(url);
      await update();
    } catch (err: any) {
      setPhotoError(err.message || "Klaida įkeliant nuotrauką");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, phone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Klaida išsaugant");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await update(); // refresh session name
    } catch (err: any) {
      setSaveError(err.message || "Klaida");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushError("Jūsų naršyklė nepalaiko push pranešimų.");
      return;
    }
    setPushLoading(true);
    setPushError("");
    try {
      if (!pushEnabled) {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setPushError("Leidimai pranešimams nesuteikti.");
          setPushLoading(false);
          return;
        }
        const reg = await getOrRegisterSW();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
        setPushEnabled(true);
      } else {
        const reg = await getOrRegisterSW();
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        setPushEnabled(false);
      }
    } catch (err: any) {
      setPushError(err?.message || "Klaida įjungiant pranešimus.");
    }
    setPushLoading(false);
  };

  const initials = (name || user.email || "?")[0].toUpperCase();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-[#0B5C71]">Profilis</h1>

      {/* Profile form */}
      <div className="card p-6">
        <h2 className="font-bold text-[#0B5C71] mb-5 flex items-center gap-2">
          <User size={18} className="text-[#FF5733]" />
          Asmeniniai duomenys
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#0B5C71]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Profilio nuotrauka" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-900 text-2xl">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={photoUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FF5733] flex items-center justify-center text-white shadow-md hover:bg-[#E04520] transition-colors disabled:opacity-60"
              title="Pakeisti nuotrauką"
            >
              {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          </div>
          <div>
            <p className="font-700 text-gray-800">{name || user.email || "—"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={photoUploading}
              className="mt-1.5 text-xs text-[#FF5733] font-600 hover:underline disabled:opacity-60"
            >
              {photoUploading ? "Keliama..." : "Pakeisti nuotrauką"}
            </button>
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              Vardas Pavardė
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jūsų vardas"
              disabled={!loaded}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              El. paštas
            </label>
            <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
              <Mail size={15} className="text-gray-400" />
              <span className="text-sm text-gray-500">{user.email}</span>
              <span className="text-xs text-gray-400 ml-auto">(nekeičiama)</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              Telefono numeris
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+370 600 00000"
                disabled={!loaded}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !loaded}
              className="btn-primary text-sm py-2.5 px-6 gap-2"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Save size={15} />
                  Išsaugoti
                </>
              )}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-600 flex items-center gap-1">
                <CheckCircle size={15} />
                Išsaugota
              </span>
            )}
            {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
          </div>
        </form>
      </div>

      {/* Push notifications */}
      <div className="card p-6">
        <h2 className="font-bold text-[#0B5C71] mb-2 flex items-center gap-2">
          <Bell size={18} className="text-[#FF5733]" />
          Push pranešimai
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Gaukite priminimus apie treniruotes ir patvirtinimus tiesiai į naršyklę.
        </p>
        <button
          onClick={handlePushToggle}
          disabled={pushLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
            pushEnabled
              ? "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500"
              : "border-[#FF5733] bg-[#FF5733] text-white hover:bg-[#E04520]"
          }`}
        >
          {pushLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : pushEnabled ? (
            <>
              <BellOff size={15} />
              Išjungti pranešimus
            </>
          ) : (
            <>
              <Bell size={15} />
              Įjungti pranešimus
            </>
          )}
        </button>
        {pushError && <p className="text-sm text-red-500 mt-3">{pushError}</p>}
      </div>
    </div>
  );
}
