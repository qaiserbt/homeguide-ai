import { useState } from "react";
import { ImageOff } from "lucide-react";
import { getRoomVisual } from "../../utils/roomVisuals";
import { resolveAssetPath } from "../../utils/assetPath";
import type { RoomType } from "../../types/property";

interface SmartImageProps {
  src: string;
  alt: string;
  /** Label shown on the placeholder when the real photo isn't available yet. */
  label?: string;
  roomType?: RoomType;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/**
 * Renders a real property/room photo when present at `src`. If the file is
 * missing (demo mode, no photos uploaded yet), falls back to an attractive,
 * clearly-labelled placeholder instead of a broken image icon. Drop real
 * JPG/WebP files into /public/properties/... using the same paths and they
 * will render automatically — no code changes required.
 */
export function SmartImage({
  src,
  alt,
  label,
  roomType,
  className = "",
  imgClassName = "",
  priority = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const visual = getRoomVisual(roomType ?? "other");
  const Icon = visual.icon;

  if (failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${visual.gradient} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Icon className="h-7 w-7 text-white/80" strokeWidth={1.5} />
          </div>
          {label && (
            <span className="font-serif text-lg text-white/90">{label}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-white/50">
            <ImageOff className="h-3 w-3" /> Photo coming soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-navy/5 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse-soft bg-gradient-to-br from-navy/10 to-navy/5" />
      )}
      <img
        src={resolveAssetPath(src)}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
}
