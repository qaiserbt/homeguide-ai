import { resolveIcon } from "../../utils/icons";
import type { Feature } from "../../types/property";

interface RoomFeaturesProps {
  features: Feature[];
}

export function RoomFeatures({ features }: RoomFeaturesProps) {
  if (features.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
      {features.map((feature) => {
        const Icon = resolveIcon(feature.icon);
        return (
          <div
            key={feature.title}
            className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-3 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15">
              <Icon className="h-4 w-4 text-gold-dark" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium leading-snug text-text-dark">{feature.title}</span>
          </div>
        );
      })}
    </div>
  );
}
