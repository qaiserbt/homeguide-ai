interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/** Temporary HomeGuide AI mark: a house outline with a small AI sparkle. Easy to swap for real branding later. */
export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const stroke = variant === "light" ? "#FFFFFF" : "#0B2545";
  const text = variant === "light" ? "text-white" : "text-navy";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 12.5L13 5l9 7.5M6.5 11v9h13v-9"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 4l0.8 2 2 0.8-2 0.8-0.8 2-0.8-2-2-0.8 2-0.8z"
          fill="#D2AA64"
        />
      </svg>
      <span className={`font-serif text-lg font-semibold tracking-tight ${text}`}>
        HomeGuide <span className="text-gold">AI</span>
      </span>
    </div>
  );
}
