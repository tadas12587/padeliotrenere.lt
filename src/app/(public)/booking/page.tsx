import { Metadata } from "next";
import MultiTrainerBooking from "@/components/booking/MultiTrainerBooking";

export const metadata: Metadata = {
  title: "Rezervacija",
  description:
    "Rezervuokite treniruotę su padelio treneriu. Pasirinkite miestą, trenerį ir patogų laiką.",
};

interface Props {
  searchParams: Promise<{ trainerId?: string; arenaId?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const { trainerId, arenaId } = await searchParams;
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-[#16213e] text-white py-14">
        <div className="container-tight text-center">
          <span className="text-[#e94560] font-700 uppercase tracking-widest text-sm">
            Rezervacija
          </span>
          <h1 className="text-4xl font-900 mt-2 mb-3">Rezervuokite treniruotę</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Pasirinkite miestą, patogią dieną ir laiką – rezervuokite treniruotę su
            bet kuriuo mūsų treneriu.
          </p>
        </div>
      </div>
      <div className="container-tight py-12">
        <MultiTrainerBooking
          initialTrainerId={trainerId ?? ""}
          initialArenaId={arenaId ?? ""}
        />
      </div>
    </div>
  );
}
