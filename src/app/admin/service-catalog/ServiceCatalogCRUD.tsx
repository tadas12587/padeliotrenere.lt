"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface SportOption {
  id: string;
  name: string;
  icon: string | null;
  iconUrl: string | null;
}

interface ServiceTemplate {
  id: string;
  name: string;
  description: string | null;
  sportId: string | null;
  sport: SportOption | null;
  createdAt: string;
}

interface Props {
  initialTemplates: ServiceTemplate[];
  sports: SportOption[];
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]";
const labelCls = "block text-sm font-700 text-gray-700 mb-1.5";

interface FormState {
  name: string;
  description: string;
  sportId: string;
}

const emptyForm = (): FormState => ({ name: "", description: "", sportId: "" });

export default function ServiceCatalogCRUD({ initialTemplates, sports }: Props) {
  const [templates, setTemplates] = useState<ServiceTemplate[]>(initialTemplates);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);
    try {
      const res = await fetch("/api/service-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          description: addForm.description || null,
          sportId: addForm.sportId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      const created = await res.json();
      setTemplates((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setAddForm(emptyForm());
      setShowAdd(false);
      showMsg("success", "Šablonas pridėtas!");
    } catch (err: any) {
      setAddError(err.message || "Nepavyko pridėti");
    } finally {
      setAddSaving(false);
    }
  };

  const startEdit = (tpl: ServiceTemplate) => {
    setEditingId(tpl.id);
    setEditForm({ name: tpl.name, description: tpl.description ?? "", sportId: tpl.sportId ?? "" });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/service-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          sportId: editForm.sportId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      const updated = await res.json();
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      showMsg("success", "Šablonas atnaujintas!");
    } catch (err: any) {
      setEditError(err.message || "Nepavyko atnaujinti");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ištrinti šį šabloną? Trenerių paslaugos nebus ištrintos.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/service-templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showMsg("success", "Šablonas ištrintas.");
    } catch (err: any) {
      showMsg("error", err.message || "Nepavyko ištrinti");
    } finally {
      setDeletingId(null);
    }
  };

  function TemplateForm({
    form,
    onChange,
  }: {
    form: FormState;
    onChange: (updates: Partial<FormState>) => void;
  }) {
    return (
      <>
        {sports.length > 0 && (
          <div>
            <label className={labelCls}>Sporto šaka</label>
            <select
              value={form.sportId}
              onChange={(e) => onChange({ sportId: e.target.value })}
              className={inputCls}
            >
              <option value="">— Visos sporto šakos —</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon ? `${s.icon} ` : ""}{s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelCls}>
            Pavadinimas <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
            className={inputCls}
            placeholder="pvz. Treniruotė pradedantiesiems"
          />
        </div>
        <div>
          <label className={labelCls}>Aprašymas</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Bendras šablono aprašymas (treneriai gali koreguoti)"
          />
        </div>
      </>
    );
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {templates.length} šablon{templates.length === 1 ? "as" : "ai"}
        </p>
        {!showAdd && (
          <button
            type="button"
            onClick={() => { setShowAdd(true); setAddForm(emptyForm()); setAddError(null); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Pridėti šabloną
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

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="mb-5 p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-4"
        >
          <h3 className="font-700 text-[#0B5C71] text-sm">Naujas šablonas</h3>
          {addError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}
          <TemplateForm form={addForm} onChange={(u) => setAddForm((f) => ({ ...f, ...u }))} />
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
              onClick={() => setShowAdd(false)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <X size={14} />
              Atšaukti
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Katalogas tuščias. Pridėkite pirmąjį šabloną.
        </p>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div key={tpl.id}>
              {editingId === tpl.id ? (
                <form
                  onSubmit={(e) => handleEdit(e, tpl.id)}
                  className="p-4 bg-[#F4F4F4] rounded-xl border border-[#FF5733]/30 space-y-4"
                >
                  {editError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {editError}
                    </p>
                  )}
                  <TemplateForm form={editForm} onChange={(u) => setEditForm((f) => ({ ...f, ...u }))} />
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-700 text-[#0B5C71] text-sm">{tpl.name}</p>
                      {tpl.sport && (
                        <span className="badge text-xs text-purple-600 bg-purple-50 border-purple-200">
                          {tpl.sport.icon && <span className="mr-0.5">{tpl.sport.icon}</span>}
                          {tpl.sport.name}
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tpl.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(tpl)}
                      className="p-2 text-gray-400 hover:text-[#0B5C71] hover:bg-[#0B5C71]/10 rounded-lg transition-colors"
                      title="Redaguoti"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id)}
                      disabled={deletingId === tpl.id}
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
