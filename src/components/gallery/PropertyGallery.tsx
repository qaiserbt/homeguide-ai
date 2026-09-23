import { SmartImage } from "../shared/SmartImage";
import type { RoomType } from "../../types/property";

interface GalleryItem {
  src: string;
  label: string;
  roomType?: RoomType;
}

interface PropertyGalleryProps {
  items: GalleryItem[];
  onSelect: (index: number) => void;
}

export function PropertyGallery({ items, onSelect }: PropertyGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <button
          key={item.src + index}
          type="button"
          onClick={() => onSelect(index)}
          className={`group relative overflow-hidden rounded-xl ${
            index % 5 === 0 ? "col-span-2 aspect-[16/10] sm:col-span-1 sm:aspect-square" : "aspect-square"
          }`}
        >
          <SmartImage
            src={item.src}
            alt={item.label}
            label={item.label}
            roomType={item.roomType}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent px-2 pb-1.5 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-medium text-white">{item.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
