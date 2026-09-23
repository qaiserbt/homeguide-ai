import { useState } from "react";
import { Outlet, useParams, Link } from "react-router-dom";
import { Home } from "lucide-react";
import { getPropertyBySlug } from "../services/propertiesStore";
import { BottomNavigation } from "../components/shared/BottomNavigation";
import { AgentContactSheet } from "../components/shared/AgentContactSheet";
import { useTourProgress } from "../hooks/useTourProgress";
import type { Property } from "../types/property";

export interface TourOutletContext {
  property: Property;
  tourProgress: ReturnType<typeof useTourProgress>;
  openContact: () => void;
}

export function TourLayout() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [contactOpen, setContactOpen] = useState(false);
  const property = propertyId ? getPropertyBySlug(propertyId) : undefined;
  const tourProgress = useTourProgress(propertyId ?? "", property?.rooms.length ?? 0);

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-offwhite px-6 text-center">
        <Home className="h-10 w-10 text-navy/30" />
        <h1 className="font-serif text-2xl text-navy">Property not found</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          We couldn&apos;t find a tour for &ldquo;{propertyId}&rdquo;. Try the demo property instead.
        </p>
        <Link
          to="/tour/236-pringle"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          View Demo Tour
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pb-20">
      <Outlet context={{ property, tourProgress, openContact: () => setContactOpen(true) } satisfies TourOutletContext} />
      <BottomNavigation propertyId={property.slug} onContact={() => setContactOpen(true)} />
      <AgentContactSheet agent={property.agent} open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
