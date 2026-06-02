"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Dumbbell, Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import AuthLogo from "@/components/AuthLogo";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600 font-700 mb-4">Negaliojanti nuoroda.</p>
        <Link href="/auth/forgot-password" className="btn-primary justify-center">
          Gauti naują nuorodą
        </Link>
      </div>
    );
  }

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

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Klaida. Bandykite dar kartą.");
    }
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-900 text-[#0B5C71] mb-3">Slaptažodis pakeistas!</h1>
        <p className="text-gray-500 mb-6">Dabar galite prisijungti su nauju slaptažodžiu.</p>
        <Link href="/auth/login" className="btn-primary justify-center">
          Prisijungti
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-900 text-[#0B5C71] mb-1">Naujas slaptažodis</h1>
      <p className="text-gray-500 text-sm mb-6">Įveskite naują slaptažodį.</p>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
            Naujas slaptažodis
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
            <><Loader2 size={16} className="animate-spin" />Keičiama...</>
          ) : (
            "Pakeisti slaptažodį"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AuthLogo />

        <Suspense fallback={
          <div className="card p-8 flex items-center justify-center min-h-[200px]">
            <Loader2 size={24} className="animate-spin text-[#FF5733]" />
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link href="/" className="hover:text-[#FF5733] transition-colors">
            ← Grįžti į svetainę
          </Link>
        </p>
      </div>
    </div>
  );
}
