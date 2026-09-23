import { Link } from "react-router-dom";
import { SmartImage } from "../shared/SmartImage";
import type { Room } from "../../types/property";

interface RoomSelectorProps {
  rooms: Room[];
  currentRoomId: string;
  propertySlug: string;
  viewedRooms: string[];
}

export function RoomSelector({ rooms, currentRoomId, propertySlug, viewedRooms }: RoomSelectorProps) {
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Select a room">
      {rooms.map((room) => {
        const isActive = room.id === currentRoomId;
        const isViewed = viewedRooms.includes(room.id);
        return (
          <Link
            key={room.id}
            to={`/tour/${propertySlug}/room/${room.id}`}
            role="tab"
            aria-selected={isActive}
            className={`group relative shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
              isActive ? "border-gold" : "border-transparent"
            }`}
          >
            <SmartImage
              src={room.image}
              alt={room.name}
              roomType={room.type}
              className="h-16 w-24 sm:h-20 sm:w-28"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent px-1.5 pb-1 pt-4">
              <span className="block truncate text-[10px] font-medium text-white">{room.name}</span>
            </div>
            {isViewed && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold shadow" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
