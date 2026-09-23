import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { getPropertyById, saveProperty } from "../../services/propertiesStore";
import { getAgentSettings } from "../../services/agentSettings";
import type { Property } from "../../types/property";
import { PropertyDetailsStep } from "../../components/admin/steps/PropertyDetailsStep";
import { PropertyFeaturesStep } from "../../components/admin/steps/PropertyFeaturesStep";
import { PhotosStep } from "../../components/admin/steps/PhotosStep";
import { RoomsStep } from "../../components/admin/steps/RoomsStep";
import { NarrationStep } from "../../components/admin/steps/NarrationStep";
import { PreviewStep } from "../../components/admin/steps/PreviewStep";

const STEPS = [
  "Property Details",
  "Property Features",
  "Upload Photos",
  "Create Rooms",
  "AI Narration",
  "Preview & Publish",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function emptyDraft(): Property {
  const defaultAgent = getAgentSettings();
  return {
    id: crypto.randomUUID(),
    slug: "",
    address: "",
    city: "",
    province: "Ontario",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    propertyType: "Detached",
    description: "",
    exteriorImage: "",
    gallery: [],
    rooms: [],
    features: [],
    schools: [],
    amenities: [],
    agent: defaultAgent,
    status: "Draft",
    views: 0,
    questionsAsked: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function CreateProperty() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(propertyId);

  const [draft, setDraft] = useState<Property>(() => {
    if (propertyId) {
      const existing = getPropertyById(propertyId);
      if (existing) return existing;
    }
    return emptyDraft();
  });
  const [stepIndex, setStepIndex] = useState(0);

  const update = (patch: Partial<Property>) => setDraft((prev) => ({ ...prev, ...patch }));

  const canAdvance = useMemo(() => {
    if (stepIndex === 0) return draft.address.trim().length > 0 && draft.city.trim().length > 0;
    return true;
  }, [stepIndex, draft.address, draft.city]);

  function goNext() {
    if (stepIndex === STEPS.length - 1) return;
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function persist(status: Property["status"]) {
    const slug = draft.slug || slugify(draft.address) || draft.id;
    const finalized: Property = {
      ...draft,
      slug,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    saveProperty(finalized);
    navigate("/admin/properties");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">{isEditing ? "Edit Property" : "Create Property"}</h1>
        <p className="mt-1 text-sm text-text-secondary">Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex]}</p>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => {
          const state = index < stepIndex ? "done" : index === stepIndex ? "current" : "upcoming";
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  state === "current"
                    ? "bg-navy text-white"
                    : state === "done"
                      ? "bg-gold/15 text-gold-dark"
                      : "bg-white text-text-secondary shadow-card"
                }`}
              >
                {state === "done" ? <Check className="h-3 w-3" /> : <span>{index + 1}</span>}
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-7">
        {stepIndex === 0 && <PropertyDetailsStep draft={draft} update={update} />}
        {stepIndex === 1 && <PropertyFeaturesStep draft={draft} update={update} />}
        {stepIndex === 2 && <PhotosStep draft={draft} update={update} />}
        {stepIndex === 3 && <RoomsStep draft={draft} update={update} />}
        {stepIndex === 4 && <NarrationStep draft={draft} update={update} />}
        {stepIndex === 5 && <PreviewStep draft={draft} onPublish={() => persist("Active")} onSaveDraft={() => persist("Draft")} />}
      </div>

      {stepIndex < STEPS.length - 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5 disabled:opacity-30"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => persist("Draft")}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
