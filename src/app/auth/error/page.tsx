"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dumbbell, AlertTriangle } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "Serverio konfigūracijos klaida.",
  AccessDenied: "Prieiga uždrausta.",
  Verification: "Prisijungimo nuoroda nebegalioja arba jau panaudota.",
  Default: "Įvyko klaida prisijungiant. Bandykite dar kartą.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="card p-10">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-black text-[#0B5C71] mb-3">Prisijungimo klaida</h1>
      <p className="text-gray-500 leading-relaxed">{message}</p>
      <Link href="/auth/login" className="btn-primary mt-6 inline-flex">
        Bandyti dar kartą
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-xl mb-8">
          <span className="w-10 h-10 rounded-xl bg-[#FF5733] flex items-center justify-center">
            <Dumbbell size={22} className="text-white" />
          </span>
          <span className="font-heading text-[#0B5C71]">Mano<span className="text-[#FF5733]">Treniruote</span><span className="text-[#0B5C71] text-sm font-600">.lt</span></span>
        </Link>

        <Suspense
          fallback={
            <div className="card p-10">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-[#0B5C71] mb-3">Prisijungimo klaida</h1>
              <p className="text-gray-500 leading-relaxed">{errorMessages.Default}</p>
            </div>
          }
        >
          <ErrorContent />
        </Suspense>

        <Link href="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-[#FF5733] transition-colors">
          ← Grįžti į pagrindinį
        </Link>
      </div>
    </div>
  );
}
