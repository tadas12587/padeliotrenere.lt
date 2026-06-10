"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[#FF5733]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-800 text-[#0B5C71] mb-3">Kažkas nepavyko</h1>
        <p className="text-gray-500 mb-8">
          Įvyko netikėta klaida. Pabandykite dar kartą arba grįžkite į pradžią.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Bandyti dar kartą
          </button>
          <Link href="/" className="btn-secondary">
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
