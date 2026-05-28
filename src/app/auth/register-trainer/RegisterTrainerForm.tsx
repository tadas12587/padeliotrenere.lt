"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Loader2 } from "lucide-react";

interface SportItem {
  id: string;
  name: string;
  icon: string | null;
}

interface Props {
  sports: SportItem[];
}

export default function RegisterTrainerForm({ sports }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    city: "",
    phone: "",
    bio: "",
  });

  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSport = (sportId: string) => {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSportIds.length === 0) {
      setError("Pasirinkite bent vieną sporto šaką.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register-trainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sportIds: selectedSportIds }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Klaida registruojantis. Bandykite dar kartą.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-10 text-center">
            <div className="text-6xl mb-5">✅</div>
            <h1 className="text-2xl font-900 text-[#0B5C71] mb-3">
              Registracija pateikta!
            </h1>
            <p className="text-gray-500 mb-4">
              Jūsų trenerio profilis <strong>{form.displayName}</strong> laukia administratoriaus patvirtinimo.
              Gavę patvirtinimą, galėsite valdyti savo profilį ir tvarkaraštį.
            </p>
            <Link
              href="/client/dashboard"
              className="btn-primary inline-flex items-center gap-2 justify-center"
            >
              Grįžti į paskyrą
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-xl"
          >
            <span className="w-10 h-10 rounded-xl bg-[#FF5733] flex items-center justify-center">
              <Dumbbell size={22} className="text-white" />
            </span>
            <span className="text-[#0B5C71]">
              ManoTreniruote<span className="text-[#FF5733]">.lt</span>
            </span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-900 text-[#0B5C71] mb-1">Registruotis kaip treneris</h1>
          <p className="text-gray-500 text-sm mb-6">
            Užpildykite formą ir laukite administratoriaus patvirtinimo
          </p>

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Vardas / Pavardė *
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Jonas Jonaitis"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Miestas *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Vilnius"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Telefono numeris
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+370 600 00000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Apie save
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Papasakokite apie savo patirtį, sertifikatus, treniravimo stilių..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors resize-none"
              />
            </div>

            {/* Sport selection */}
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Sporto šaka * (pasirinkite bent vieną)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sports.map((sport) => {
                  const checked = selectedSportIds.includes(sport.id);
                  return (
                    <label
                      key={sport.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                        checked
                          ? "border-[#FF5733] bg-[#FF5733]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSport(sport.id)}
                        className="w-4 h-4 accent-[#FF5733]"
                      />
                      {sport.icon && <span>{sport.icon}</span>}
                      <span className="font-600 text-[#0B5C71]">{sport.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Siunčiama...
                </>
              ) : (
                "Pateikti registraciją"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            <Link href="/auth/login" className="underline hover:text-gray-600">
              ← Grįžti į prisijungimą
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
