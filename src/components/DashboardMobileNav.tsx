"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Menu, X, Dumbbell, Globe, LogOut,
  LayoutDashboard, Calendar, User,
  Award, CalendarDays, BarChart2,
  BookOpen, Clock, Users, FileText,
  UserCheck, Building2, Trophy, LayoutList,
} from "lucide-react";

type NavType = "client" | "trainer" | "admin";

const NAV_CONFIG: Record<NavType, {
  title: string;
  items: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[];
}> = {
  client: {
    title: "Mano paskyra",
    items: [
      { href: "/client/dashboard", label: "Mano paskyra", icon: LayoutDashboard },
      { href: "/client/bookings", label: "Rezervacijos", icon: Calendar },
      { href: "/client/profile", label: "Profilis", icon: User },
    ],
  },
  trainer: {
    title: "Trenerio zona",
    items: [
      { href: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/trainer/profile", label: "Profilis", icon: User },
      { href: "/trainer/certifications", label: "Sertifikatai", icon: Award },
      { href: "/trainer/calendar", label: "Kalendorius", icon: CalendarDays },
      { href: "/trainer/stats", label: "Statistika", icon: BarChart2 },
    ],
  },
  admin: {
    title: "Admin Panel",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/calendar", label: "Kalendorius", icon: CalendarDays },
      { href: "/admin/bookings", label: "Rezervacijos", icon: BookOpen },
      { href: "/admin/slots", label: "Laiko tarpai", icon: Clock },
      { href: "/admin/articles", label: "Straipsniai", icon: FileText },
      { href: "/admin/users", label: "Vartotojai", icon: Users },
      { href: "/admin/trainers", label: "Treneriai", icon: UserCheck },
      { href: "/admin/arenas", label: "Arenos", icon: Building2 },
      { href: "/admin/sports", label: "Sporto šakos", icon: Trophy },
      { href: "/admin/service-catalog", label: "Paslaugų katalogas", icon: LayoutList },
    ],
  },
};

interface Props {
  type: NavType;
  email: string;
}

export default function DashboardMobileNav({ type, email }: Props) {
  const [open, setOpen] = useState(false);
  const { title, items } = NAV_CONFIG[type];

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B5C71] text-white">
      {/* Top bar */}
      <div className="px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[#FF5733] flex items-center justify-center shrink-0">
            <Dumbbell size={14} className="text-white" />
          </span>
          <span className="font-black text-sm">{title}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="border-t border-white/10 shadow-2xl overflow-y-auto"
          style={{ maxHeight: "calc(100dvh - 56px)" }}
        >
          <div className="px-3 py-2 flex flex-col gap-0.5">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-600 text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            <div className="h-px bg-white/10 mx-1 my-2" />

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-600 text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
            >
              <Globe size={18} />
              Grįžti į svetainę
            </Link>

            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-600 text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all w-full text-left"
            >
              <LogOut size={18} />
              Atsijungti
            </button>

            {email && (
              <div className="px-4 py-3 text-xs text-white/35 truncate border-t border-white/10 mt-1">
                {email}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
