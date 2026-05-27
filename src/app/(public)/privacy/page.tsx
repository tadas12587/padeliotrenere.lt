import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privatumo politika",
  description: "Padelio Treneris privatumo politika – kaip renkame ir naudojame jūsų duomenis.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-[#16213e] text-white py-12">
        <div className="container-tight">
          <h1 className="text-3xl font-900">Privatumo politika</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Paskutinį kartą atnaujinta: 2025 m. sausio 1 d.
          </p>
        </div>
      </div>

      <div className="container-tight py-12">
        <div className="card p-8 lg:p-12 prose prose-gray max-w-none
          prose-headings:font-900 prose-headings:text-[#16213e]
          prose-a:text-[#e94560] prose-a:no-underline hover:prose-a:underline">

          <h2>1. Duomenų valdytojas</h2>
          <p>
            Jūsų asmens duomenis tvarko padelio treneris, veikiantis adresu
            <strong> info@padeliotrenere.lt</strong>. Susisiekti galite el. paštu arba
            per <Link href="/contact">kontaktų formą</Link>.
          </p>

          <h2>2. Kokie duomenys renkami</h2>
          <ul>
            <li><strong>Registracijos duomenys:</strong> vardas, el. pašto adresas, telefono numeris.</li>
            <li><strong>Rezervacijų duomenys:</strong> pasirinktų treniruočių datos ir laikai.</li>
            <li><strong>Prisijungimo duomenys:</strong> prisijungimo laikas, naudota paslauga (Google ar el. paštas).</li>
            <li><strong>Push pranešimų prenumerata:</strong> naršyklės push subscription raktai (jei sutinkate).</li>
          </ul>

          <h2>3. Kaip naudojame duomenis</h2>
          <ul>
            <li>Rezervacijų valdymui ir patvirtinimų siuntimui.</li>
            <li>Priminimų apie treniruotes siuntimui.</li>
            <li>Susisiekimui dėl klausimų ar pakeitimų.</li>
            <li>Svetainės veikimo užtikrinimui.</li>
          </ul>

          <h2>4. Duomenų saugojimas</h2>
          <p>
            Duomenys saugomi saugiame serveryje ES teritorijoje. Jūsų rezervacijų istorija
            saugoma tol, kol turite paskyrą. Galite bet kada paprašyti ištrinti savo duomenis.
          </p>

          <h2>5. Trečiosios šalys</h2>
          <ul>
            <li><strong>Google OAuth</strong> — prisijungimui (jei pasirenkate šią galimybę).</li>
            <li><strong>Resend</strong> — el. laiškų siuntimui.</li>
            <li>Jūsų duomenys neparduodami ir nepersiunčiami reklamos tikslais.</li>
          </ul>

          <h2>6. Jūsų teisės</h2>
          <p>Turite teisę:</p>
          <ul>
            <li>Prašyti pateikti saugomus duomenis.</li>
            <li>Prašyti ištaisyti netikslius duomenis.</li>
            <li>Prašyti ištrinti savo duomenis.</li>
            <li>Atšaukti sutikimą dėl push pranešimų bet kada profilio puslapyje.</li>
          </ul>
          <p>
            Kreipkitės el. paštu <a href="mailto:info@padeliotrenere.lt">info@padeliotrenere.lt</a>.
          </p>

          <h2>7. Slapukai (cookies)</h2>
          <p>
            Naudojame tik sesijos slapukus, reikalingus prisijungimui palaikyti (NextAuth.js).
            Rinkodaros ar stebėjimo slapukų nenaudojame.
          </p>

          <h2>8. Pakeitimai</h2>
          <p>
            Apie esminius privatumo politikos pakeitimus informuosime el. paštu.
            Aktualią versiją visada rasite šiame puslapyje.
          </p>
        </div>
      </div>
    </div>
  );
}
