import type { Property } from "../../../types/property";
import { ImageUploader } from "../ImageUploader";
import { GalleryUploader } from "../GalleryUploader";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

export function PhotosStep({ draft, update }: StepProps) {
  return (
    <div className="space-y-6">
      <ImageUploader
        label="Exterior Photo (used as the tour cover)"
        value={draft.exteriorImage || undefined}
        onChange={(url) => update({ exteriorImage: url ?? "" })}
        className="max-w-sm"
        libraryPhotos={draft.gallery}
      />

      <GalleryUploader photos={draft.gallery} onChange={(gallery) => update({ gallery })} max={40} />

      <p className="text-xs text-text-secondary">
        Room-specific photos are added in the next step when you create each room.
      </p>
    </div>
  );
}
