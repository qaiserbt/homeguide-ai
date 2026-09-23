import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutPanelLeft, ZoomIn, ZoomOut } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { resolveAssetPath } from "../utils/assetPath";

export function FloorPlan() {
  const { property } = useTourContext();
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex min-h-screen flex-col lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/tour/${property.slug}`}
            aria-label="Back to home"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-lg text-navy">Floor Plan</h1>
        </div>
        {property.floorPlanImage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-navy/5"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-navy/5"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        {property.floorPlanImage ? (
          <img
            src={resolveAssetPath(property.floorPlanImage)}
            alt={`Floor plan for ${property.address}`}
            style={{ transform: `scale(${zoom})` }}
            className="max-w-full transition-transform duration-200"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-text-secondary">
            <LayoutPanelLeft className="h-10 w-10 text-navy/20" strokeWidth={1.5} />
            <p className="font-serif text-lg text-navy">Floor plan coming soon.</p>
            <p className="max-w-xs text-sm">
              The agent hasn&apos;t uploaded a floor plan for this property yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
