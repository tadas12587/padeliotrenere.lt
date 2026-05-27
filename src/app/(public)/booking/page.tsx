import { Metadata } from "next";
import BookingCalendar from "@/components/booking/BookingCalendar";

export const metadata: Metadata = {
  title: "Rezervacija",
  description:
    "Rezervuokite treniruotę su padelio treneriu. Pasirinkite sau patogų laiką.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#16213e] text-white py-14">
        <div className="container-tight text-center">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Rezervacija
          </span>
          <h1 className="text-4xl font-900 mt-2 mb-3">Rezervuokite treniruotę</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Pasirinkite sau patogų laiką ir rezervuokite treniruotę online.
            Patvirtinimas gausite el. paštu.
          </p>
        </div>
      </div>

      {/* Booking widget */}
      <div className="container-tight py-12">
        <BookingCalendar />
      </div>
    </div>
  );
}
