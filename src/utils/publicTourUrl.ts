/**
 * Builds a full, working link to the public tour for use in plain <a> tags
 * (e.g. target="_blank" preview links) — as opposed to React Router's
 * <Link>, these aren't rewritten automatically, so they need both the
 * Vite base path (/homeguide-ai/ on GitHub Pages) and the HashRouter's
 * "#" prefix (GitHub Pages can't do server-side rewrites for a plain
 * BrowserRouter path) to actually resolve.
 */
export function publicTourUrl(propertySlug: string, path: string = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/#/tour/${propertySlug}${path}`;
}
