import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Eye, Copy, Trash2, PlusCircle } from "lucide-react";
import { getAllProperties, deleteProperty, duplicateProperty } from "../../services/propertiesStore";
import { SmartImage } from "../../components/shared/SmartImage";
import { formatCurrency } from "../../utils/format";

export function AdminProperties() {
  const [properties, setProperties] = useState(() => getAllProperties());

  const refresh = useCallback(() => setProperties(getAllProperties()), []);

  function handleDelete(id: string, address: string) {
    if (!window.confirm(`Delete "${address}"? This can't be undone.`)) return;
    deleteProperty(id);
    refresh();
  }

  function handleDuplicate(id: string) {
    duplicateProperty(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Properties</h1>
          <p className="mt-1 text-sm text-text-secondary">{properties.length} propert{properties.length === 1 ? "y" : "ies"}</p>
        </div>
        <Link
          to="/admin/properties/new"
          className="flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          <PlusCircle className="h-4 w-4" />
          Create Property
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Rooms</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={property.exteriorImage}
                        alt={property.address}
                        roomType="exterior"
                        className="h-12 w-16 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-navy">{property.address}</div>
                        <div className="text-xs text-text-secondary">
                          {property.city}, {property.province} · {formatCurrency(property.price)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        property.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : property.status === "Draft"
                            ? "bg-gold/15 text-gold-dark"
                            : "bg-navy/10 text-navy/60"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{property.views ?? 0}</td>
                  <td className="px-5 py-3 text-text-secondary">{property.rooms.length}</td>
                  <td className="px-5 py-3 text-text-secondary">{property.updatedAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/properties/${property.id}/edit`}
                        aria-label={`Edit ${property.address}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy hover:bg-navy/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <a
                        href={`/tour/${property.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Preview ${property.address}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy hover:bg-navy/5"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(property.id)}
                        aria-label={`Duplicate ${property.address}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy hover:bg-navy/5"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(property.id, property.address)}
                        aria-label={`Delete ${property.address}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
