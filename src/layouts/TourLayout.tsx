import { useEffect, useState } from "react";
import { Outlet, useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { getPropertyBySlug, isDeletedSeedSlug, restoreSeedBySlug, syncPropertiesFromBackend } from "../services/propertiesStore";
import { getSiteSettings, getActiveTrackUrl, syncSiteSettingsFromBackend } from "../services/siteSettings";
import { BottomNavigation } from "../components/shared/BottomNavigation";
import { AgentContactSheet } from "../components/shared/AgentContactSheet";
import { useTourProgress } from "../hooks/useTourProgress";
import { useTourNarration, type TourNarration } from "../hooks/useTourNarration";
import { useBackgroundMusic } from "../hooks/useBackgroundMusic";
import type { Property } from "../types/property";

export interface TourOutletContext {
  property: Property;
  tourProgress: ReturnType<typeof useTourProgress>;
  narration: TourNarration;
  openContact: () => void;
}

export function TourLayout() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [contactOpen, setContactOpen] = useState(false);
  const [property, setProperty] = useState<Property | undefined>(() =>
    propertyId ? getPropertyBySlug(propertyId) : undefined
  );
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());
  const tourProgress = useTourProgress(propertyId ?? "", property?.rooms.length ?? 0);

  // Narration lives here (tour-wide), not per-room, so that Previous/Next
  // Room and the room grid never cut off audio already playing — only an
  // explicit play/pause tap, or the narration finishing on its own, changes
  // what's playing. When a room finishes naturally, only auto-advance the
  // *view* to the next room if the visitor is still looking at the room
  // that just finished — if they've already moved on, leave their view
  // alone and just let the background narration end quietly.
  const narration = useTourNarration((finishedRoomId) => {
    if (!property) return;
    const viewedRoomMatch = location.pathname.match(/\/room\/([^/]+)/);
    const viewedRoomId = viewedRoomMatch ? decodeURIComponent(viewedRoomMatch[1]) : null;
    if (viewedRoomId !== finishedRoomId) return;
    const rooms = [...property.rooms].sort((a, b) => a.order - b.order);
    const idx = rooms.findIndex((r) => r.id === finishedRoomId);
    const next = idx >= 0 && idx < rooms.length - 1 ? rooms[idx + 1] : undefined;
    if (next) {
      navigate(`/tour/${property.slug}/room/${next.id}`, { state: { autoplay: true }, replace: true });
    }
  });

  // Background music sits under the narration, ducking whenever any room's
  // narration is actively speaking so the voice guide stays clear.
  const music = useBackgroundMusic(
    getActiveTrackUrl(siteSettings),
    siteSettings.backgroundMusicEnabled,
    narration.isSpeaking && !narration.isPaused
  );

  // No separate mute button — music turns itself on the first time the
  // visitor presses play on the narration (a real user gesture, which is
  // what unmuting requires), then just keeps playing for the rest of the
  // session. Every play/pause tap goes through these two functions, so
  // wrapping them here covers every entry point (the big play button, the
  // avatar tap, autoplay-on-room-entry).
  const narrationWithMusic: TourNarration = {
    ...narration,
    playRoom: (room) => {
      music.ensureAudible();
      narration.playRoom(room);
    },
    togglePlayPause: (room) => {
      music.ensureAudible();
      narration.togglePlayPause(room);
    },
  };

  // The property may have been created/edited on a different device — pull
  // the latest from the shared backend so this tour doesn't show stale (or
  // empty) data just because this browser never made that edit itself.
  useEffect(() => {
    let cancelled = false;
    syncPropertiesFromBackend().then((synced) => {
      if (!cancelled && synced && propertyId) setProperty(getPropertyBySlug(propertyId));
    });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // Same reasoning for background music settings — pull the latest track
  // choice from the shared backend once on mount.
  useEffect(() => {
    let cancelled = false;
    syncSiteSettingsFromBackend().then((synced) => {
      if (!cancelled && synced) setSiteSettings(getSiteSettings());
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <Outlet
        context={
          { property, tourProgress, narration: narrationWithMusic, openContact: () => setContactOpen(true) } satisfies TourOutletContext
        }
      />
      <BottomNavigation propertyId={property.slug} onContact={() => setContactOpen(true)} />
      <AgentContactSheet
        agent={property.agent}
        propertyAddress={`${property.address}, ${property.city}`}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
