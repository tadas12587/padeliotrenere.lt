"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Dumbbell, User, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLogo from "@/components/AuthLogo";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Slaptažodis turi būti bent 8 simbolių.");
      return;
    }
    if (password !== confirm) {
      setError("Slaptažodžiai nesutampa.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registracijos klaida. Bandykite dar kartą.");
      setLoading(false);
      return;
    }

    // Auto sign-in after successful registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/client/dashboard",
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.ok) {
      window.location.href = "/client/dashboard";
    } else {
      // Registration succeeded but auto-login failed — send to login
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AuthLogo />

        <div className="card p-8">
          <h1 className="text-2xl font-900 text-[#0B5C71] mb-1">Registruotis</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sukurkite naują paskyrą
          </p>

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Vardas
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jūsų vardas"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Slaptažodis
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Bent 8 simboliai"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Pakartokite slaptažodį
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Pakartokite slaptažodį"
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
                <><Loader2 size={16} className="animate-spin" />Registruojama...</>
              ) : (
                "Registruotis"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Jau turite paskyrą?{" "}
            <Link href="/auth/login" className="text-[#FF5733] font-700 hover:underline">
              Prisijungti
            </Link>
          </p>

          <p className="text-xs text-gray-400 text-center mt-3">
            Registruodamiesi sutinkate su{" "}
            <Link href="/terms" className="underline hover:text-gray-600">
              naudojimo sąlygomis
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link href="/" className="hover:text-[#FF5733] transition-colors">
            ← Grįžti į svetainę
          </Link>
        </p>
      </div>
    </div>
  );
}
