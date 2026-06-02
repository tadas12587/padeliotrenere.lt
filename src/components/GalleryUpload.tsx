"use client";

import { useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

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

const MAX_W = 2400;
const MAX_H = 1600;
const QUALITY = 0.92;

function resizeToBlob(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_W || height > MAX_H) {
        const ratio = Math.min(MAX_W / width, MAX_H / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const q = mime === "image/png" ? undefined : QUALITY;
      canvas.toBlob((blob) => resolve(blob), mime, q);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
    img.src = objectUrl;
  });
}

async function uploadBlob(blob: Blob, filename: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, filename);
  fd.append("type", "gallery");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

export default function GalleryUpload({ photos, onAdd, onRemove, isLoading }: Props) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError("");
    setProgress({ done: 0, total: files.length });

    let done = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        const blob = await resizeToBlob(file);
        if (!blob) throw new Error("Nepavyko apdoroti");
        const ext = file.type === "image/png" ? "png" : "jpg";
        const url = await uploadBlob(blob, `photo.${ext}`);
        onAdd(url);
      } catch (err) {
        errors.push(file.name);
      }
      done++;
      setProgress({ done, total: files.length });
    }

    setProgress(null);
    if (errors.length > 0) {
      setError(`Nepavyko įkelti: ${errors.join(", ")}`);
    }
  };

  const uploading = progress !== null;

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              disabled={isLoading || uploading}
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
            <>
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs">{progress!.done}/{progress!.total}</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span className="text-xs">Pridėti</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
