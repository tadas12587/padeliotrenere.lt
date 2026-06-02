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

export default function CreateArenaForm({ sports }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [courtBookingUrl, setCourtBookingUrl] = useState("");
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
      const res = await fetch("/api/admin/arenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          address,
          description: description || undefined,
          photoUrl: photoUrl || undefined,
          courtBookingUrl: courtBookingUrl || undefined,
          sportIds: sportIds.length > 0 ? sportIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klaida kuriant areną");
        return;
      }
      router.push("/admin/arenas");
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
            Pavadinimas *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. Vilniaus padelo centras"
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
            Adresas *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="pvz. Gedimino pr. 1, Vilnius"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Aprašymas
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors resize-none"
            placeholder="Trumpas arenos aprašymas..."
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

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Kortų rezervacijos nuoroda
          </label>
          <input
            type="url"
            value={courtBookingUrl}
            onChange={(e) => setCourtBookingUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            placeholder="https://rezervacija.lt/..."
          />
          <p className="mt-1 text-xs text-gray-400">Nuoroda į arenos kortų rezervacijos sistemą</p>
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
            Sukurti areną
          </button>
        </div>
      </form>
    </div>
  );
}
