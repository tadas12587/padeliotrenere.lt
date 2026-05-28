"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Trash2 } from "lucide-react";

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  year: number;
}

export default function TrainerCertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCerts = async () => {
    try {
      const res = await fetch("/api/trainer/certifications");
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMessage(null);

    try {
      const res = await fetch("/api/trainer/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, issuedBy, year: Number(year) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      setName("");
      setIssuedBy("");
      setYear(String(new Date().getFullYear()));
      setMessage({ type: "success", text: "Sertifikatas pridėtas!" });
      await fetchCerts();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nepavyko pridėti sertifikato" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį sertifikatą?")) return;

    try {
      const res = await fetch(`/api/trainer/certifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Klaida");
      setCerts((prev) => prev.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "Sertifikatas ištrintas." });
    } catch {
      setMessage({ type: "error", text: "Nepavyko ištrinti sertifikato." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Sertifikatai</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pridėkite savo kvalifikacijos sertifikatus
        </p>
      </div>

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

      {/* Add form */}
      <div className="card p-6">
        <h2 className="font-800 text-[#0B5C71] mb-4 flex items-center gap-2">
          <Plus size={18} />
          Pridėti sertifikatą
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Pavadinimas <span className="text-[#FF5733]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              placeholder="Pvz. Padel Level 1"
            />
          </div>
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Išdavė <span className="text-[#FF5733]">*</span>
            </label>
            <input
              type="text"
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              placeholder="Pvz. Padel Federation"
            />
          </div>
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Metai <span className="text-[#FF5733]">*</span>
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              min={1990}
              max={new Date().getFullYear()}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={adding}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              <Plus size={16} />
              {adding ? "Pridedama..." : "Pridėti"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="card p-6">
        <h2 className="font-800 text-[#0B5C71] mb-4">Mano sertifikatai</h2>

        {loading ? (
          <p className="text-sm text-gray-400">Kraunama...</p>
        ) : certs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Award size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Sertifikatų nėra</p>
            <p className="text-sm mt-1">Pridėkite savo kvalifikacinius sertifikatus aukščiau</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0">
                    <Award size={18} className="text-[#FF5733]" />
                  </div>
                  <div>
                    <p className="font-700 text-[#0B5C71] text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500">
                      {cert.issuedBy} · {cert.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-gray-400 hover:text-[#FF5733] hover:bg-[#FF5733]/10 rounded-lg transition-colors"
                  title="Ištrinti"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
