import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { PropertyGallery } from "../components/gallery/PropertyGallery";
import { FullscreenViewer } from "../components/gallery/FullscreenViewer";
import type { RoomType } from "../types/property";

export function Gallery() {
  const { property } = useTourContext();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = useMemo(() => {
    return property.gallery.map((src) => {
      const room = property.rooms.find((r) => r.image === src);
      const roomType: RoomType = room?.type ?? (src === property.exteriorImage ? "exterior" : "other");
      return { src, label: room?.name ?? "Property Photo", roomType };
    });
  }, [property]);

  return (
    <div className="min-h-screen lg:mx-auto lg:max-w-5xl">
      <header className="flex items-center gap-3 border-b border-navy/10 bg-white px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
        <Link
          to={`/tour/${property.slug}`}
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-lg text-navy">Gallery</h1>
      </header>

      <div className="px-4 py-5 sm:px-6">
        <PropertyGallery items={items} onSelect={setOpenIndex} />
      </div>

      {openIndex !== null && (
        <FullscreenViewer items={items} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
      )}
    </div>
  );
}
