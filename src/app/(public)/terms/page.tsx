import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Naudojimo sąlygos",
  description: "Padelio Treneris svetainės naudojimo sąlygos.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-[#16213e] text-white py-12">
        <div className="container-tight">
          <h1 className="text-3xl font-900">Naudojimo sąlygos</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Paskutinį kartą atnaujinta: 2025 m. sausio 1 d.
          </p>
        </div>
      </div>

      <div className="container-tight py-12">
        <div className="card p-8 lg:p-12 prose prose-gray max-w-none
          prose-headings:font-900 prose-headings:text-[#16213e]
          prose-a:text-[#e94560] prose-a:no-underline hover:prose-a:underline">

          <h2>1. Bendrosios nuostatos</h2>
          <p>
            Naudodamiesi svetaine <strong>padeliotrenere.lt</strong> ir jos paslaugomis,
            sutinkate su šiomis naudojimo sąlygomis. Prašome jas perskaityti prieš
            registruodamiesi ar atlikdami rezervaciją.
          </p>

          <h2>2. Paskyros kūrimas</h2>
          <ul>
            <li>Registruotis gali tik fiziniai asmenys, sulaukę 16 metų.</li>
            <li>Pateikti duomenys turi būti teisingi ir aktualūs.</li>
            <li>Esate atsakingi už savo paskyros saugumą.</li>
            <li>Vienas asmuo gali turėti tik vieną paskyrą.</li>
          </ul>

          <h2>3. Rezervacijos</h2>
          <ul>
            <li>Rezervacija patvirtinama el. laišku.</li>
            <li>Atšaukti rezervaciją galima ne vėliau nei <strong>24 val.</strong> iki treniruotės.</li>
            <li>Neatvykus be perspėjimo, rezervacija pažymima kaip neįvykdyta.</li>
            <li>Treneris pasilieka teisę atšaukti treniruotę dėl force majeure aplinkybių.</li>
          </ul>

          <h2>4. Mokėjimai</h2>
          <p>
            Mokėjimo sąlygos ir kainos nurodomos treniruočių aprašyme. Mokestis
            sumokamas iki treniruotės pradžios, jei nenurodyta kitaip.
          </p>

          <h2>5. Elgesio taisyklės</h2>
          <ul>
            <li>Draudžiama naudotis svetaine neteisėtais tikslais.</li>
            <li>Draudžiama bandyti pakenkti svetainės veikimui.</li>
            <li>Komentarai turi būti pagarbūs ir susiję su treniruotėmis.</li>
          </ul>

          <h2>6. Atsakomybės ribojimas</h2>
          <p>
            Treneris neatsako už žalą, atsiradusią dėl treniruočių metu patirtų traumų,
            jei klientas nesilaikė trenerio nurodymų arba nuslėpė sveikatos problemas.
            Rekomenduojame prieš pradedant treniruotis pasikonsultuoti su gydytoju.
          </p>

          <h2>7. Intelektinė nuosavybė</h2>
          <p>
            Visi svetainės tekstai, nuotraukos ir turinys priklauso svetainės savininkui.
            Draudžiama jais naudotis be raštiško leidimo.
          </p>

          <h2>8. Sąlygų keitimas</h2>
          <p>
            Pasilieku teisę keisti šias sąlygas. Apie esminius pakeitimus informuosiu
            el. paštu arba svetainėje.
          </p>

          <h2>9. Kontaktai</h2>
          <p>
            Klausimų dėl šių sąlygų kreipkitės:{" "}
            <a href="mailto:info@padeliotrenere.lt">info@padeliotrenere.lt</a> arba
            per <Link href="/contact">kontaktų formą</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
