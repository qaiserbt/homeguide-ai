import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Images,
  FileText,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Logo } from "../shared/Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/properties", label: "Properties", icon: Building2, end: true },
  { to: "/admin/properties/new", label: "Create Property", icon: PlusCircle, end: false },
  { to: "/admin/media", label: "Media", icon: Images, end: false },
  { to: "/admin/ai-scripts", label: "AI Scripts", icon: FileText, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-navy/10 bg-white px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-navy text-white" : "text-text-secondary hover:bg-navy/5 hover:text-navy"
              }`
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <a
        href="/tour/236-pringle"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gold-dark hover:bg-gold/10"
      >
        <ExternalLink className="h-4 w-4" />
        View Demo Tour
      </a>
    </aside>
  );
}
