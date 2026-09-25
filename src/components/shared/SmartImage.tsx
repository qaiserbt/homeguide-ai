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
 *
 * `className` is applied to an outer passthrough wrapper with no utility
 * classes of our own mixed in — callers commonly pass "absolute inset-0"
 * here, and mixing that with a hardcoded `relative` on the same element
 * silently loses (Tailwind's cascade lets `relative` win over `absolute`
 * regardless of className order), which previously made real photos
 * collapse to their intrinsic aspect-ratio height instead of filling the
 * container. All internal positioning lives on an inner wrapper instead.
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
      <div className={className}>
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${visual.gradient}`}
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
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden bg-navy/5">
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
    </div>
  );
}
