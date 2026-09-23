import { X } from "lucide-react";
import type { Property } from "../../../types/property";
import { ImageUploader } from "../ImageUploader";
import { SmartImage } from "../../shared/SmartImage";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

export function PhotosStep({ draft, update }: StepProps) {
  function addGalleryPhoto(url: string | undefined) {
    if (!url) return;
    update({ gallery: [...draft.gallery, url] });
  }

  function removeGalleryPhoto(index: number) {
    update({ gallery: draft.gallery.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <ImageUploader
        label="Exterior Photo (used as the tour cover)"
        value={draft.exteriorImage || undefined}
        onChange={(url) => update({ exteriorImage: url ?? "" })}
        className="max-w-sm"
      />

      <div>
        <span className="mb-2 block text-xs font-medium text-text-secondary">Gallery Photos</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {draft.gallery.map((src, index) => (
            <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded-xl">
              <SmartImage src={src} alt={`Gallery photo ${index + 1}`} className="h-full w-full" />
              <button
                type="button"
                onClick={() => removeGalleryPhoto(index)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy/70 text-white hover:bg-navy"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <ImageUploader label="Add photo" onChange={addGalleryPhoto} className="aspect-square [&>div]:aspect-square" />
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Room-specific photos are added in the next step when you create each room.
      </p>
    </div>
  );
}
