"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: {
    trainers: number;
    arenas: number;
  };
}

interface Props {
  initialSports: Sport[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/č/g, "c")
    .replace(/ę/g, "e")
    .replace(/ė/g, "e")
    .replace(/į/g, "i")
    .replace(/š/g, "s")
    .replace(/ų/g, "u")
    .replace(/ū/g, "u")
    .replace(/ž/g, "z")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function SportsCRUD({ initialSports }: Props) {
  const router = useRouter();

  // Add form state
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addIcon, setAddIcon] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit state: map of id → edited values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, slug: addSlug, icon: addIcon || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Klaida kuriant sportą");
        return;
      }
      setAddName("");
      setAddSlug("");
      setAddIcon("");
      setShowAddForm(false);
      router.refresh();
    } catch {
      setAddError("Tinklo klaida");
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(sport: Sport) {
    setEditingId(sport.id);
    setEditName(sport.name);
    setEditSlug(sport.slug);
    setEditIcon(sport.icon ?? "");
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleEdit(id: string) {
    setEditError("");
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/sports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug, icon: editIcon || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Klaida atnaujinant sportą");
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Tinklo klaida");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Ar tikrai norite ištrinti "${name}"?`)) return;
    setDeleteLoading(id);
    try {
      await fetch(`/api/admin/sports/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleteLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{initialSports.length} sporto šakų</p>
        <button
          className="btn-primary text-sm py-2 px-4"
          onClick={() => {
            setShowAddForm((v) => !v);
            setAddError("");
          }}
        >
          {showAddForm ? "Atšaukti" : "+ Pridėti naują"}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-base font-700 text-[#0B5C71] mb-4">Nauja sporto šaka</h2>
          <form onSubmit={handleAdd} className="space-y-5">
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Pavadinimas *
              </label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                placeholder="pvz. Padel"
              />
            </div>
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addSlug}
                  onChange={(e) => setAddSlug(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                  placeholder="pvz. padel"
                />
                <button
                  type="button"
                  onClick={() => setAddSlug(generateSlug(addName))}
                  className="btn-secondary text-xs px-3 py-2 shrink-0"
                >
                  Sugeneruoti
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Ikona (emoji, neprivaloma)
              </label>
              <input
                type="text"
                value={addIcon}
                onChange={(e) => setAddIcon(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
                placeholder="pvz. 🎾"
                maxLength={4}
              />
            </div>
            {addError && (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                {addError}
              </p>
            )}
            <button
              type="submit"
              disabled={addLoading}
              className="btn-primary flex items-center gap-2"
            >
              {addLoading && <Loader2 size={16} className="animate-spin" />}
              Sukurti
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-700 text-gray-500 py-3 px-5">Sportas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Slug</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Treneriai</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Arenos</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {initialSports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Sporto šakų nerasta
                  </td>
                </tr>
              ) : (
                initialSports.map((sport) => (
                  <tr key={sport.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    {editingId === sport.id ? (
                      <>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editIcon}
                              onChange={(e) => setEditIcon(e.target.value)}
                              className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FF5733]"
                              placeholder="🎾"
                              maxLength={4}
                            />
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FF5733]"
                            />
                          </div>
                          {editError && (
                            <p className="text-red-600 text-xs mt-1">{editError}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FF5733]"
                            />
                            <button
                              type="button"
                              onClick={() => setEditSlug(generateSlug(editName))}
                              className="text-xs text-gray-400 hover:text-[#0B5C71] px-1"
                              title="Sugeneruoti slug"
                            >
                              ↻
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-700 text-[#0B5C71]">
                          {sport._count.trainers}
                        </td>
                        <td className="py-3 px-4 text-center font-700 text-[#0B5C71]">
                          {sport._count.arenas}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(sport.id)}
                              disabled={editLoading}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Išsaugoti"
                            >
                              {editLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                              title="Atšaukti"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            {sport.icon && (
                              <span className="text-lg">{sport.icon}</span>
                            )}
                            <span className="font-700 text-[#0B5C71]">{sport.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                          {sport.slug}
                        </td>
                        <td className="py-3 px-4 text-center font-700 text-[#0B5C71]">
                          {sport._count.trainers}
                        </td>
                        <td className="py-3 px-4 text-center font-700 text-[#0B5C71]">
                          {sport._count.arenas}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(sport)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Redaguoti"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sport.id, sport.name)}
                              disabled={deleteLoading === sport.id}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="Ištrinti"
                            >
                              {deleteLoading === sport.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
