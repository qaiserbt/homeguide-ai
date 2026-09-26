import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Grid3x3, X } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { AvatarGuide } from "../components/avatar/AvatarGuide";
import { SmartImage } from "../components/shared/SmartImage";
import { AudioControls } from "../components/tour/AudioControls";
import { WhatsAppIcon } from "../components/shared/WhatsAppIcon";
import { whatsAppHref } from "../utils/contactLinks";
import type { AvatarState } from "../types/avatar";

export function RoomTour() {
  const { property, tourProgress, narration, openContact } = useTourContext();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [gridOpen, setGridOpen] = useState(false);

  const rooms = useMemo(() => [...property.rooms].sort((a, b) => a.order - b.order), [property.rooms]);
  const currentIndex = rooms.findIndex((r) => r.id === roomId);
  const room = currentIndex >= 0 ? rooms[currentIndex] : rooms[0];
  const previousRoom = currentIndex > 0 ? rooms[currentIndex - 1] : undefined;
  const nextRoom = currentIndex >= 0 && currentIndex < rooms.length - 1 ? rooms[currentIndex + 1] : undefined;

  // Narration is tour-wide (see useTourNarration) so switching rooms never
  // interrupts audio already playing for a different room — these just
  // reflect whether THIS room specifically is the one currently narrating.
  const isThisRoomActive = narration.activeRoomId === room?.id;
  const isSpeakingThisRoom = isThisRoomActive && narration.isSpeaking && !narration.isPaused;

  // Manual Previous/Next/grid navigation carries this when narration was
  // actively playing for the room just left, so it switches instantly to
  // narrate whichever room is now being viewed instead of leaving it
  // silent. (Auto-advance after narration finishes naturally is handled
  // directly in TourLayout instead, with a short pause before it starts —
  // it doesn't go through this.)
  const shouldAutoplay = Boolean((location.state as { autoplay?: boolean } | null)?.autoplay);

  useEffect(() => {
    if (room) tourProgress.markViewed(room.id);
  }, [room?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (shouldAutoplay && room) narration.playRoom(room);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  useEffect(() => {
    if (!nextRoom) return;
    const img = new Image();
    img.src = nextRoom.image;
  }, [nextRoom]);

  if (!room) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-text-secondary">
        Room not found.
      </div>
    );
  }

  const avatarState: AvatarState = isSpeakingThisRoom ? "speaking" : "explaining";

  return (
    <div className="lg:mx-auto lg:max-w-4xl lg:py-8">
      <div className="relative h-[calc(100dvh-5rem)] min-h-[600px] w-full overflow-hidden lg:h-[85vh] lg:rounded-[2rem]">
        <SmartImage
          key={room.id}
          src={room.image}
          alt={room.name}
          label={room.name}
          roomType={room.type}
          className="absolute inset-0 animate-fade-in"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/10 via-transparent to-navy/20" />
        {/* light scrim, just enough for the white control text to stay legible */}
        <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-navy/60 via-navy/15 to-transparent" />

        {/* header */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6">
          <Link
            to={`/tour/${property.slug}`}
            aria-label="Back to home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg text-white text-shadow-soft">{room.name}</span>
            <span className="text-xs text-white/70">
              {currentIndex + 1} / {rooms.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGridOpen(true)}
              aria-label="Browse all rooms"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* everything below — caption, avatar, nav controls — lives inside the photo frame */}
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
          {isSpeakingThisRoom && narration.caption && (
            <p className="text-center text-xl font-bold text-white text-shadow-soft sm:text-2xl">
              {narration.caption}
            </p>
          )}

          <div className="relative inline-block">
            <AvatarGuide state={avatarState} size="md" position="inline" isSpeaking={isSpeakingThisRoom} />
            <a
              href={whatsAppHref(property.agent, `${property.address}, ${property.city}`)}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className="animate-float absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md ring-2 ring-white transition-colors hover:bg-[#20bd5a]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>

          <AudioControls
            isPlaying={isSpeakingThisRoom}
            onTogglePlay={() => narration.togglePlayPause(room)}
            onPrevious={
              previousRoom
                ? () =>
                    navigate(`/tour/${property.slug}/room/${previousRoom.id}`, { state: { autoplay: isSpeakingThisRoom } })
                : undefined
            }
            onNext={
              nextRoom
                ? () => navigate(`/tour/${property.slug}/room/${nextRoom.id}`, { state: { autoplay: isSpeakingThisRoom } })
                : undefined
            }
            previousDisabled={!previousRoom}
            nextDisabled={!nextRoom}
          />
        </div>
      </div>

      {tourProgress.isComplete && (
        <div className="animate-fade-in mx-4 mt-5 rounded-2xl bg-navy/5 p-4 text-center sm:mx-6 lg:mx-0">
          <p className="text-sm font-medium text-navy">You&apos;ve completed the tour!</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link to={`/tour/${property.slug}/ask`} className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light">
              Ask HomeGuide
            </Link>
            <Link to={`/tour/${property.slug}/gallery`} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy shadow-card hover:bg-navy/5">
              View Gallery
            </Link>
            <button
              type="button"
              onClick={openContact}
              className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-gold hover:bg-gold-dark"
            >
              Contact Agent
            </button>
          </div>
        </div>
      )}

      {gridOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy/95 p-5 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center justify-between text-white">
            <h2 className="font-serif text-lg">All Rooms</h2>
            <button
              type="button"
              onClick={() => setGridOpen(false)}
              aria-label="Close room list"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {rooms.map((r) => (
              <Link
                key={r.id}
                to={`/tour/${property.slug}/room/${r.id}`}
                state={{ autoplay: isSpeakingThisRoom }}
                onClick={() => setGridOpen(false)}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  r.id === room.id ? "border-gold" : "border-transparent"
                }`}
              >
                <SmartImage src={r.image} alt={r.name} roomType={r.type} className="h-28 w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent px-2 pb-1.5 pt-6">
                  <span className="text-xs font-medium text-white">{r.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
