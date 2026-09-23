import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { resolveIcon } from "../utils/icons";

export function Features() {
  const { property } = useTourContext();
  const [openCategory, setOpenCategory] = useState<string | null>(property.features[0]?.category ?? null);

  return (
    <div className="min-h-screen lg:mx-auto lg:max-w-2xl">
      <header className="flex items-center gap-3 border-b border-navy/10 bg-white px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
        <Link
          to={`/tour/${property.slug}`}
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-lg text-navy">Features</h1>
      </header>

      <div className="space-y-3 px-4 py-5 sm:px-6">
        {property.features.map((category) => {
          const isOpen = openCategory === category.category;
          return (
            <div key={category.category} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : category.category)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-serif text-base text-navy">{category.category}</span>
                <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 gap-2 px-5 pb-5 sm:grid-cols-2">
                  {category.items.map((item) => {
                    const Icon = resolveIcon(item.icon);
                    return (
                      <div key={item.title} className="flex items-center gap-2.5 rounded-xl bg-offwhite px-3 py-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-gold-dark" strokeWidth={1.75} />
                        <span className="text-sm text-text-dark">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
