"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";

interface Props {
  arenaId: string;
  currentStatus: string;
}

export default function ArenaStatusActions({ arenaId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/arenas/${arenaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Klaida");
      router.refresh();
    } catch {
      alert("Nepavyko atnaujinti statuso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={() => updateStatus("APPROVED")}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-700 transition-colors disabled:opacity-50"
          title="Patvirtinti"
        >
          <CheckCircle size={13} />
          Patvirtinti
        </button>
      )}
      {currentStatus !== "PENDING" && (
        <button
          onClick={() => updateStatus("PENDING")}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-xs font-700 transition-colors disabled:opacity-50"
          title="Grąžinti į laukiama"
        >
          <Clock size={13} />
          Laukiama
        </button>
      )}
    </div>
  );
}
