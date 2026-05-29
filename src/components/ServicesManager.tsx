"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, BookOpen, Sparkles, Users, User } from "lucide-react";

export interface Service {
  id: string;
  trainerId: string;
  templateId: string | null;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string | number | null;
  type: "INDIVIDUAL" | "GROUP";
  maxParticipants: number | null;
  priceType: "TOTAL" | "PER_PERSON" | null;
}

interface ServiceTemplate {
  id: string;
  name: string;
  description: string | null;
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
  templateId: string | null;
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  type: "INDIVIDUAL" | "GROUP";
  maxParticipants: string;
  priceType: "TOTAL" | "PER_PERSON";
}

const emptyForm = (): FormState => ({
  templateId: null,
  name: "",
  description: "",
  durationMinutes: "60",
  price: "",
  type: "INDIVIDUAL",
  maxParticipants: "",
  priceType: "TOTAL",
});

function buildPayload(f: FormState) {
  return {
    name: f.name,
    description: f.description || null,
    durationMinutes: Number(f.durationMinutes),
    price: f.price !== "" ? f.price : null,
    templateId: f.templateId || null,
    type: f.type,
    maxParticipants: f.type === "GROUP" && f.maxParticipants ? Number(f.maxParticipants) : null,
    priceType: f.type === "GROUP" ? f.priceType : null,
  };
}

function formatPrice(
  price: string | number | null,
  type: "INDIVIDUAL" | "GROUP",
  priceType: "TOTAL" | "PER_PERSON" | null
) {
  if (price == null || price === "") return "Nemokama";
  const base = `${price} €`;
  if (type === "GROUP" && priceType === "PER_PERSON") return `${base} / asm.`;
  return base;
}

function ServiceFormFields({
  form,
  onChange,
  mode,
}: {
  form: FormState;
  onChange: (updates: Partial<FormState>) => void;
  mode: "add" | "edit";
}) {
  return (
    <>
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
        />
      </div>

      <div>
        <label className={labelCls}>Aprašymas</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Jūsų aprašymas šiai paslaugai (neprivaloma)"
        />
      </div>

      <div>
        <label className={labelCls}>Paslaugos tipas</label>
        <div className="flex bg-white rounded-xl p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => onChange({ type: "INDIVIDUAL", maxParticipants: "", priceType: "TOTAL" })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${
              form.type === "INDIVIDUAL"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User size={14} />
            Individuali
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: "GROUP" })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${
              form.type === "GROUP"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={14} />
            Grupinė
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Trukmė (min) <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => onChange({ durationMinutes: e.target.value })}
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
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
            min={0}
            step={0.01}
            placeholder="Nemokama"
            className={inputCls}
          />
        </div>
      </div>

      {form.type === "GROUP" && (
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-3">
          <div>
            <label className={labelCls}>Maks. dalyvių skaičius</label>
            <input
              type="number"
              value={form.maxParticipants}
              onChange={(e) => onChange({ maxParticipants: e.target.value })}
              min={2}
              placeholder="Neribota"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Kainodara</label>
            <div className="flex gap-4">
              {(["TOTAL", "PER_PERSON"] as const).map((pt) => (
                <label key={pt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`priceType-${mode}`}
                    value={pt}
                    checked={form.priceType === pt}
                    onChange={() => onChange({ priceType: pt })}
                    className="accent-[#0B5C71]"
                  />
                  <span className="text-sm font-600 text-gray-700">
                    {pt === "TOTAL" ? "Bendra suma" : "Kaina asmeniui"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ServicesManager({ trainerId, isAdmin, initialServices }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addTab, setAddTab] = useState<"catalog" | "custom">("catalog");
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const baseUrl = isAdmin ? `/api/admin/trainers/${trainerId}/services` : `/api/trainer/services`;
  const serviceUrl = (id: string) =>
    isAdmin ? `/api/admin/trainers/${trainerId}/services/${id}` : `/api/trainer/services/${id}`;

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    if (showAddForm && templates.length === 0 && !templatesLoading) {
      setTemplatesLoading(true);
      fetch("/api/service-templates")
        .then((r) => r.json())
        .then((data) => setTemplates(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setTemplatesLoading(false));
    }
  }, [showAddForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddForm = () => {
    setAddForm(emptyForm());
    setAddTab("catalog");
    setAddError(null);
    setShowAddForm(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(addForm)),
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
      templateId: svc.templateId,
      name: svc.name,
      description: svc.description ?? "",
      durationMinutes: String(svc.durationMinutes),
      price: svc.price != null ? String(svc.price) : "",
      type: svc.type ?? "INDIVIDUAL",
      maxParticipants: svc.maxParticipants != null ? String(svc.maxParticipants) : "",
      priceType: svc.priceType ?? "TOTAL",
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
        body: JSON.stringify(buildPayload(editForm)),
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

  return (
    <div className="card p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-800 text-[#0B5C71] text-lg">Paslaugos</h2>
        {!showAddForm && (
          <button
            type="button"
            onClick={openAddForm}
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

      {/* Add form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-4"
        >
          <h3 className="font-700 text-[#0B5C71] text-sm">Nauja paslauga</h3>

          <div className="flex bg-white rounded-xl p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setAddTab("catalog")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${
                addTab === "catalog"
                  ? "bg-[#0B5C71] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen size={15} />
              Iš katalogo
            </button>
            <button
              type="button"
              onClick={() => {
                setAddTab("custom");
                setAddForm((f) => ({ ...f, templateId: null }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${
                addTab === "custom"
                  ? "bg-[#0B5C71] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles size={15} />
              Nauja paslauga
            </button>
          </div>

          {addTab === "catalog" && (
            <div>
              {templatesLoading ? (
                <p className="text-sm text-gray-400 text-center py-3">Kraunama...</p>
              ) : templates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">Katalogas tuščias</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() =>
                        setAddForm((f) => ({
                          ...f,
                          templateId: tpl.id,
                          name: tpl.name,
                          description: tpl.description ?? "",
                        }))
                      }
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        addForm.templateId === tpl.id
                          ? "border-[#0B5C71] bg-[#0B5C71]/5"
                          : "border-gray-200 bg-white hover:border-[#0B5C71]/40 hover:bg-[#0B5C71]/5"
                      }`}
                    >
                      <p className="font-700 text-sm text-[#0B5C71]">{tpl.name}</p>
                      {tpl.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {addError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}

          <ServiceFormFields
            form={addForm}
            onChange={(updates) => setAddForm((f) => ({ ...f, ...updates }))}
            mode="add"
          />

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
                  <ServiceFormFields
                    form={editForm}
                    onChange={(updates) => setEditForm((f) => ({ ...f, ...updates }))}
                    mode="edit"
                  />
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
                      <p className="font-700 text-[#0B5C71] text-sm">{svc.name}</p>
                      <span
                        className={`badge text-xs inline-flex items-center gap-1 ${
                          svc.type === "GROUP"
                            ? "text-orange-600 bg-orange-50 border-orange-200"
                            : "text-blue-600 bg-blue-50 border-blue-200"
                        }`}
                      >
                        {svc.type === "GROUP" ? (
                          <><Users size={10} />Grupinė</>
                        ) : (
                          <><User size={10} />Individuali</>
                        )}
                      </span>
                    </div>
                    {svc.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="badge text-xs text-blue-600 bg-blue-50 border-blue-200">
                        {svc.durationMinutes} min
                      </span>
                      <span className="badge text-xs text-green-600 bg-green-50 border-green-200">
                        {formatPrice(svc.price, svc.type ?? "INDIVIDUAL", svc.priceType ?? null)}
                      </span>
                      {svc.type === "GROUP" && svc.maxParticipants && (
                        <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200">
                          ≤{svc.maxParticipants} dalyvių
                        </span>
                      )}
                      {svc.type === "GROUP" && svc.priceType && (
                        <span className="badge text-xs text-gray-500 bg-gray-100 border-gray-200">
                          {svc.priceType === "PER_PERSON" ? "Kaina/asm." : "Bendra"}
                        </span>
                      )}
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
