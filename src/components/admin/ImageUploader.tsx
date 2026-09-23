import { useRef, useState } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { SmartImage } from "../shared/SmartImage";
import { uploadPhoto } from "../../services/uploads";

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

/**
 * Uploads a photo to the Cloudflare Worker in /worker, which stores it in
 * R2 and returns a public URL. That URL is what gets passed to onChange
 * and stored on the property/room.
 */
export function ImageUploader({ label, value, onChange, className = "" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-navy/20 bg-offwhite">
        {uploading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
            <span className="text-xs">Uploading…</span>
          </div>
        ) : value ? (
          <>
            <SmartImage src={value} alt={label} className="h-full w-full" />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label={`Remove ${label}`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy/70 text-white hover:bg-navy"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-text-secondary hover:text-navy"
          >
            <Upload className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-xs">Upload photo</span>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
