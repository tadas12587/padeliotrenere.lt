"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import GalleryUpload from "@/components/GalleryUpload";
import LocationPicker from "@/components/LocationPicker";

interface SportItem {
  id: string;
  name: string;
  icon: string | null;
  iconUrl: string | null;
}

interface GalleryPhoto {
  id: string;
  url: string;
}

interface ArenaData {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  photoUrl: string;
  logoUrl: string;
  bannerUrl: string;
  lat: number | null;
  lng: number | null;
  courtBookingUrl: string;
  status: string;
  sportIds: string[];
  photos: GalleryPhoto[];
}

interface Props {
  arena: ArenaData;
  allSports: SportItem[];
}

export default function EditArenaForm({ arena, allSports }: Props) {
  const router = useRouter();
  const [name, setName] = useState(arena.name);
  const [city, setCity] = useState(arena.city);
  const [address, setAddress] = useState(arena.address);
  const [description, setDescription] = useState(arena.description);
  const [photoUrl, setPhotoUrl] = useState(arena.photoUrl);
  const [logoUrl, setLogoUrl] = useState(arena.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(arena.bannerUrl);
  const [lat, setLat] = useState<number | null>(arena.lat);
  const [lng, setLng] = useState<number | null>(arena.lng);
  const [courtBookingUrl, setCourtBookingUrl] = useState(arena.courtBookingUrl);
  const [status, setStatus] = useState(arena.status);
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>(arena.sportIds);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(arena.photos);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSport = (sportId: string) => {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    );
  };

  const handleGalleryAdd = async (url: string) => {
    try {
      const res = await fetch(`/api/arenas/${arena.id}/gallery`, {
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
      const res = await fetch(`/api/arenas/${arena.id}/gallery/${photoId}`, {
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
      const res = await fetch(`/api/admin/arenas/${arena.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          address,
          description,
          photoUrl,
          logoUrl,
          bannerUrl,
          lat,
          lng,
          courtBookingUrl,
          status,
          sportIds: selectedSportIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      router.push("/admin/arenas");
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

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Pavadinimas <span className="text-[#FF5733]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
          />
        </div>

        <LocationPicker
          address={address}
          city={city}
          onAddressChange={setAddress}
          onCityChange={setCity}
          onPlaceSelect={(place) => {
            setAddress(place.address);
            setCity(place.city);
            setLat(place.lat);
            setLng(place.lng);
          }}
        />

        {lat !== null && lng !== null && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            ✓ Koordinatės išsaugotos: {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Kortų rezervacijos nuoroda
            <span className="text-gray-400 font-400 ml-1 text-xs">(neprivaloma)</span>
          </label>
          <input
            type="url"
            value={courtBookingUrl}
            onChange={(e) => setCourtBookingUrl(e.target.value)}
            placeholder="https://rezervacija.lt/..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
          />
          <p className="mt-1 text-xs text-gray-400">Nuoroda į arenos kortų rezervacijos sistemą</p>
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
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Aprašymas
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] resize-none"
          />
        </div>
      </div>

      {/* Images */}
      <div className="card p-6 max-w-3xl space-y-5">
        <h2 className="font-800 text-[#0B5C71] text-lg">Nuotraukos</h2>

        <div className="flex flex-wrap gap-8">
          <ImageUpload
            currentUrl={logoUrl || undefined}
            onUploaded={(url) => setLogoUrl(url)}
            aspectRatio={1}
            uploadType="logo"
            label="Logotipas (1:1)"
          />

          <ImageUpload
            currentUrl={bannerUrl || undefined}
            onUploaded={(url) => setBannerUrl(url)}
            aspectRatio={4 / 3}
            uploadType="banner"
            label="Reklamjuostė (4:3)"
          />

          <ImageUpload
            currentUrl={photoUrl || undefined}
            onUploaded={(url) => setPhotoUrl(url)}
            aspectRatio={4 / 3}
            uploadType="banner"
            label="Pagrindinė nuotrauka"
          />
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
