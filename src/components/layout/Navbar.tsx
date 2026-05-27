"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Pagrindinis" },
  { href: "/about", label: "Apie mane" },
  { href: "/booking", label: "Rezervacija" },
  { href: "/blog", label: "Blog'as" },
  { href: "/contact", label: "Kontaktai" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
      style={{ height: "var(--header-height)" }}
    >
      <nav className="container-wide h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl tracking-tight hover:opacity-90 transition-opacity"
          onClick={() => setOpen(false)}
        >
          <span className="w-9 h-9 rounded-lg bg-[#e94560] flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </span>
          <span className="text-[#16213e]">
            Padelio<span className="text-[#e94560]">Treneris</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-600 transition-all",
                  pathname === href
                    ? "bg-[#e94560] text-white font-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#e94560]"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-600 text-gray-700 hover:text-[#e94560] transition-colors px-3 py-2"
          >
            Prisijungti
          </Link>
          <Link href="/booking" className="btn-primary text-sm py-2 px-5">
            Rezervuoti
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="container-wide py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-600 transition-all",
                    pathname === href
                      ? "bg-[#e94560] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-600 text-center border-2 border-gray-200 text-gray-700 hover:border-[#e94560] hover:text-[#e94560] transition-all"
              >
                Prisijungti
              </Link>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm text-center"
              >
                🎾 Rezervuoti dabar
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
