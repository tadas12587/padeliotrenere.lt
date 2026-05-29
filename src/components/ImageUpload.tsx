"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Camera, Upload } from "lucide-react";

interface Props {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  aspectRatio: number;
  uploadType: "profile" | "logo" | "banner" | "gallery";
  label?: string;
  placeholder?: string;
}

function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return new Promise((res) =>
    canvas.toBlob((blob) => res(blob!), "image/jpeg", 0.9)
  );
}

export default function ImageUpload({
  currentUrl,
  onUploaded,
  aspectRatio,
  uploadType,
  label,
}: Props) {
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isSquare = aspectRatio === 1;
  const isPortrait = aspectRatio < 1;

  const previewWidth = isSquare ? 120 : isPortrait ? 120 : 160;
  const previewHeight = isSquare ? 120 : isPortrait ? 160 : 120;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setShowModal(true);
      setCrop(undefined);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspectRatio, width, height),
        width,
        height
      );
      setCrop(initialCrop);
    },
    [aspectRatio]
  );

  const handleConfirm = async () => {
    if (!imgRef.current || !crop) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, crop);
      const fd = new FormData();
      fd.append("file", blob, "crop.jpg");
      fd.append("type", uploadType);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onUploaded(url);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setImgSrc("");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-700 text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className="relative inline-block"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={label || "Preview"}
            className="rounded-xl object-cover border border-gray-200"
            style={{ width: previewWidth, height: previewHeight }}
          />
        ) : (
          <div
            className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400"
            style={{ width: previewWidth, height: previewHeight }}
          >
            <Camera size={24} />
            <span className="text-xs text-center px-2">Nėra nuotraukos</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-600 hover:bg-black/80 transition-colors"
        >
          <Upload size={11} />
          {currentUrl ? "Keisti" : "Įkelti"}
        </button>
      </div>

      {!currentUrl && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex items-center gap-2 text-sm text-[#FF5733] font-600 hover:underline"
        >
          <Upload size={14} />
          Įkelti nuotrauką
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {showModal && imgSrc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-auto">
            <h3 className="font-700 text-[#0B5C71] text-lg mb-4">
              Apkarpyti nuotrauką
            </h3>

            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={aspectRatio}
                circularCrop={false}
                ruleOfThirds
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] max-w-full"
                />
              </ReactCrop>
            </div>

            <div className="flex gap-3 mt-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Atšaukti
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={uploading || !crop}
                className="px-4 py-2 rounded-xl bg-[#FF5733] text-white text-sm font-600 hover:bg-[#e04e2c] disabled:opacity-60 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Keliama...
                  </>
                ) : (
                  "Apkarpyti ir įkelti"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
