import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, User, LogOut, Dumbbell, Bell } from "lucide-react";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login?callbackUrl=/client/dashboard");
  }

  const navItems = [
    { href: "/client/dashboard", label: "Mano paskyra", icon: User },
    { href: "/client/bookings", label: "Rezervacijos", icon: Calendar },
    { href: "/client/profile", label: "Profilis", icon: Bell },
  ];

  const userName = (session.user as any)?.name || session.user?.email || "";

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Top bar */}
      <header className="bg-[#0B5C71] text-white sticky top-0 z-40">
        <div className="container-wide h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-lg">
            <span className="w-8 h-8 rounded-lg bg-[#FF5733] flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </span>
            <span className="hidden sm:block">
              Padelio<span className="text-[#FF5733]">Treneris</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 hidden sm:block truncate max-w-[160px]">
              {userName}
            </span>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Atsijungti</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="card p-3 flex flex-row lg:flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#FF5733] transition-all flex-1 lg:flex-none"
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
