import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, PlayCircle, Eye, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { getAllProperties } from "../../services/propertiesStore";
import { SmartImage } from "../../components/shared/SmartImage";

export function AdminDashboard() {
  const properties = useMemo(() => getAllProperties(), []);

  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const activeTours = properties.filter((p) => p.status === "Active").length;
    const tourViews = properties.reduce((sum, p) => sum + (p.views ?? 0), 0);
    const questionsAsked = properties.reduce((sum, p) => sum + (p.questionsAsked ?? 0), 0);
    return { totalProperties, activeTours, tourViews, questionsAsked };
  }, [properties]);

  const cards = [
    { label: "Total Properties", value: stats.totalProperties, icon: Building2 },
    { label: "Active Tours", value: stats.activeTours, icon: PlayCircle },
    { label: "Tour Views", value: stats.tourViews, icon: Eye },
    { label: "Questions Asked", value: stats.questionsAsked, icon: MessageCircleQuestion },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">An overview of your interactive property tours.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <Icon className="h-4 w-4 text-gold-dark" strokeWidth={1.75} />
            </div>
            <div className="mt-3 font-serif text-2xl text-navy">{value}</div>
            <div className="text-xs text-text-secondary">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-navy">Recent Properties</h2>
          <Link to="/admin/properties" className="flex items-center gap-1 text-sm font-medium text-gold-dark hover:text-gold">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              to={`/admin/properties`}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-offwhite"
            >
              <SmartImage
                src={property.exteriorImage}
                alt={property.address}
                roomType="exterior"
                className="h-12 w-16 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-navy">{property.address}</div>
                <div className="text-xs text-text-secondary">
                  {property.city}, {property.province}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  property.status === "Active" ? "bg-green-100 text-green-700" : "bg-navy/10 text-navy/60"
                }`}
              >
                {property.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
