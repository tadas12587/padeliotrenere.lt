import Link from "next/link";
import { Dumbbell, AtSign, Share2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#16213e] text-white">
      <div className="container-wide py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 font-black text-xl mb-4">
            <span className="w-9 h-9 rounded-lg bg-[#e94560] flex items-center justify-center">
              <Dumbbell size={20} className="text-white" />
            </span>
            <span>
              Padelio<span className="text-[#e94560]">Treneris</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Profesionalios padelio treniruotės visiems lygiams.
            Nuo pradedančiųjų iki pažengusių žaidėjų.
          </p>
          <div className="flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#e94560] transition-colors"
              aria-label="Instagram"
            >
              <AtSign size={18} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#e94560] transition-colors"
              aria-label="Facebook"
            >
              <Share2 size={18} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-800 text-sm uppercase tracking-widest text-gray-400 mb-4">
            Navigacija
          </h3>
          <ul className="flex flex-col gap-2">
            {[
              { href: "/", label: "Pagrindinis" },
              { href: "/about", label: "Apie mane" },
              { href: "/booking", label: "Rezervacija" },
              { href: "/blog", label: "Blog'as" },
              { href: "/contact", label: "Kontaktai" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-gray-400 hover:text-[#e94560] transition-colors text-sm"
                >
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
            <li className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={16} className="text-[#e94560] shrink-0" />
              <a href="tel:+37060000000">+370 600 00000</a>
            </li>
            <li className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={16} className="text-[#e94560] shrink-0" />
              <a href="mailto:info@padeliotrenere.lt">info@padeliotrenere.lt</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-[#e94560] shrink-0 mt-0.5" />
              <span>Vilnius, Lietuva</span>
            </li>
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
          <p>© {year} Padelio Treneris. Visos teisės saugomos.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privatumo politika
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Naudojimo sąlygos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
