import { useState } from "react";
import { Check } from "lucide-react";
import { getAgentSettings, saveAgentSettings } from "../../services/agentSettings";
import { inputClass, labelClass } from "../../components/admin/formStyles";

export function AdminSettings() {
  const [agent, setAgent] = useState(() => getAgentSettings());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveAgentSettings(agent);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          This agent profile is used as the default contact on every new property tour.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={agent.title} onChange={(e) => setAgent({ ...agent, title: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Brokerage</label>
            <input className={inputClass} value={agent.brokerage} onChange={(e) => setAgent({ ...agent, brokerage: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={agent.phone} onChange={(e) => setAgent({ ...agent, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={agent.email} onChange={(e) => setAgent({ ...agent, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Website</label>
            <input className={inputClass} value={agent.website ?? ""} onChange={(e) => setAgent({ ...agent, website: e.target.value })} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
