"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface Arena {
  id: string;
  name: string;
  city: string;
}

interface ProfileData {
  id: string;
  displayName: string;
  bio: string;
  photoUrl: string;
  city: string;
  phone: string;
  arenaIds: string[];
}

interface Props {
  profile: ProfileData | null;
  arenas: Arena[];
}

export default function TrainerProfileForm({ profile, arenas }: Props) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [selectedArenaIds, setSelectedArenaIds] = useState<string[]>(
    profile?.arenaIds ?? []
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleArena = (arenaId: string) => {
    setSelectedArenaIds((prev) =>
      prev.includes(arenaId) ? prev.filter((id) => id !== arenaId) : [...prev, arenaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/trainers/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          photoUrl,
          city,
          phone,
          arenaIds: selectedArenaIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      setMessage({ type: "success", text: "Profilis sėkmingai atnaujintas!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nepavyko išsaugoti profilio" });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="card p-6 text-center text-gray-500">
        <p>Profilis dar nesukurtas. Susisiekite su administratoriumi.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-600 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card p-6 space-y-5">
        <h2 className="font-800 text-[#0B5C71] text-lg">Pagrindinė informacija</h2>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Vardas / Pseudonimas <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            placeholder="Jūsų vardas arba pseudonimas"
          />
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Miestas <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            placeholder="Pvz. Vilnius"
          />
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Telefono numeris
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            placeholder="+370 600 00000"
          />
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Nuotraukos URL
          </label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            placeholder="https://..."
          />
          {photoUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Apie mane (bio)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] resize-none"
            placeholder="Papasakokite apie savo patirtį, treniravimo stilių..."
          />
        </div>
      </div>

      {/* Arenas */}
      <div className="card p-6">
        <h2 className="font-800 text-[#0B5C71] text-lg mb-4">Mano arenos</h2>
        {arenas.length === 0 ? (
          <p className="text-sm text-gray-500">Patvirtintų arenų nėra.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {arenas.map((arena) => {
              const checked = selectedArenaIds.includes(arena.id);
              return (
                <label
                  key={arena.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? "border-[#FF5733] bg-[#FF5733]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArena(arena.id)}
                    className="w-4 h-4 accent-[#FF5733]"
                  />
                  <div>
                    <p className="text-sm font-700 text-[#0B5C71]">{arena.name}</p>
                    <p className="text-xs text-gray-500">{arena.city}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saugoma..." : "Išsaugoti"}
        </button>
      </div>
    </form>
  );
}
