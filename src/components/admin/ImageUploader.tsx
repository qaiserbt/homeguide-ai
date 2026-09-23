import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { SmartImage } from "../shared/SmartImage";

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

/**
 * MVP upload: creates a local object URL for instant preview (no backend
 * storage yet, so the preview won't survive a page reload). Replace the
 * onChange handler with a real upload call (e.g. to S3/Cloudinary) when a
 * media API exists — everything downstream just expects a URL string.
 */
export function ImageUploader({ label, value, onChange, className = "" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    onChange(URL.createObjectURL(file));
  }

  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-navy/20 bg-offwhite">
        {value ? (
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
