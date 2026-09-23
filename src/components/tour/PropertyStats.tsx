import { BedDouble, Bath, Ruler } from "lucide-react";
import type { Property } from "../../types/property";
import { formatNumber } from "../../utils/format";

interface PropertyStatsProps {
  property: Property;
  variant?: "overlay" | "card";
}

export function PropertyStats({ property, variant = "overlay" }: PropertyStatsProps) {
  const isOverlay = variant === "overlay";

  return (
    <div
      className={
        isOverlay
          ? "rounded-2xl bg-navy/70 p-5 text-white backdrop-blur-md"
          : "rounded-2xl bg-white p-5 shadow-card"
      }
    >
      <h2 className={`font-serif text-xl ${isOverlay ? "text-white" : "text-navy"}`}>{property.address}</h2>
      <p className={`text-sm ${isOverlay ? "text-white/70" : "text-text-secondary"}`}>
        {property.city}, {property.province}
      </p>

      <div className={`mt-4 flex items-center gap-5 border-t pt-4 ${isOverlay ? "border-white/15" : "border-navy/10"}`}>
        <Stat icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} light={isOverlay} />
        <Stat icon={Bath} label="Bathrooms" value={String(property.bathrooms)} light={isOverlay} />
        <Stat icon={Ruler} label="Sq. Ft." value={`~${formatNumber(property.squareFeet)}`} light={isOverlay} />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  light,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
  light: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${light ? "text-gold" : "text-gold-dark"}`} strokeWidth={1.75} />
      <div className="leading-tight">
        <div className={`text-sm font-semibold ${light ? "text-white" : "text-navy"}`}>{value}</div>
        <div className={`text-[11px] ${light ? "text-white/60" : "text-text-secondary"}`}>{label}</div>
      </div>
    </div>
  );
}
