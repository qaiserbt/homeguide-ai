import { useRef, useState } from "react";
import { Upload, X, Loader2, AlertCircle, CheckSquare, Square, Trash2, XCircle } from "lucide-react";
import { SmartImage } from "../shared/SmartImage";
import { uploadPhotos } from "../../services/uploads";

interface GalleryUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

/**
 * Bulk photo uploader for a property's gallery: pick up to `max` files at
 * once (uploaded with limited concurrency, see services/uploads.ts), then
 * switch into a select mode to bulk-delete whichever ones don't belong.
 */
export function GalleryUploader({ photos, onChange, max = 40 }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const remaining = Math.max(0, max - photos.length);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErrors([]);

    let files = Array.from(fileList);
    let trimmedNotice: string | null = null;
    if (files.length > remaining) {
      trimmedNotice = `Only added ${remaining} of ${files.length} selected — that's the ${max}-photo limit for this property.`;
      files = files.slice(0, remaining);
    }

    if (files.length === 0) {
      setErrors([`You've reached the ${max}-photo limit. Remove some photos before adding more.`]);
      return;
    }

    setProgress({ completed: 0, total: files.length });
    const results = await uploadPhotos(files, (completed, total) => setProgress({ completed, total }));
    setProgress(null);

    const newUrls = results.filter((r) => r.url).map((r) => r.url as string);
    const failMessages = results.filter((r) => r.error).map((r) => `${r.file.name}: ${r.error}`);

    if (newUrls.length > 0) onChange([...photos, ...newUrls]);
    setErrors([trimmedNotice, ...failMessages].filter((m): m is string => Boolean(m)));

    if (inputRef.current) inputRef.current.value = "";
  }

  function toggleSelected(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function deleteOne(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(`Remove ${selected.size} photo${selected.size === 1 ? "" : "s"} from this property?`)) return;
    onChange(photos.filter((_, i) => !selected.has(i)));
    setSelected(new Set());
    setSelectMode(false);
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          Gallery Photos ({photos.length}/{max})
        </span>
        {photos.length > 0 && !selectMode && (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-navy hover:text-navy-light"
          >
            <CheckSquare className="h-3.5 w-3.5" /> Select
          </button>
        )}
        {selectMode && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary">{selected.size} selected</span>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={selected.size === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-30"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </button>
            <button
              type="button"
              onClick={exitSelectMode}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-navy"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((src, index) => {
          const isSelected = selected.has(index);
          return (
            <div
              key={`${src}-${index}`}
              role={selectMode ? "button" : undefined}
              tabIndex={selectMode ? 0 : undefined}
              onClick={() => selectMode && toggleSelected(index)}
              onKeyDown={(e) => {
                if (selectMode && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  toggleSelected(index);
                }
              }}
              className={`group relative aspect-square overflow-hidden rounded-xl ${
                selectMode ? "cursor-pointer" : ""
              } ${isSelected ? "ring-2 ring-gold" : ""}`}
            >
              <SmartImage src={src} alt={`Gallery photo ${index + 1}`} className="h-full w-full" />

              {selectMode ? (
                <span
                  className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full ${
                    isSelected ? "bg-gold text-navy" : "bg-navy/60 text-white"
                  }`}
                >
                  {isSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => deleteOne(index)}
                  aria-label="Remove photo"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy/70 text-white opacity-0 transition-opacity hover:bg-navy group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-navy/20 bg-offwhite text-text-secondary hover:text-navy disabled:opacity-60"
          >
            {progress ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                <span className="text-xs">
                  Uploading {progress.completed}/{progress.total}
                </span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-xs">Add Photos</span>
                <span className="text-[10px] text-text-secondary/70">up to {remaining} more</span>
              </>
            )}
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((message, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {message}
            </p>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
