import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Dumbbell,
  Globe,
} from "lucide-react";
import DashboardMobileNav from "@/components/DashboardMobileNav";
import { getSiteSettings } from "@/lib/settings";

const navItems = [
  { href: "/client/dashboard", label: "Mano paskyra", icon: LayoutDashboard },
  { href: "/client/bookings", label: "Rezervacijos", icon: Calendar },
  { href: "/client/profile", label: "Profilis", icon: User },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, { logoUrl }] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
  ]);
  if (!session) {
    redirect("/auth/login?callbackUrl=/client/dashboard");
  }

  const user = session.user as any;
  const email = user?.email ?? "";
  const name = user?.name || email;

  return (
    <div className="min-h-screen flex bg-[#F4F4F4]">
      {/* Sidebar – desktop */}
      <aside className="w-64 bg-[#0B5C71] text-white hidden lg:flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/client/dashboard" className="flex items-center gap-2 font-black text-lg">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
            ) : (
              <span className="w-8 h-8 rounded-lg bg-[#FF5733] flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </span>
            )}
            <span>Mano paskyra</span>
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

        <div className="p-4 border-t border-white/10 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-gray-500">Prisijungta kaip</p>
            <p className="text-sm font-semibold text-gray-300 truncate">{name}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Globe size={17} />
            Grįžti į svetainę
          </Link>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={17} />
            Atsijungti
          </Link>
        </div>
      </aside>

      <DashboardMobileNav type="client" email={email} logoUrl={logoUrl} />

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pt-18 lg:pt-0 lg:p-8">
        {children}
      </main>
    </div>
  );
}
