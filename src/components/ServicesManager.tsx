"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export interface Service {
  id: string;
  trainerId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string | number | null;
}

interface Props {
  trainerId: string;
  isAdmin: boolean;
  initialServices: Service[];
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]";
const labelCls = "block text-sm font-700 text-gray-700 mb-1.5";

interface FormState {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
}

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  durationMinutes: "60",
  price: "",
});

export default function ServicesManager({ trainerId, isAdmin, initialServices }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const baseUrl = isAdmin
    ? `/api/admin/trainers/${trainerId}/services`
    : `/api/trainer/services`;

  const serviceUrl = (id: string) =>
    isAdmin
      ? `/api/admin/trainers/${trainerId}/services/${id}`
      : `/api/trainer/services/${id}`;

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          description: addForm.description || null,
          durationMinutes: Number(addForm.durationMinutes),
          price: addForm.price !== "" ? addForm.price : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      const created = await res.json();
      setServices((prev) => [...prev, created]);
      setAddForm(emptyForm());
      setShowAddForm(false);
      showMsg("success", "Paslauga pridėta!");
    } catch (err: any) {
      setAddError(err.message || "Nepavyko pridėti");
    } finally {
      setAddSaving(false);
    }
  };

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setEditForm({
      name: svc.name,
      description: svc.description ?? "",
      durationMinutes: String(svc.durationMinutes),
      price: svc.price != null ? String(svc.price) : "",
    });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(serviceUrl(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          durationMinutes: Number(editForm.durationMinutes),
          price: editForm.price !== "" ? editForm.price : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      const updated = await res.json();
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      showMsg("success", "Paslauga atnaujinta!");
    } catch (err: any) {
      setEditError(err.message || "Nepavyko atnaujinti");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šią paslaugą?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(serviceUrl(id), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      showMsg("success", "Paslauga ištrinta.");
    } catch (err: any) {
      showMsg("error", err.message || "Nepavyko ištrinti");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: string | number | null) => {
    if (price == null || price === "") return "Nemokama";
    return `${price} €`;
  };

  return (
    <div className="card p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-800 text-[#0B5C71] text-lg">Paslaugos</h2>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setAddError(null); setAddForm(emptyForm()); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Pridėti paslaugą
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm font-600 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add form (inline) */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-4"
        >
          <h3 className="font-700 text-[#0B5C71] text-sm">Nauja paslauga</h3>
          {addError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}
          <div>
            <label className={labelCls}>
              Pavadinimas <span className="text-[#FF5733]">*</span>
            </label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Aprašymas</label>
            <textarea
              value={addForm.description}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Trukmė (min) <span className="text-[#FF5733]">*</span>
              </label>
              <input
                type="number"
                value={addForm.durationMinutes}
                onChange={(e) => setAddForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                required
                min={15}
                step={15}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Kaina (€)</label>
              <input
                type="number"
                value={addForm.price}
                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                min={0}
                step={0.01}
                placeholder="Nemokama"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={addSaving}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
            >
              <Check size={14} />
              {addSaving ? "Saugoma..." : "Išsaugoti"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <X size={14} />
              Atšaukti
            </button>
          </div>
        </form>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Paslaugų nėra. Pridėkite pirmąją paslaugą.
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id}>
              {editingId === svc.id ? (
                <form
                  onSubmit={(e) => handleEdit(e, svc.id)}
                  className="p-4 bg-[#F4F4F4] rounded-xl border border-[#FF5733]/30 space-y-4"
                >
                  {editError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {editError}
                    </p>
                  )}
                  <div>
                    <label className={labelCls}>
                      Pavadinimas <span className="text-[#FF5733]">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Aprašymas</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        Trukmė (min) <span className="text-[#FF5733]">*</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.durationMinutes}
                        onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                        required
                        min={15}
                        step={15}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Kaina (€)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                        min={0}
                        step={0.01}
                        placeholder="Nemokama"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
                    >
                      <Check size={14} />
                      {editSaving ? "Saugoma..." : "Išsaugoti"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <X size={14} />
                      Atšaukti
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-700 text-[#0B5C71] text-sm">{svc.name}</p>
                    {svc.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="badge text-xs text-blue-600 bg-blue-50 border-blue-200">
                        {svc.durationMinutes} min
                      </span>
                      <span className="badge text-xs text-green-600 bg-green-50 border-green-200">
                        {formatPrice(svc.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(svc)}
                      className="p-2 text-gray-400 hover:text-[#0B5C71] hover:bg-[#0B5C71]/10 rounded-lg transition-colors"
                      title="Redaguoti"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(svc.id)}
                      disabled={deletingId === svc.id}
                      className="p-2 text-gray-400 hover:text-[#FF5733] hover:bg-[#FF5733]/10 rounded-lg transition-colors disabled:opacity-40"
                      title="Ištrinti"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
