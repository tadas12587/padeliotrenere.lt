"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Props {
  trainerId: string;
  currentStatus: string;
}

export default function TrainerStatusActions({ trainerId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trainers/${trainerId}`, {
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
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => updateStatus("REJECTED")}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-700 transition-colors disabled:opacity-50"
          title="Atmesti"
        >
          <XCircle size={13} />
          Atmesti
        </button>
      )}
      {currentStatus !== "PENDING" && (
        <button
          onClick={() => updateStatus("PENDING")}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-700 transition-colors disabled:opacity-50"
          title="Grąžinti į laukiama"
        >
          <RotateCcw size={13} />
          Laukiama
        </button>
      )}
    </div>
  );
}
