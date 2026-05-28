import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Award, Users, Star, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Apie mane",
  description:
    "Sužinokite daugiau apie padelio trenerį – patirtis, kvalifikacijos ir filosofija.",
};

export default function AboutPage() {
  const achievements = [
    { icon: Trophy, label: "Lietuvos čempionatas", value: "2x nugalėtojas" },
    { icon: Award, label: "ATP/WPT sertifikatas", value: "Tarptautinis" },
    { icon: Users, label: "Apmokyti klientai", value: "200+" },
    { icon: Star, label: "Metų patirtis", value: "5+" },
  ];

  const skills = [
    { label: "Technikos mokymas", pct: 95 },
    { label: "Taktinis paruošimas", pct: 90 },
    { label: "Fizinis kondicionavimas", pct: 85 },
    { label: "Psichologinis koučingas", pct: 80 },
  ];

  const timeline = [
    {
      year: "2014",
      title: "Pradėjau žaisti padeli",
      desc: "Pirmasis susipažinimas su padeli kaip sportu.",
    },
    {
      year: "2018",
      title: "Pirmoji trenerio kvalifikacija",
      desc: "ATP/WPT sertifikuoto trenerio kursai.",
    },
    {
      year: "2019",
      title: "Pradėjau treniruoti",
      desc: "Pirmieji individualūs ir grupiniai užsiėmimai.",
    },
    {
      year: "2021",
      title: "Lietuvos čempionatas",
      desc: "Pirmoji vieta Lietuvos padelio čempionate.",
    },
    {
      year: "2023",
      title: "200+ klientų",
      desc: "Pasiektas svarbus milžinas – 200 apmokytų klientų.",
    },
    {
      year: "2025",
      title: "Dabar",
      desc: "Kiekvieną dieną keliu savo klientų žaidimą į naują lygį.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#0B5C71] text-white py-20">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
                Apie mane
              </span>
              <h1 className="text-4xl lg:text-5xl font-900 mt-3 mb-5">
                Vardas Pavardenis
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Sertifikuotas padelio treneris su daugiau nei 5 metų patirtimi.
                Mano aistra – padėti žmonėms atrasti padelį ir pasiekti savo tikslus
                korte.
              </p>
              <div className="flex gap-4">
                <Link href="/booking" className="btn-primary">
                  Rezervuoti treniruotę <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Photo placeholder */}
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-[#083d4e] to-[#FF5733]/20 rounded-3xl flex items-center justify-center text-9xl border border-white/10">
                👤
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-tight">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-6 card">
                <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-[#FF5733]" />
                </div>
                <p className="font-900 text-2xl text-[#0B5C71]">{value}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#F4F4F4]">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
                Mano istorija
              </span>
              <h2 className="text-3xl font-900 mt-2 mb-5 text-[#0B5C71]">
                Kaip viskas prasidėjo
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Su padeli susipažinau atsitiktinai – draugas pakvietė
                  pamėginti. Po pirmojo žaidimo supratau, kad tai yra kažkas
                  ypatingo. Padelis sujungia techniką, taktiką, greitumą ir
                  socialinį aspektą kaip jokia kita sporto šaka.
                </p>
                <p>
                  Labai greitai tapau apsėstas šio sporto. Pradėjau reguliariai
                  žaisti, vykau į turnyrų, mokiausi iš geriausių trenerių
                  Ispanijoje ir Argentinoje.
                </p>
                <p>
                  2018 metais nusprendžiau dalintis savo žiniomis su kitais ir
                  gavau ATP/WPT sertifikuoto trenerio kvalifikaciją. Nuo tada
                  apmokyti daugiau nei 200 klientų – tai mano didžiausia
                  gyvenimo pasiekimas.
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
                Kompetencijos
              </span>
              <h2 className="text-3xl font-900 mt-2 mb-6 text-[#0B5C71]">
                Ko aš moku geriausiai
              </h2>
              <div className="space-y-5">
                {skills.map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className="font-600 text-sm text-[#0B5C71]">{label}</span>
                      <span className="text-sm text-[#FF5733] font-700">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5733] to-[#E04520] rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container-tight">
          <div className="text-center mb-12">
            <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
              Kelias
            </span>
            <h2 className="text-3xl font-900 mt-2 text-[#0B5C71]">
              Mano kelionė
            </h2>
          </div>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-0.5" />

            <div className="space-y-8">
              {timeline.map(({ year, title, desc }, i) => (
                <div
                  key={year}
                  className={`relative flex items-start gap-8 ${
                    i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } pl-12 lg:pl-0`}
                >
                  {/* Dot */}
                  <div className="absolute left-0 lg:left-1/2 w-8 h-8 rounded-full bg-[#FF5733] flex items-center justify-center -translate-x-0 lg:-translate-x-4 shrink-0 mt-1 z-10">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>

                  {/* Content */}
                  <div
                    className={`w-full lg:w-5/12 ${
                      i % 2 === 0 ? "" : "lg:text-right"
                    }`}
                  >
                    <div className="card p-5">
                      <span className="text-[#FF5733] font-900 text-lg">{year}</span>
                      <h3 className="font-800 text-[#0B5C71] mt-1">{title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{desc}</p>
                    </div>
                  </div>

                  {/* Spacer for alternating */}
                  <div className="hidden lg:block w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#FF5733]">
        <div className="container-tight text-center text-white">
          <h2 className="text-3xl font-900 mb-3">
            Pasiruošęs pradėti?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Rezervuok savo pirmąją treniruotę ir pradėk tobulėti šiandien.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-[#FF5733] font-800 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            🎾 Rezervuoti treniruotę
          </Link>
        </div>
      </section>
    </div>
  );
}
