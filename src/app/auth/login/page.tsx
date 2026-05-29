"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/client/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      window.location.href = callbackUrl;
    } else {
      setError("Neteisingas el. paštas arba slaptažodis.");
    }
  };

  const handleGoogleSignin = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-900 text-[#0B5C71] mb-1">Prisijungti</h1>
      <p className="text-gray-500 text-sm mb-6">
        Prisijunkite prie savo paskyros
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </p>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignin}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-5 py-3 text-sm font-600 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all mb-5"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Tęsti su Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400 font-600">arba</span>
        </div>
      </div>

      {/* Email + password */}
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
              placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-gray-400 hover:text-[#FF5733] transition-colors"
          >
            Pamiršote slaptažodį?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-sm"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Jungiamasi...</>
          ) : (
            "Prisijungti"
          )}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        Neturite paskyros?{" "}
        <Link href="/auth/register" className="text-[#FF5733] font-700 hover:underline">
          Registruotis
        </Link>
      </p>

      <p className="text-xs text-gray-400 text-center mt-3">
        Prisijungdami sutinkate su{" "}
        <Link href="/terms" className="underline hover:text-gray-600">
          naudojimo sąlygomis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
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

        <Suspense
          fallback={
            <div className="card p-8 flex items-center justify-center min-h-[200px]">
              <Loader2 size={24} className="animate-spin text-[#FF5733]" />
            </div>
          }
        >
          <LoginContent />
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
