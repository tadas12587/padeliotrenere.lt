import { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, AtSign, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontaktai",
  description: "Susisiekite su padelio treneriu – telefonu, el. paštu ar socialiniais tinklais.",
};

export default function ContactPage() {
  const contacts = [
    {
      icon: Phone,
      label: "Telefonas",
      value: "+370 600 00000",
      href: "tel:+37060000000",
    },
    {
      icon: Mail,
      label: "El. paštas",
      value: "info@padeliotrenere.lt",
      href: "mailto:info@padeliotrenere.lt",
    },
    {
      icon: MapPin,
      label: "Miestas",
      value: "Vilnius, Lietuva",
      href: null,
    },
    {
      icon: Clock,
      label: "Darbo laikas",
      value: "Pir–Šeš: 7:00–21:00",
      href: null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#16213e] text-white py-14">
        <div className="container-tight text-center">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Kontaktai
          </span>
          <h1 className="text-4xl font-900 mt-2 mb-3">Susisiekite</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Turite klausimų? Rašykite arba skambinkite – atsakysiu kuo greičiau.
          </p>
        </div>
      </div>

      <div className="container-tight py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-900 text-[#16213e] mb-6">
              Kontaktinė informacija
            </h2>

            <div className="space-y-4 mb-8">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-[#e94560]/10 flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-[#e94560]" />
                  </div>
                  <div>
                    <p className="text-xs font-700 text-gray-400 uppercase tracking-wide">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-700 text-[#16213e] hover:text-[#e94560] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-700 text-[#16213e]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="font-700 text-[#16213e] mb-3">Socialiniai tinklai</p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-600 text-gray-700 hover:border-[#e94560] hover:text-[#e94560] transition-all"
                >
                  <AtSign size={18} />
                  Instagram
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-600 text-gray-700 hover:border-[#e94560] hover:text-[#e94560] transition-all"
                >
                  <Share2 size={18} />
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card p-8">
            <h2 className="text-2xl font-900 text-[#16213e] mb-6">
              Rašykite žinutę
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                    Vardas
                  </label>
                  <input
                    type="text"
                    placeholder="Jūsų vardas"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                    El. paštas
                  </label>
                  <input
                    type="email"
                    placeholder="jusu@pastas.lt"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                  Tema
                </label>
                <input
                  type="text"
                  placeholder="Apie ką norite paklausi?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                  Žinutė
                </label>
                <textarea
                  rows={5}
                  placeholder="Parašykite savo žinutę..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e94560] transition-colors resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3">
                📨 Siųsti žinutę
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
