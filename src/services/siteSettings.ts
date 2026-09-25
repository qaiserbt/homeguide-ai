/**
 * Small shared, tour-wide settings (currently just background music).
 * Same reasoning as propertiesStore: cached in localStorage for instant
 * synchronous reads, but backed by the Worker's /site-settings endpoint so
 * a change made from one device (e.g. uploading a track from the laptop)
 * is visible on every other device instead of staying stuck locally.
 */
export interface MusicTrack {
  id: string;
  name: string;
  url: string;
}

export interface SiteSettings {
  musicTracks: MusicTrack[];
  activeTrackId: string | null;
  backgroundMusicEnabled: boolean;
}

const STORAGE_KEY = "homeguide:site-settings";
const DEFAULT_SETTINGS: SiteSettings = { musicTracks: [], activeTrackId: null, backgroundMusicEnabled: false };

const API_ORIGIN = (
  import.meta.env.VITE_UPLOAD_API_URL ?? "https://homeguide-ai-uploads.fragrant-cake-acc5.workers.dev/upload"
).replace(/\/upload$/, "");

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** The track that should actually play right now, or null if music is off/empty. */
export function getActiveTrackUrl(settings: SiteSettings): string | null {
  if (!settings.backgroundMusicEnabled) return null;
  return settings.musicTracks.find((t) => t.id === settings.activeTrackId)?.url ?? null;
}

function writeLocal(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage unavailable — save still reaches the backend below */
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  writeLocal(settings);
  fetch(`${API_ORIGIN}/site-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }).catch(() => {
    /* offline or backend unreachable — local cache still has the edit */
  });
}

/** Pulls the latest settings from the backend into the local cache. Returns whether anything was found. */
export async function syncSiteSettingsFromBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_ORIGIN}/site-settings`);
    if (!res.ok) return false;
    const data = (await res.json()) as { settings?: Partial<SiteSettings> | null };
    if (!data.settings) return false;
    writeLocal({ ...DEFAULT_SETTINGS, ...data.settings });
    return true;
  } catch {
    return false;
  }
}
