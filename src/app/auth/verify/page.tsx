import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-xl mb-8">
          <span className="w-10 h-10 rounded-xl bg-[#FF5733] flex items-center justify-center">
            <Dumbbell size={22} className="text-white" />
          </span>
          <span className="font-heading text-[#0B5C71]">Mano<span className="text-[#FF5733]">Treniruote</span><span className="text-[#0B5C71] text-sm font-600">.lt</span></span>
        </Link>

        <div className="card p-10">
          <div className="text-6xl mb-5">📧</div>
          <h1 className="text-2xl font-black text-[#0B5C71] mb-3">
            Patikrinkite el. paštą
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Prisijungimo nuoroda buvo išsiųsta. Spustelkite ją el. laiške,
            kad gautumėte prieigą prie paskyros.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Nuoroda galioja <strong>24 valandas</strong>.
          </p>
        </div>

        <Link href="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-[#FF5733] transition-colors">
          ← Grįžti į pagrindinį
        </Link>
      </div>
    </div>
  );
}
