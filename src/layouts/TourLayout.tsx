import { useState } from "react";
import { Outlet, useParams, Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { getPropertyBySlug, isDeletedSeedSlug, restoreSeedBySlug } from "../services/propertiesStore";
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
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const property = propertyId ? getPropertyBySlug(propertyId) : undefined;
  const tourProgress = useTourProgress(propertyId ?? "", property?.rooms.length ?? 0);

  if (!property) {
    const wasDeleted = propertyId ? isDeletedSeedSlug(propertyId) : false;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-offwhite px-6 text-center">
        <Home className="h-10 w-10 text-navy/30" />
        <h1 className="font-serif text-2xl text-navy">Property not found</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          {wasDeleted
            ? `"${propertyId}" was removed from Properties in this browser earlier.`
            : `We couldn't find a tour for "${propertyId}". Try the demo property instead.`}
        </p>
        {wasDeleted ? (
          <button
            type="button"
            onClick={() => {
              restoreSeedBySlug(propertyId as string);
              navigate(0);
            }}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
          >
            Restore This Property
          </button>
        ) : (
          <Link
            to="/tour/236-pringle"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
          >
            View Demo Tour
          </Link>
        )}
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
