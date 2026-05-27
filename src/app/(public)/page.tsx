import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Users,
  Calendar,
  Star,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-[#0d0d0d] text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#16213e] via-[#0d0d0d] to-[#0d0d0d]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#e94560]/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#0f3460]/30 blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(233,69,96,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(233,69,96,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-wide relative z-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-[#e94560]/15 border border-[#e94560]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#e94560] animate-pulse" />
              <span className="text-[#e94560] text-sm font-700 uppercase tracking-wider">
                Profesionalus treneris
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-900 leading-[1.05] mb-6">
              Tavo kelias į{" "}
              <span className="text-[#e94560]">padelio viršūnę</span>
            </h1>

            <p className="text-gray-400 text-lg lg:text-xl max-w-lg mb-8 leading-relaxed">
              Profesionalios treniruotės visiems lygiams – nuo pirmos raketos iki
              turnyrų. Rezervuok savo laiką dabar ir atraski padeli iš naujo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/booking"
                className="btn-primary text-base py-4 px-8 animate-pulse-glow"
              >
                🎾 Rezervuoti treniruotę
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="btn-secondary text-base py-4 px-8 border-white/30 text-white hover:border-[#e94560] hover:text-[#e94560]"
              >
                Sužinoti daugiau
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: "200+", label: "Klientų" },
                { value: "5+", label: "Metų patirties" },
                { value: "98%", label: "Pasitenkinimas" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-900 text-[#e94560]">{value}</p>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image placeholder / visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e94560]/20 to-[#0f3460]/40 rounded-3xl border border-white/10 flex items-center justify-center text-9xl">
                🎾
              </div>

              {/* Floating stats cards */}
              <div className="absolute -left-8 top-1/4 bg-white text-gray-900 rounded-2xl p-4 shadow-2xl min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} className="text-[#e94560] fill-[#e94560]" />
                  <span className="font-800 text-sm">4.9/5.0</span>
                </div>
                <p className="text-xs text-gray-500">200+ atsiliepimų</p>
              </div>

              <div className="absolute -right-8 bottom-1/4 bg-[#e94560] text-white rounded-2xl p-4 shadow-2xl min-w-[150px]">
                <p className="font-800 text-2xl">50+</p>
                <p className="text-sm opacity-90">treniruočių per mėnesį</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Services Section ──────────────────────────────────────────────────────────
const services = [
  {
    icon: "🏆",
    title: "Individualios treniruotės",
    desc: "100% dėmesys tau. Treniruotė pritaikyta tavo tikslams ir lygiui. Greičiausias progresas.",
    duration: "60 min",
    from: "nuo 40€",
  },
  {
    icon: "👥",
    title: "Grupinės treniruotės",
    desc: "2–4 žmonės. Smagu, dinamiška ir ekonomiška. Puikiai tinka draugams ar porai.",
    duration: "90 min",
    from: "nuo 20€/asm.",
  },
  {
    icon: "🎯",
    title: "Technikos korekcija",
    desc: "Video analizė + komentarai. Greitai identifikuojame ir taisome klaidas.",
    duration: "45 min",
    from: "nuo 30€",
  },
  {
    icon: "📈",
    title: "Turnyrų paruošimas",
    desc: "Intensyvus kursas prieš turnyrą. Taktika, psichologija, fizinis paruošimas.",
    duration: "Pagal poreikį",
    from: "Individualiai",
  },
];

function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Paslaugos
          </span>
          <h2 className="text-4xl font-900 mt-2 text-[#16213e]">
            Ką aš siūlau?
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Visų lygių treniruotės – nuo pirmojo žaidimo iki profesionalių
            varžybų
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="card p-7 flex flex-col gap-4 group"
            >
              <div className="text-5xl">{s.icon}</div>
              <div>
                <h3 className="font-800 text-xl text-[#16213e] mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Clock size={14} />
                  <span>{s.duration}</span>
                </div>
                <span className="font-700 text-[#e94560] text-sm">{s.from}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/booking" className="btn-primary">
            Rezervuoti treniruotę <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── About Preview Section ─────────────────────────────────────────────────────
function AboutSection() {
  const facts = [
    "ATP / WPT sertifikuotas treneris",
    "5+ metų treniravimo patirtis",
    "Tarptautinių turnyrų dalyvis",
    "Lietuvos padelio čempionatas – 2x nugalėtojas",
  ];

  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="container-tight">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual placeholder */}
          <div className="relative order-2 lg:order-1">
            <div className="relative bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-3xl overflow-hidden aspect-[4/5] flex items-center justify-center">
              <span className="text-8xl">🏅</span>

              {/* Overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#e94560] flex items-center justify-center shrink-0">
                  <Trophy size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-800 text-[#16213e] text-sm">
                    Sertifikuotas treneris
                  </p>
                  <p className="text-gray-500 text-xs">ATP / WPT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
              Apie mane
            </span>
            <h2 className="text-4xl font-900 mt-2 mb-5 text-[#16213e]">
              Tavo treneris ir partneris korte
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Esu aistruolis ir profesionalas viename. Su padeli susipažinau prieš
              daugiau nei 10 metų, o treniruoju jau 5+ metus. Mano tikslas –
              padėti kiekvienam klientui atrasti savo žaidimą ir mėgautis šiuo
              nuostabiausiu sportu.
            </p>

            <ul className="flex flex-col gap-3 mb-8">
              {facts.map((fact) => (
                <li key={fact} className="flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-[#e94560] shrink-0"
                    fill="rgba(233,69,96,0.1)"
                  />
                  <span className="text-gray-700 font-500 text-sm">{fact}</span>
                </li>
              ))}
            </ul>

            <Link href="/about" className="btn-primary">
              Skaityti daugiau <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Pasirink laiką",
      desc: "Peržiūrėk laisvus laikus ir pasirink patogų laiką.",
    },
    {
      step: "02",
      title: "Rezervuok",
      desc: "Užregistruok treniruotę su arba be paskyros.",
    },
    {
      step: "03",
      title: "Gauk patvirtinimą",
      desc: "El. paštu ir push pranešimu gausi patvirtinimą.",
    },
    {
      step: "04",
      title: "Ateik ir žaisk!",
      desc: "Atvyk į kortą ir pradėk gerinti savo žaidimą.",
    },
  ];

  return (
    <section className="py-20 bg-[#16213e] text-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Kaip tai veikia?
          </span>
          <h2 className="text-4xl font-900 mt-2">4 žingsniai iki treniruotės</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e94560]/15 border border-[#e94560]/30 flex items-center justify-center mx-auto mb-5">
                <span className="text-[#e94560] font-900 text-xl">{step}</span>
              </div>
              <h3 className="font-800 text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/booking" className="btn-primary">
            Pradėti dabar <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Marius K.",
    text: "Po 3 mėnesių treniruočių mano žaidimas pagerėjo neįtikėtinai. Treneris randa klaidas, kurių aš pats nesuprantu!",
    stars: 5,
    level: "Pradedantysis",
  },
  {
    name: "Eglė P.",
    text: "Puikus treneris – kantrūs, motyvuojantis ir profesionalus. Rekomenduoju visiems!",
    stars: 5,
    level: "Vidutinis lygis",
  },
  {
    name: "Tomas B.",
    text: "Ruošiausi turnyrui 2 mėnesius. Rezultatas – pirmoji vieta regione. Ačiū!",
    stars: 5,
    level: "Pažengęs",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Atsiliepimai
          </span>
          <h2 className="text-4xl font-900 mt-2 text-[#16213e]">
            Ką sako mano klientai
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, text, stars, level }) => (
            <div key={name} className="card p-7 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-[#e94560] fill-[#e94560]"
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-[#e94560]/10 flex items-center justify-center font-800 text-[#e94560] text-sm">
                  {name[0]}
                </div>
                <div>
                  <p className="font-700 text-sm text-[#16213e]">{name}</p>
                  <p className="text-xs text-gray-400">{level}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#e94560] to-[#c73352]">
      <div className="container-tight text-center text-white">
        <h2 className="text-4xl lg:text-5xl font-900 mb-4">
          Pradėk savo padelio kelionę šiandien
        </h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
          Pirma treniruotė – pirmasis žingsnis. Rezervuok laiką dabar ir
          sužinok, koks gali būti tavo žaidimas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#e94560] font-800 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            🎾 Rezervuoti treniruotę
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-700 px-8 py-4 rounded-lg hover:bg-white hover:text-[#e94560] transition-all"
          >
            Susisiekti
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
