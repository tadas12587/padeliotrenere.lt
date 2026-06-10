import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-900 text-[#0B5C71] mb-2">404</div>
        <h1 className="text-2xl font-800 text-[#0B5C71] mb-3">Puslapis nerastas</h1>
        <p className="text-gray-500 mb-8">
          Atsiprašome, šis puslapis neegzistuoja arba buvo perkeltas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Grįžti į pradžią
          </Link>
          <Link href="/trainers" className="btn-secondary">
            Peržiūrėti trenerius
          </Link>
        </div>
      </div>
    </div>
  );
}
