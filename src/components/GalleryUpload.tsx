"use client";

import { useRef, useState } from "react";
import { X, Plus } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

interface Props {
  photos: Photo[];
  onAdd: (url: string) => void;
  onRemove: (id: string) => void;
  uploadType?: "gallery";
  isLoading?: boolean;
}

export default function GalleryUpload({
  photos,
  onAdd,
  onRemove,
  isLoading,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "gallery");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onAdd(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Gallery"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              disabled={isLoading}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 disabled:opacity-40"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={20} />
              <span className="text-xs">Pridėti</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
