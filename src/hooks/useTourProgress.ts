import { useCallback, useState } from "react";

function storageKey(propertyId: string) {
  return `homeguide:tour-progress:${propertyId}`;
}

function readViewedRooms(propertyId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(propertyId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Tracks which rooms a visitor has viewed for a property, persisted locally. */
export function useTourProgress(propertyId: string, totalRooms: number) {
  const [loadedPropertyId, setLoadedPropertyId] = useState(propertyId);
  const [viewedRooms, setViewedRooms] = useState<string[]>(() => readViewedRooms(propertyId));

  if (propertyId !== loadedPropertyId) {
    setLoadedPropertyId(propertyId);
    setViewedRooms(readViewedRooms(propertyId));
  }

  const markViewed = useCallback(
    (roomId: string) => {
      setViewedRooms((prev) => {
        if (prev.includes(roomId)) return prev;
        const next = [...prev, roomId];
        try {
          localStorage.setItem(storageKey(propertyId), JSON.stringify(next));
        } catch {
          /* localStorage unavailable — progress just won't persist */
        }
        return next;
      });
    },
    [propertyId]
  );

  return {
    viewedRooms,
    viewedCount: viewedRooms.length,
    totalRooms,
    isComplete: totalRooms > 0 && viewedRooms.length >= totalRooms,
    markViewed,
  };
}
