import type { Property } from "../../../types/property";
import { inputClass, labelClass, textareaClass } from "../formStyles";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

const PROPERTY_TYPES = ["Detached", "Semi-Detached", "Townhouse", "Condo", "Duplex", "Other"];

export function PropertyDetailsStep({ draft, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="address">Property Address</label>
          <input
            id="address"
            className={inputClass}
            value={draft.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="236 Pringle Ave"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="city">City</label>
          <input id="city" className={inputClass} value={draft.city} onChange={(e) => update({ city: e.target.value })} placeholder="Milton" />
        </div>
        <div>
          <label className={labelClass} htmlFor="province">Province</label>
          <input id="province" className={inputClass} value={draft.province} onChange={(e) => update({ province: e.target.value })} placeholder="Ontario" />
        </div>

        <div>
          <label className={labelClass} htmlFor="postalCode">Postal Code</label>
          <input id="postalCode" className={inputClass} value={draft.postalCode ?? ""} onChange={(e) => update({ postalCode: e.target.value })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="propertyType">Property Type</label>
          <select id="propertyType" className={inputClass} value={draft.propertyType} onChange={(e) => update({ propertyType: e.target.value })}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="price">Price (CAD)</label>
          <input id="price" type="number" min={0} className={inputClass} value={draft.price || ""} onChange={(e) => update({ price: Number(e.target.value) })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="squareFeet">Square Feet</label>
          <input id="squareFeet" type="number" min={0} className={inputClass} value={draft.squareFeet || ""} onChange={(e) => update({ squareFeet: Number(e.target.value) })} />
        </div>

        <div>
          <label className={labelClass} htmlFor="bedrooms">Bedrooms</label>
          <input id="bedrooms" type="number" min={0} className={inputClass} value={draft.bedrooms || ""} onChange={(e) => update({ bedrooms: Number(e.target.value) })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="bathrooms">Bathrooms</label>
          <input id="bathrooms" type="number" min={0} className={inputClass} value={draft.bathrooms || ""} onChange={(e) => update({ bathrooms: Number(e.target.value) })} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Property Description</label>
        <textarea
          id="description"
          className={textareaClass}
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="A short overview buyers will see before starting the tour."
        />
      </div>
    </div>
  );
}
