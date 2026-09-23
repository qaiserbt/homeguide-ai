import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, PlusCircle, Images, FileText, Settings } from "lucide-react";
import { Logo } from "../shared/Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/properties", label: "Properties", icon: Building2, end: true },
  { to: "/admin/properties/new", label: "Create", icon: PlusCircle, end: false },
  { to: "/admin/media", label: "Media", icon: Images, end: false },
  { to: "/admin/ai-scripts", label: "Scripts", icon: FileText, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export function AdminMobileNav() {
  return (
    <div className="border-b border-navy/10 bg-white lg:hidden">
      <div className="px-4 pt-4">
        <Logo />
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                isActive ? "bg-navy text-white" : "bg-offwhite text-text-secondary"
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
