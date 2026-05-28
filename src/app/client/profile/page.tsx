"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Phone, Mail, Save, Loader2, Bell, BellOff } from "lucide-react";

export default function ClientProfilePage() {
  const { data: session, update } = useSession();
  const user = (session?.user as any) || {};

  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (!pushEnabled) {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          alert("Leidimai pranešimams nesuteikti.");
          setPushLoading(false);
          return;
        }
        const reg = await navigator.serviceWorker.ready;
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
        const reg = await navigator.serviceWorker.ready;
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
    } catch (err) {
      console.error(err);
    }
    setPushLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-[#0B5C71]">Profilis</h1>

      {/* Profile form */}
      <div className="card p-6">
        <h2 className="font-bold text-[#0B5C71] mb-5 flex items-center gap-2">
          <User size={18} className="text-[#FF5733]" />
          Asmeniniai duomenys
        </h2>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              Vardas Pavardė
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jūsų vardas"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
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
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+370 600 00000"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm py-2.5 px-6 gap-2"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              "✅ Išsaugota!"
            ) : (
              <>
                <Save size={15} />
                Išsaugoti
              </>
            )}
          </button>
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
      </div>
    </div>
  );
}
