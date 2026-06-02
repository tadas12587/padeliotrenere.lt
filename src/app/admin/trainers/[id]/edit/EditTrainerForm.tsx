"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import GalleryUpload from "@/components/GalleryUpload";

interface SportItem {
  id: string;
  name: string;
  icon: string | null;
}

interface GalleryPhoto {
  id: string;
  url: string;
}

interface TrainerData {
  id: string;
  displayName: string;
  bio: string;
  photoUrl: string;
  city: string;
  phone: string;
  isFeatured: boolean;
  status: string;
  sportIds: string[];
  gallery: GalleryPhoto[];
}

interface Props {
  trainer: TrainerData;
  allSports: SportItem[];
}

export default function EditTrainerForm({ trainer, allSports }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(trainer.displayName);
  const [bio, setBio] = useState(trainer.bio);
  const [photoUrl, setPhotoUrl] = useState(trainer.photoUrl);
  const [city, setCity] = useState(trainer.city);
  const [phone, setPhone] = useState(trainer.phone);
  const [isFeatured, setIsFeatured] = useState(trainer.isFeatured);
  const [status, setStatus] = useState(trainer.status);
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>(trainer.sportIds);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(trainer.gallery);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSport = (sportId: string) => {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    );
  };

  const handleGalleryAdd = async (url: string) => {
    try {
      const res = await fetch(`/api/trainers/${trainer.id}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to add photo");
      const photo = await res.json();
      setGalleryPhotos((prev) => [...prev, photo]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGalleryRemove = async (photoId: string) => {
    try {
      const res = await fetch(`/api/trainers/${trainer.id}/gallery/${photoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove photo");
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/trainers/${trainer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          photoUrl,
          city,
          phone,
          isFeatured,
          status,
          sportIds: selectedSportIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      router.push("/admin/trainers");
    } catch (err: any) {
      setError(err.message || "Nepavyko išsaugoti");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl text-sm font-600 bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="card p-6 max-w-3xl space-y-5">
        <h2 className="font-800 text-[#0B5C71] text-lg">Pagrindinė informacija</h2>

        <ImageUpload
          currentUrl={photoUrl || undefined}
          onUploaded={(url) => setPhotoUrl(url)}
          aspectRatio={3 / 4}
          uploadType="profile"
          label="Profilio nuotrauka"
        />

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Vardas / Pseudonimas <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Miestas
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            />
          </div>

          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Telefono numeris
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Statusas
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
            >
              <option value="PENDING">Laukiama</option>
              <option value="APPROVED">Patvirtinta</option>
              <option value="REJECTED">Atmesta</option>
            </select>
          </div>

          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#FF5733]"
              />
              <span className="text-sm font-700 text-gray-700">Išskirti (featured)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sports */}
      <div className="card p-6 max-w-3xl">
        <h2 className="font-800 text-[#0B5C71] text-lg mb-4">Sportai</h2>
        {allSports.length === 0 ? (
          <p className="text-sm text-gray-500">Sportų nėra.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allSports.map((sport) => {
              const checked = selectedSportIds.includes(sport.id);
              return (
                <label
                  key={sport.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? "border-[#FF5733] bg-[#FF5733]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSport(sport.id)}
                    className="w-4 h-4 accent-[#FF5733]"
                  />
                  <div className="flex items-center gap-2">
                    {sport.iconUrl ? (
                      <img src={sport.iconUrl} alt={sport.name} className="w-5 h-5 object-contain rounded" />
                    ) : sport.icon ? (
                      <span className="text-lg">{sport.icon}</span>
                    ) : null}
                    <p className="text-sm font-700 text-[#0B5C71]">{sport.name}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="card p-6 max-w-3xl">
        <h2 className="font-800 text-[#0B5C71] text-lg mb-4">Galerija</h2>
        <GalleryUpload
          photos={galleryPhotos}
          onAdd={handleGalleryAdd}
          onRemove={handleGalleryRemove}
          uploadType="gallery"
        />
      </div>

      <div className="flex justify-end max-w-3xl">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saugoma..." : "Išsaugoti"}
        </button>
      </div>
    </form>
  );
}
