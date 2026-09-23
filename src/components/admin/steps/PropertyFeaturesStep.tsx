import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Property, School, Amenity } from "../../../types/property";
import { inputClass, labelClass } from "../formStyles";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

export function PropertyFeaturesStep({ draft, update }: StepProps) {
  const [schoolInput, setSchoolInput] = useState<Omit<School, "type"> & { type: School["type"] }>({
    name: "",
    type: "Elementary",
  });
  const [amenityInput, setAmenityInput] = useState("");

  function addSchool() {
    if (!schoolInput.name.trim()) return;
    update({ schools: [...draft.schools, schoolInput] });
    setSchoolInput({ name: "", type: "Elementary" });
  }

  function removeSchool(index: number) {
    update({ schools: draft.schools.filter((_, i) => i !== index) });
  }

  function addAmenity() {
    if (!amenityInput.trim()) return;
    const amenity: Amenity = { name: amenityInput.trim(), category: "General" };
    update({ amenities: [...draft.amenities, amenity] });
    setAmenityInput("");
  }

  function removeAmenity(index: number) {
    update({ amenities: draft.amenities.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 font-serif text-base text-navy">Basement</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-text-dark">
            <input
              type="checkbox"
              checked={draft.basement?.finished ?? false}
              onChange={(e) => update({ basement: { finished: e.target.checked, separateEntrance: draft.basement?.separateEntrance ?? false, description: draft.basement?.description } })}
            />
            Finished basement
          </label>
          <label className="flex items-center gap-2 text-sm text-text-dark">
            <input
              type="checkbox"
              checked={draft.basement?.separateEntrance ?? false}
              onChange={(e) => update({ basement: { finished: draft.basement?.finished ?? false, separateEntrance: e.target.checked, description: draft.basement?.description } })}
            />
            Separate entrance
          </label>
          <div className="sm:col-span-2">
            <label className={labelClass}>Basement notes</label>
            <input
              className={inputClass}
              value={draft.basement?.description ?? ""}
              onChange={(e) => update({ basement: { finished: draft.basement?.finished ?? false, separateEntrance: draft.basement?.separateEntrance ?? false, description: e.target.value } })}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-base text-navy">Parking</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Type</label>
            <input className={inputClass} value={draft.parking?.type ?? ""} onChange={(e) => update({ parking: { type: e.target.value, spaces: draft.parking?.spaces ?? 0, description: draft.parking?.description } })} placeholder="Attached Garage" />
          </div>
          <div>
            <label className={labelClass}>Spaces</label>
            <input type="number" min={0} className={inputClass} value={draft.parking?.spaces ?? ""} onChange={(e) => update({ parking: { type: draft.parking?.type ?? "", spaces: Number(e.target.value), description: draft.parking?.description } })} />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <input className={inputClass} value={draft.parking?.description ?? ""} onChange={(e) => update({ parking: { type: draft.parking?.type ?? "", spaces: draft.parking?.spaces ?? 0, description: e.target.value } })} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-base text-navy">Lot & Taxes</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Lot description</label>
            <input className={inputClass} value={draft.lot?.description ?? ""} onChange={(e) => update({ lot: { ...draft.lot, description: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Frontage / Depth</label>
            <div className="flex gap-2">
              <input className={inputClass} placeholder="Frontage" value={draft.lot?.frontage ?? ""} onChange={(e) => update({ lot: { ...draft.lot, frontage: e.target.value } })} />
              <input className={inputClass} placeholder="Depth" value={draft.lot?.depth ?? ""} onChange={(e) => update({ lot: { ...draft.lot, depth: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Annual Property Taxes (CAD)</label>
            <input type="number" min={0} className={inputClass} value={draft.taxes?.amount ?? ""} onChange={(e) => update({ taxes: { amount: Number(e.target.value), year: draft.taxes?.year ?? new Date().getFullYear() } })} />
          </div>
          <div>
            <label className={labelClass}>Condo Fees / month (leave blank if none)</label>
            <input type="number" min={0} className={inputClass} value={draft.condoFees ?? ""} onChange={(e) => update({ condoFees: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-base text-navy">Schools</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {draft.schools.map((school, index) => (
            <span key={`${school.name}-${index}`} className="flex items-center gap-1.5 rounded-full bg-offwhite px-3 py-1.5 text-xs text-navy">
              {school.name} · {school.type}
              <button type="button" onClick={() => removeSchool(index)} aria-label={`Remove ${school.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input className={`${inputClass} max-w-xs`} placeholder="School name" value={schoolInput.name} onChange={(e) => setSchoolInput({ ...schoolInput, name: e.target.value })} />
          <select className={`${inputClass} max-w-[160px]`} value={schoolInput.type} onChange={(e) => setSchoolInput({ ...schoolInput, type: e.target.value as School["type"] })}>
            <option>Elementary</option>
            <option>Middle</option>
            <option>High School</option>
            <option>Other</option>
          </select>
          <button type="button" onClick={addSchool} className="flex items-center gap-1 rounded-lg bg-navy px-3 py-2 text-sm text-white hover:bg-navy-light">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-base text-navy">Nearby Amenities</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {draft.amenities.map((amenity, index) => (
            <span key={`${amenity.name}-${index}`} className="flex items-center gap-1.5 rounded-full bg-offwhite px-3 py-1.5 text-xs text-navy">
              {amenity.name}
              <button type="button" onClick={() => removeAmenity(index)} aria-label={`Remove ${amenity.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputClass} max-w-xs`} placeholder="e.g. Milton GO Station" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} />
          <button type="button" onClick={addAmenity} className="flex items-center gap-1 rounded-lg bg-navy px-3 py-2 text-sm text-white hover:bg-navy-light">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </section>
    </div>
  );
}
