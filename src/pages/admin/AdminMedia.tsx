import { useMemo } from "react";
import { getAllProperties } from "../../services/propertiesStore";
import { SmartImage } from "../../components/shared/SmartImage";
import type { RoomType } from "../../types/property";

export function AdminMedia() {
  const items = useMemo(() => {
    const properties = getAllProperties();
    const all: { src: string; label: string; roomType?: RoomType }[] = [];
    for (const property of properties) {
      all.push({ src: property.exteriorImage, label: `${property.address} — Exterior`, roomType: "exterior" });
      for (const room of property.rooms) {
        all.push({ src: room.image, label: `${property.address} — ${room.name}`, roomType: room.type });
      }
    }
    return all;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">Media</h1>
        <p className="mt-1 text-sm text-text-secondary">Every photo across your properties, in one place.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, index) => (
            <div key={`${item.src}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl">
              <SmartImage src={item.src} alt={item.label} roomType={item.roomType} className="h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent px-2 pb-1.5 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[11px] font-medium text-white">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
