"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Mail, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Klaida. Bandykite dar kartą.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-xl">
            <span className="w-10 h-10 rounded-xl bg-[#FF5733] flex items-center justify-center">
              <Dumbbell size={22} className="text-white" />
            </span>
            <span className="font-heading text-[#0B5C71]">
              Mano<span className="text-[#FF5733]">Treniruote</span>
              <span className="text-sm font-600">.lt</span>
            </span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-900 text-[#0B5C71] mb-3">Laiškas išsiųstas</h1>
              <p className="text-gray-500 mb-2">
                Jei šis el. paštas registruotas sistemoje, gausite slaptažodžio atstatymo nuorodą.
              </p>
              <p className="text-gray-400 text-sm">Nuoroda galioja 1 valandą.</p>
              <Link
                href="/auth/login"
                className="btn-primary mt-6 justify-center"
              >
                Grįžti į prisijungimą
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-900 text-[#0B5C71] mb-1">Pamiršote slaptažodį?</h1>
              <p className="text-gray-500 text-sm mb-6">
                Įveskite el. paštą — atsiųsime atstatymo nuorodą.
              </p>

              {error && (
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                    El. paštas
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jusu@pastas.lt"
                      required
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-sm"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" />Siunčiama...</>
                  ) : (
                    "Siųsti atstatymo nuorodą"
                  )}
                </button>
              </form>

              <p className="text-sm text-center text-gray-500 mt-5">
                <Link href="/auth/login" className="text-[#FF5733] font-700 hover:underline">
                  ← Grįžti į prisijungimą
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
