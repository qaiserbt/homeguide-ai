import { CheckCircle2, Rocket, Save } from "lucide-react";
import type { Property } from "../../../types/property";
import { SmartImage } from "../../shared/SmartImage";
import { formatCurrency, formatSquareFeet } from "../../../utils/format";

interface PreviewStepProps {
  draft: Property;
  onPublish: () => void;
  onSaveDraft: () => void;
}

export function PreviewStep({ draft, onPublish, onSaveDraft }: PreviewStepProps) {
  const checklist = [
    { label: "Property address & details", done: Boolean(draft.address && draft.city) },
    { label: "Exterior photo uploaded", done: Boolean(draft.exteriorImage) },
    { label: "At least one room created", done: draft.rooms.length > 0 },
    { label: "Narration written for every room", done: draft.rooms.length > 0 && draft.rooms.every((r) => r.narration.trim().length > 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-navy/10">
        <SmartImage src={draft.exteriorImage} alt={draft.address || "Property"} roomType="exterior" className="h-48 w-full" />
        <div className="p-5">
          <h3 className="font-serif text-xl text-navy">{draft.address || "Untitled Property"}</h3>
          <p className="text-sm text-text-secondary">{[draft.city, draft.province].filter(Boolean).join(", ")}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-dark">
            <span>{draft.bedrooms} Bedrooms</span>
            <span>{draft.bathrooms} Bathrooms</span>
            <span>{formatSquareFeet(draft.squareFeet)}</span>
            <span className="font-semibold text-navy">{formatCurrency(draft.price)}</span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">{draft.rooms.length} rooms in this tour</p>
        </div>
      </div>

      <div className="rounded-xl bg-offwhite p-4">
        <h4 className="mb-3 text-sm font-semibold text-navy">Ready to publish?</h4>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-green-600" : "text-navy/20"}`} />
              <span className={item.done ? "text-text-dark" : "text-text-secondary"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy/15 px-6 py-3 text-sm font-semibold text-navy hover:bg-navy/5"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy shadow-gold hover:bg-gold-dark"
        >
          <Rocket className="h-4 w-4" />
          Publish Tour
        </button>
      </div>
    </div>
  );
}
