"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Props {
  sports: Sport[];
}

export default function CreateTrainerForm({ sports }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [sportIds, setSportIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSport(id: string) {
    setSportIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          city,
          phone: phone || undefined,
          bio: bio || undefined,
          photoUrl: photoUrl || undefined,
          sportIds: sportIds.length > 0 ? sportIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klaida kuriant trenerio profilį");
        return;
      }
      router.push("/admin/trainers");
    } catch {
      setError("Tinklo klaida");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            El. paštas *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. treneris@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Rodomas vardas *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. Jonas Jonaitis"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Miestas *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. Vilnius"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Telefonas
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. +370 600 00000"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Aprašymas / Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors resize-none"
            placeholder="Trumpas trenerio aprašymas..."
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Nuotraukos URL
          </label>
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="https://..."
          />
        </div>

        {sports.length > 0 && (
          <div>
            <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
              Sporto šakos
            </label>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <label
                  key={sport.id}
                  className="flex items-center gap-1.5 cursor-pointer bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-[#0B5C71] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={sportIds.includes(sport.id)}
                    onChange={() => toggleSport(sport.id)}
                    className="accent-[#0B5C71]"
                  />
                  {sport.iconUrl ? (
                    <img src={sport.iconUrl} alt={sport.name} className="w-4 h-4 object-contain rounded" />
                  ) : sport.icon ? (
                    <span>{sport.icon}</span>
                  ) : null}
                  <span className="text-gray-700">{sport.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sukurti trenerį
          </button>
        </div>
      </form>
    </div>
  );
}
