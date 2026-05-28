import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Award,
  CalendarDays,
  LogOut,
  Dumbbell,
} from "lucide-react";

const navItems = [
  { href: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainer/profile", label: "Profilis", icon: User },
  { href: "/trainer/certifications", label: "Sertifikatai", icon: Award },
  { href: "/trainer/calendar", label: "Kalendorius", icon: CalendarDays },
];

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user as any;

  if (user.role !== "TRAINER") {
    redirect("/");
  }

  if (user.trainerStatus !== "APPROVED") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-xl font-900 text-[#16213e] mb-2">
            Paskyra laukia patvirtinimo
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Jūsų trenerio paskyra šiuo metu peržiūrima administratoriaus. Kai
            paskyra bus patvirtinta, galėsite naudotis visomis funkcijomis.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Statusas:{" "}
            <span className="font-700 text-yellow-600">
              {user.trainerStatus ?? "PENDING"}
            </span>
          </p>
          <Link href="/api/auth/signout" className="btn-secondary text-sm">
            Atsijungti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      {/* Sidebar – desktop */}
      <aside className="w-64 bg-[#16213e] text-white hidden lg:flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Link
            href="/trainer/dashboard"
            className="flex items-center gap-2 font-black text-lg"
          >
            <span className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </span>
            <span>Trenerio zona</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Prisijungta kaip</p>
            <p className="text-sm font-semibold text-gray-300 truncate">
              {user.email}
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={17} />
            Atsijungti
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#16213e] text-white px-4 h-14 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-[#e94560] flex items-center justify-center">
          <Dumbbell size={14} className="text-white" />
        </span>
        <span className="font-black text-sm">Trenerio zona</span>
        <nav className="flex gap-2 ml-auto">
          {navItems.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Icon size={16} />
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pt-18 lg:pt-0 lg:p-8">
        {children}
      </main>
    </div>
  );
}
