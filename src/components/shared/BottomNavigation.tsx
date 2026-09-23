import { NavLink } from "react-router-dom";
import { Home, Grid3x3, LayoutPanelLeft, Star, Phone } from "lucide-react";

interface BottomNavigationProps {
  propertyId: string;
  onContact: () => void;
}

export function BottomNavigation({ propertyId, onContact }: BottomNavigationProps) {
  const base = `/tour/${propertyId}`;
  const items = [
    { to: base, label: "Home", icon: Home, end: true },
    { to: `${base}/gallery`, label: "Gallery", icon: Grid3x3, end: false },
    { to: `${base}/floor-plan`, label: "Floor Plan", icon: LayoutPanelLeft, end: false },
    { to: `${base}/features`, label: "Features", icon: Star, end: false },
  ];

  return (
    <nav
      aria-label="Property navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 backdrop-blur-md safe-area-bottom"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={label} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-navy" : "text-text-secondary hover:text-navy"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li className="flex-1">
          <button
            type="button"
            onClick={onContact}
            className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:text-navy"
          >
            <Phone className="h-5 w-5" strokeWidth={1.75} />
            Contact
          </button>
        </li>
      </ul>
    </nav>
  );
}
