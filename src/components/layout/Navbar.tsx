"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Dumbbell, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/", label: "Pagrindinis" },
  { href: "/trainers", label: "Treneriai" },
  { href: "/arenas", label: "Arenos" },
  { href: "/booking", label: "Rezervacija" },
  { href: "/blog", label: "Blog'as" },
  { href: "/contact", label: "Kontaktai" },
];

function getDashboardLink(role: string, trainerStatus: string | null | undefined) {
  if (role === "ADMIN") return { href: "/admin/dashboard", label: "Admin" };
  if (role === "TRAINER" && trainerStatus === "APPROVED") return { href: "/trainer/dashboard", label: "Trenerio sritis" };
  if (role === "TRAINER") return { href: "/trainer/dashboard", label: "Mano sritis" };
  return { href: "/client/dashboard", label: "Mano sritis" };
}

export default function Navbar({
  logoUrl,
  siteName,
}: {
  logoUrl?: string | null;
  siteName?: string | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user as any;
  const isLoggedIn = !!session?.user;
  const dashboard = isLoggedIn ? getDashboardLink(user?.role ?? "CLIENT", user?.trainerStatus) : null;

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
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName ?? "Logo"} className="h-9 w-auto object-contain" />
          ) : (
            <>
              <span className="w-9 h-9 rounded-lg bg-[#FF5733] flex items-center justify-center">
                <Dumbbell size={20} className="text-white" />
              </span>
              <span className="font-heading text-[#0B5C71]">
                {siteName ?? (
                  <>Mano<span className="text-[#FF5733]">Treniruote</span><span className="text-[#0B5C71] text-sm font-600">.lt</span></>
                )}
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {publicNavLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-600 transition-all",
                  pathname === href
                    ? "bg-[#FF5733] text-white font-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#FF5733]"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#FF5733]/15 flex items-center justify-center text-[#FF5733] font-800 text-xs">
                  {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="max-w-[120px] truncate">{user?.name ?? user?.email}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                  {dashboard && (
                    <Link
                      href={dashboard.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF5733] transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      {dashboard.label}
                    </Link>
                  )}
                  <Link
                    href="/client/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF5733] transition-colors"
                  >
                    <User size={15} />
                    Profilis
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF5733] transition-colors"
                  >
                    <LogOut size={15} />
                    Atsijungti
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-600 text-gray-700 hover:text-[#FF5733] transition-colors px-3 py-2"
              >
                Prisijungti
              </Link>
              <Link href="/booking" className="btn-primary text-sm py-2 px-5">
                Rezervuoti
              </Link>
            </>
          )}
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
            {publicNavLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-600 transition-all",
                    pathname === href
                      ? "bg-[#FF5733] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {dashboard && (
                    <Link
                      href={dashboard.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-600 text-center bg-[#0B5C71] text-white transition-all"
                    >
                      {dashboard.label}
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                    className="block w-full px-4 py-3 rounded-lg text-sm font-600 text-center border-2 border-gray-200 text-gray-700 hover:border-[#FF5733] hover:text-[#FF5733] transition-all"
                  >
                    Atsijungti
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-600 text-center border-2 border-gray-200 text-gray-700 hover:border-[#FF5733] hover:text-[#FF5733] transition-all"
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
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
