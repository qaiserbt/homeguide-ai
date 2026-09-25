import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface AudioControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

export function AudioControls({
  onPrevious,
  onNext,
  onTogglePlay,
  isPlaying,
  previousDisabled,
  nextDisabled,
}: AudioControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className="flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause narration" : "Play narration"}
        aria-pressed={isPlaying}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-card-lg transition-transform active:scale-95 hover:bg-white/90"
      >
        {isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="ml-0.5 h-6 w-6" fill="currentColor" />}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
      >
        Next Room
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
