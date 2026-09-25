import { useRef, useState } from "react";
import { Check, Loader2, Music, Trash2, Upload } from "lucide-react";
import { getAgentSettings, saveAgentSettings } from "../../services/agentSettings";
import { getSiteSettings, saveSiteSettings, type MusicTrack } from "../../services/siteSettings";
import { uploadPhoto } from "../../services/uploads";
import { inputClass, labelClass } from "../../components/admin/formStyles";

export function AdminSettings() {
  const [agent, setAgent] = useState(() => getAgentSettings());
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    saveAgentSettings(agent);
    saveSiteSettings(siteSettings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function handleUploadTrack(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadPhoto(file);
      const track: MusicTrack = { id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ""), url };
      setSiteSettings((prev) => ({
        ...prev,
        musicTracks: [...prev.musicTracks, track],
        activeTrackId: prev.activeTrackId ?? track.id,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveTrack(id: string) {
    setSiteSettings((prev) => {
      const musicTracks = prev.musicTracks.filter((t) => t.id !== id);
      return {
        ...prev,
        musicTracks,
        activeTrackId: prev.activeTrackId === id ? (musicTracks[0]?.id ?? null) : prev.activeTrackId,
      };
    });
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
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg text-navy">
              <Music className="h-4 w-4" /> Background Music
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Plays softly under the narration during every property tour, and ducks down while the guide is speaking.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
            <input
              type="checkbox"
              checked={siteSettings.backgroundMusicEnabled}
              onChange={(e) => setSiteSettings({ ...siteSettings, backgroundMusicEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-navy/30 text-navy focus:ring-gold/50"
            />
            Enabled
          </label>
        </div>

        <div className="space-y-2">
          {siteSettings.musicTracks.length === 0 && (
            <p className="rounded-lg bg-offwhite px-3 py-2.5 text-sm text-text-secondary">
              No tracks uploaded yet. Add an MP3 you have the rights to use below.
            </p>
          )}
          {siteSettings.musicTracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                siteSettings.activeTrackId === track.id ? "border-gold bg-gold/5" : "border-navy/10"
              }`}
            >
              <input
                type="radio"
                name="active-track"
                checked={siteSettings.activeTrackId === track.id}
                onChange={() => setSiteSettings({ ...siteSettings, activeTrackId: track.id })}
                className="h-4 w-4 shrink-0 border-navy/30 text-navy focus:ring-gold/50"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-text-dark">{track.name}</span>
              <audio controls src={track.url} className="h-8 w-32 shrink-0 sm:w-40" />
              <button
                type="button"
                onClick={() => handleRemoveTrack(track.id)}
                aria-label={`Remove ${track.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUploadTrack(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-medium text-navy hover:bg-navy/10 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload a Track"}
          </button>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
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
  );
}
