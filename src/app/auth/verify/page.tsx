import AuthLogo from "@/components/AuthLogo";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AuthLogo />

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
      </div>
    </div>
  );
}
