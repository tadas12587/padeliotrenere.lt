import Link from "next/link";
import { Dumbbell, Mail, Phone, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconYoutube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const { siteName, tagline, logoUrl, phone, email, address, instagramUrl, facebookUrl, youtubeUrl } = settings;

  const socials = [
    instagramUrl && { href: instagramUrl, label: "Instagram", Icon: IconInstagram },
    facebookUrl  && { href: facebookUrl,  label: "Facebook",  Icon: IconFacebook  },
    youtubeUrl   && { href: youtubeUrl,   label: "YouTube",   Icon: IconYoutube   },
  ].filter(Boolean) as { href: string; label: string; Icon: React.FC<{ size?: number }> }[];

  return (
    <footer className="bg-[#0B5C71] text-white">
      <div className="container-wide py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 font-black text-xl mb-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <span className="w-9 h-9 rounded-lg bg-[#FF5733] flex items-center justify-center">
                  <Dumbbell size={20} className="text-white" />
                </span>
                <span className="font-heading">
                  Mano<span className="text-[#FF5733]">Treniruote</span>
                  <span className="text-white/70 text-sm font-600">.lt</span>
                </span>
              </>
            )}
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            {tagline || "Rask geriausią sporto trenerį Lietuvoje. Padelis, tenisas, krepšinis ir daugiau."}
          </p>
          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF5733] transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-800 text-sm uppercase tracking-widest text-gray-400 mb-4">
            Navigacija
          </h3>
          <ul className="flex flex-col gap-2">
            {[
              { href: "/", label: "Pagrindinis" },
              { href: "/trainers", label: "Treneriai" },
              { href: "/arenas", label: "Arenos" },
              { href: "/booking", label: "Rezervacija" },
              { href: "/blog", label: "Blog'as" },
              { href: "/contact", label: "Kontaktai" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-gray-400 hover:text-[#FF5733] transition-colors text-sm">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-800 text-sm uppercase tracking-widest text-gray-400 mb-4">
            Kontaktai
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            {phone && (
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={16} className="text-[#FF5733] shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={16} className="text-[#FF5733] shrink-0" />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#FF5733] shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
            )}
          </ul>
          <div className="mt-6">
            <Link href="/booking" className="btn-primary text-sm py-2.5 w-full text-center block">
              🎾 Rezervuoti treniruotę
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} {siteName}. Visos teisės saugomos.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privatumo politika</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Naudojimo sąlygos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
