"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setLogoUrl(d.logoUrl ?? null);
        setSiteName(d.siteName ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="text-center mb-8">
      <Link href="/" className="inline-flex items-center gap-2 font-black text-xl">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={siteName ?? "Logo"} className="h-10 w-auto object-contain" />
        ) : (
          <>
            <span className="w-10 h-10 rounded-xl bg-[#FF5733] flex items-center justify-center">
              <Dumbbell size={22} className="text-white" />
            </span>
            <span className="font-heading text-[#0B5C71]">
              Mano<span className="text-[#FF5733]">Treniruote</span>
              <span className="text-sm font-600">.lt</span>
            </span>
          </>
        )}
      </Link>
    </div>
  );
}
