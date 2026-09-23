import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage } from "../shared/SmartImage";
import type { RoomType } from "../../types/property";

interface GalleryItem {
  src: string;
  label: string;
  roomType?: RoomType;
}

interface FullscreenViewerProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function FullscreenViewer({ items, index, onClose, onNavigate }: FullscreenViewerProps) {
  const item = items[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-navy/95 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white sm:px-6">
        <span className="text-sm text-white/70">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + items.length) % items.length)}
          aria-label="Previous photo"
          className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <SmartImage
          key={item.src}
          src={item.src}
          alt={item.label}
          label={item.label}
          roomType={item.roomType}
          className="h-full max-h-[70vh] w-full max-w-3xl animate-fade-in rounded-xl"
          imgClassName="object-contain"
          priority
        />

        <button
          type="button"
          onClick={() => onNavigate((index + 1) % items.length)}
          aria-label="Next photo"
          className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="pb-[calc(1rem+env(safe-area-inset-bottom))] text-center text-sm text-white/70">{item.label}</p>
    </div>
  );
}
