"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Įvyko klaida. Bandykite dar kartą.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Ryšio klaida. Patikrinkite interneto ryšį.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-900 text-[#16213e] mb-2">Žinutė išsiųsta!</h3>
        <p className="text-gray-500 mb-6">
          Gavome jūsų žinutę. Atsakysime per 24 val.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="btn-secondary text-sm py-2 px-5"
        >
          Siųsti dar vieną
        </button>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-900 text-[#16213e] mb-6">Rašykite žinutę</h2>

      {status === "error" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
              Vardas *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jūsų vardas"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
              El. paštas *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jusu@pastas.lt"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Tema *
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Apie ką norite paklausi?"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Žinutė *
          </label>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Parašykite savo žinutę..."
            required
            minLength={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Siunčiama...
            </>
          ) : (
            "📨 Siųsti žinutę"
          )}
        </button>
      </form>
    </div>
  );
}
