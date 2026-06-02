import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Wrench } from "lucide-react";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getServerSession(authOptions),
  ]);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (settings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B5C71] flex items-center justify-center p-8">
        <div className="text-center text-white max-w-lg">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Wrench size={36} className="text-[#FF5733]" />
          </div>
          <h1 className="text-3xl font-900 mb-4">Svetainė tvarkoma</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            {settings.maintenanceMsg || "Grįžkite netrukus – atnaujinome sistemą jūsų patogumui."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <main
        className="flex-1 flex flex-col"
        style={{ paddingTop: "var(--header-height)" }}
      >
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
