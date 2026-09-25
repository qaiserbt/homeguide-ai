import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Grid3x3, X } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { useNarration } from "../hooks/useNarration";
import { AvatarGuide } from "../components/avatar/AvatarGuide";
import { SmartImage } from "../components/shared/SmartImage";
import { RoomFeatures } from "../components/tour/RoomFeatures";
import { RoomSelector } from "../components/tour/RoomSelector";
import { AudioControls } from "../components/tour/AudioControls";
import { TourProgress } from "../components/tour/TourProgress";
import type { AvatarState } from "../types/avatar";

export function RoomTour() {
  const { property, tourProgress, openContact } = useTourContext();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gridOpen, setGridOpen] = useState(false);

  const rooms = useMemo(() => [...property.rooms].sort((a, b) => a.order - b.order), [property.rooms]);
  const currentIndex = rooms.findIndex((r) => r.id === roomId);
  const room = currentIndex >= 0 ? rooms[currentIndex] : rooms[0];
  const previousRoom = currentIndex > 0 ? rooms[currentIndex - 1] : undefined;
  const nextRoom = currentIndex >= 0 && currentIndex < rooms.length - 1 ? rooms[currentIndex + 1] : undefined;

  const narration = useNarration(room?.narration ?? "");

  useEffect(() => {
    if (room) tourProgress.markViewed(room.id);
  }, [room?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const avatarState: AvatarState = narration.isSpeaking && !narration.isPaused ? "speaking" : "explaining";

  return (
    <div className="lg:mx-auto lg:max-w-5xl lg:px-8 lg:py-8">
      <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <div className="relative lg:min-w-0">
          <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden sm:h-[75vh] lg:h-[720px] lg:rounded-[2rem]">
            <SmartImage
              key={room.id}
              src={room.image}
              alt={room.name}
              label={room.name}
              roomType={room.type}
              className="absolute inset-0 animate-fade-in"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/40" />

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
              <button
                type="button"
                onClick={() => setGridOpen(true)}
                aria-label="Browse all rooms"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
            </div>

            {/* avatar overlay — stays in the property's visual space, never covering the main subject */}
            <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-6 sm:bottom-6">
              <AvatarGuide
                state={avatarState}
                size="md"
                position="inline"
                isSpeaking={narration.isSpeaking && !narration.isPaused}
                message={room.narration}
                onToggleAudio={narration.togglePlayPause}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 px-4 pt-5 sm:px-6 lg:min-w-0 lg:px-0 lg:pt-0">
          <RoomFeatures features={room.features} />

          <TourProgress viewedCount={tourProgress.viewedCount} totalRooms={tourProgress.totalRooms} />

          <RoomSelector
            rooms={rooms}
            currentRoomId={room.id}
            propertySlug={property.slug}
            viewedRooms={tourProgress.viewedRooms}
          />

          <AudioControls
            isPlaying={narration.isSpeaking && !narration.isPaused}
            onTogglePlay={narration.togglePlayPause}
            onPrevious={previousRoom ? () => navigate(`/tour/${property.slug}/room/${previousRoom.id}`) : undefined}
            onNext={nextRoom ? () => navigate(`/tour/${property.slug}/room/${nextRoom.id}`) : undefined}
            previousDisabled={!previousRoom}
            nextDisabled={!nextRoom}
          />

          {tourProgress.isComplete && (
            <div className="animate-fade-in rounded-2xl bg-navy/5 p-4 text-center">
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
        </div>
      </div>

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
