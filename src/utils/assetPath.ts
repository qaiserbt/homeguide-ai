/**
 * Resolves a root-absolute public asset path (e.g. "/avatar/avatar-welcome.png",
 * as stored in src/data/*.ts) against Vite's configured `base`. Needed
 * because this app is deployed under a GitHub Pages project subpath
 * (/homeguide-ai/) rather than a domain root — a literal "/avatar/..."
 * would otherwise resolve to the wrong origin path. External URLs pass
 * through unchanged.
 */
export function resolveAssetPath(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
