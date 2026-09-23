import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllProperties } from "../../services/propertiesStore";

export function AdminScripts() {
  const properties = useMemo(() => getAllProperties(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">AI Scripts</h1>
        <p className="mt-1 text-sm text-text-secondary">Review the narration the Home Guide speaks in every room.</p>
      </div>

      <div className="space-y-6">
        {properties.map((property) => (
          <div key={property.id} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg text-navy">{property.address}</h2>
              <Link to={`/admin/properties/${property.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-gold">
                Edit narration
              </Link>
            </div>
            {property.rooms.length === 0 ? (
              <p className="text-sm text-text-secondary">No rooms yet.</p>
            ) : (
              <ul className="space-y-3">
                {property.rooms.map((room) => (
                  <li key={room.id} className="rounded-xl bg-offwhite p-3">
                    <div className="text-sm font-semibold text-navy">{room.name}</div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {room.narration || <span className="italic text-text-secondary/60">No narration written yet.</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
