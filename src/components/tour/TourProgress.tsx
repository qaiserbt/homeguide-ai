import { CheckCircle2 } from "lucide-react";

interface TourProgressProps {
  viewedCount: number;
  totalRooms: number;
}

export function TourProgress({ viewedCount, totalRooms }: TourProgressProps) {
  if (totalRooms === 0) return null;
  const isComplete = viewedCount >= totalRooms;
  const percent = Math.min(100, Math.round((viewedCount / totalRooms) * 100));

  return (
    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
      {isComplete ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold-dark" />
      ) : (
        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      )}
      <span>{isComplete ? "All rooms explored" : `${viewedCount} of ${totalRooms} rooms explored`}</span>
    </div>
  );
}
