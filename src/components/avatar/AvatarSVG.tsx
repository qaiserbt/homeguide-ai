import type { ReactNode } from "react";
import type { AvatarState } from "../../types/avatar";

interface AvatarSVGProps {
  state: AvatarState;
  className?: string;
}

/**
 * Original elf-like "Home Guide" character, drawn as inline SVG. This is
 * the built-in placeholder used until real avatar art (PNG/WebP/video) is
 * supplied — see AvatarRenderer. Not based on any existing copyrighted
 * character: a friendly, professional young male concierge with subtly
 * pointed ears, brown hair, and a navy suit.
 */
export function AvatarSVG({ state, className = "" }: AvatarSVGProps) {
  const mouth = getMouth(state);
  const arms = getArms(state);
  const brow = getBrow(state);

  return (
    <svg
      viewBox="0 0 240 300"
      className={className}
      role="img"
      aria-label={`Home Guide avatar, ${state}`}
    >
      <defs>
        <linearGradient id="hg-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4c9a0" />
          <stop offset="100%" stopColor="#e8b384" />
        </linearGradient>
        <linearGradient id="hg-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14335e" />
          <stop offset="100%" stopColor="#0b2545" />
        </linearGradient>
        <linearGradient id="hg-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4530" />
          <stop offset="100%" stopColor="#4a2f20" />
        </linearGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="120" cy="288" rx="58" ry="9" fill="#0B2545" opacity="0.08" />

      {/* arms (behind torso so hands can cross in front later) */}
      {arms.back}

      {/* torso / suit */}
      <path
        d="M62 190 Q60 150 92 138 L148 138 Q180 150 178 190 L182 275 Q120 292 58 275 Z"
        fill="url(#hg-suit)"
      />
      {/* shirt & tie */}
      <path d="M104 140 L120 158 L136 140 L128 176 L112 176 Z" fill="#FFFFFF" />
      <path d="M116 158 L124 158 L128 200 L120 214 L112 200 Z" fill="#152238" />
      {/* lapels */}
      <path d="M104 140 L86 178 L112 176 Z" fill="#0B2545" opacity="0.55" />
      <path d="M136 140 L154 178 L128 176 Z" fill="#0B2545" opacity="0.55" />
      {/* pocket square */}
      <path d="M158 170 L172 165 L169 180 L156 182 Z" fill="#F8F7F4" opacity="0.9" />
      {/* lapel pin (house icon) */}
      <circle cx="150" cy="163" r="4.5" fill="#D2AA64" />

      {/* neck */}
      <rect x="110" y="118" width="20" height="26" rx="8" fill="url(#hg-skin)" />

      {/* ears */}
      <path d="M78 96 Q60 92 62 112 Q64 126 82 122 Z" fill="url(#hg-skin)" />
      <path d="M162 96 Q180 92 178 112 Q176 126 158 122 Z" fill="url(#hg-skin)" />

      {/* head */}
      <ellipse cx="120" cy="98" rx="42" ry="46" fill="url(#hg-skin)" />

      {/* hair */}
      <path
        d="M76 92 Q70 46 120 40 Q170 46 164 92 Q160 66 140 64 Q124 78 120 62 Q116 78 100 64 Q80 66 76 92 Z"
        fill="url(#hg-hair)"
      />
      <path d="M78 84 Q74 70 84 58 Q76 72 80 88 Z" fill="url(#hg-hair)" />
      <path d="M162 84 Q166 70 156 58 Q164 72 160 88 Z" fill="url(#hg-hair)" />

      {/* eyebrows */}
      {brow}

      {/* eyes */}
      <ellipse cx="103" cy="98" rx="5.5" ry="6.5" fill="#152238" />
      <ellipse cx="137" cy="98" rx="5.5" ry="6.5" fill="#152238" />
      <circle cx="101" cy="95.5" r="1.6" fill="#fff" />
      <circle cx="135" cy="95.5" r="1.6" fill="#fff" />

      {/* nose */}
      <path d="M120 100 Q124 110 118 114 Q122 116 126 113" fill="none" stroke="#c98f63" strokeWidth="1.6" strokeLinecap="round" />

      {/* mouth */}
      {mouth}

      {/* cheeks */}
      <ellipse cx="90" cy="112" rx="7" ry="4" fill="#e8926b" opacity="0.25" />
      <ellipse cx="150" cy="112" rx="7" ry="4" fill="#e8926b" opacity="0.25" />

      {/* arms (front) */}
      {arms.front}
    </svg>
  );
}

function getBrow(state: AvatarState) {
  if (state === "thinking") {
    return (
      <>
        <path d="M92 84 Q102 78 113 83" fill="none" stroke="#4a2f20" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M128 82 Q138 76 148 82" fill="none" stroke="#4a2f20" strokeWidth="3.5" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <path d="M92 86 Q102 80 114 85" fill="none" stroke="#4a2f20" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M126 85 Q138 80 148 86" fill="none" stroke="#4a2f20" strokeWidth="3.5" strokeLinecap="round" />
    </>
  );
}

function getMouth(state: AvatarState) {
  switch (state) {
    case "speaking":
      return <ellipse cx="120" cy="122" rx="8" ry="6" fill="#8a3f38" />;
    case "thinking":
      return <path d="M110 124 Q120 120 130 124" fill="none" stroke="#8a3f38" strokeWidth="3" strokeLinecap="round" />;
    case "listening":
      return <path d="M108 122 Q120 130 132 122" fill="none" stroke="#8a3f38" strokeWidth="3" strokeLinecap="round" />;
    default:
      return <path d="M104 120 Q120 134 136 120" fill="none" stroke="#8a3f38" strokeWidth="3.5" strokeLinecap="round" />;
  }
}

function getArms(state: AvatarState): { back: ReactNode; front: ReactNode } {
  switch (state) {
    case "welcome":
      return {
        back: (
          <path d="M170 165 Q200 178 198 210 Q196 226 178 224" fill="url(#hg-suit)" />
        ),
        front: (
          <>
            <path d="M70 165 Q40 182 46 216 Q50 234 72 228" fill="url(#hg-suit)" />
            <circle cx="70" cy="230" r="11" fill="url(#hg-skin)" />
          </>
        ),
      };
    case "pointing":
      return {
        back: <path d="M172 168 Q198 176 196 204 Q194 218 178 216" fill="url(#hg-suit)" />,
        front: (
          <>
            <path d="M158 150 Q198 138 214 108 Q218 98 208 92" fill="url(#hg-suit)" />
            <circle cx="208" cy="94" r="10" fill="url(#hg-skin)" />
          </>
        ),
      };
    case "listening":
      return {
        back: <path d="M68 168 Q42 182 48 214 Q52 230 72 226" fill="url(#hg-suit)" />,
        front: (
          <>
            <path d="M158 152 Q182 136 178 108 Q176 98 164 98" fill="url(#hg-suit)" />
            <circle cx="168" cy="100" r="10" fill="url(#hg-skin)" />
          </>
        ),
      };
    case "thinking":
      return {
        back: <path d="M70 172 Q52 190 62 210 Q68 220 82 214" fill="url(#hg-suit)" />,
        front: (
          <>
            <path d="M156 154 Q170 132 152 118 Q142 112 134 120" fill="url(#hg-suit)" />
            <circle cx="136" cy="120" r="10" fill="url(#hg-skin)" />
          </>
        ),
      };
    case "speaking":
      return {
        back: <path d="M172 170 Q196 182 192 208 Q190 220 176 218" fill="url(#hg-suit)" />,
        front: (
          <>
            <path d="M68 170 Q46 184 54 206 Q58 218 76 214" fill="url(#hg-suit)" />
            <circle cx="70" cy="212" r="10" fill="url(#hg-skin)" />
            <path d="M172 172 Q192 180 190 200 Q188 212 174 210" fill="url(#hg-suit)" />
            <circle cx="172" cy="206" r="10" fill="url(#hg-skin)" />
          </>
        ),
      };
    case "explaining":
    default:
      return {
        back: <path d="M172 170 Q198 180 196 208 Q194 222 178 220" fill="url(#hg-suit)" />,
        front: (
          <>
            <path d="M68 170 Q42 180 46 208 Q50 224 70 220" fill="url(#hg-suit)" />
            <circle cx="68" cy="222" r="11" fill="url(#hg-skin)" />
          </>
        ),
      };
  }
}
