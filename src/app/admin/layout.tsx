import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Clock,
  Users,
  FileText,
  LogOut,
  Dumbbell,
  UserCheck,
  Building2,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Kalendorius", icon: CalendarDays },
  { href: "/admin/bookings", label: "Rezervacijos", icon: BookOpen },
  { href: "/admin/slots", label: "Laiko tarpai", icon: Clock },
  { href: "/admin/articles", label: "Straipsniai", icon: FileText },
  { href: "/admin/users", label: "Vartotojai", icon: Users },
  { href: "/admin/trainers", label: "Treneriai", icon: UserCheck },
  { href: "/admin/arenas", label: "Arenos", icon: Building2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-[#F4F4F4]">
      {/* Sidebar – desktop */}
      <aside className="w-64 bg-[#0B5C71] text-white hidden lg:flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-black text-lg">
            <span className="w-8 h-8 rounded-lg bg-[#FF5733] flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </span>
            <span>Admin Panel</span>
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
              {(session as any).user?.email}
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B5C71] text-white px-4 h-14 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-[#FF5733] flex items-center justify-center">
          <Dumbbell size={14} className="text-white" />
        </span>
        <span className="font-black text-sm">Admin Panel</span>
        {/* Future: mobile menu toggle */}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pt-18 lg:pt-0 lg:p-8">
        {children}
      </main>
    </div>
  );
}
