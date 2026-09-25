import { properties as seedProperties } from "../data/properties";
import type { Property } from "../types/property";

/**
 * Local persistence for properties created/edited in the admin dashboard.
 * Seed demo data (src/data/properties.ts) always renders unless overridden
 * here by id. Swap this file's internals for real API calls when a backend
 * exists — every caller already goes through this module, never through
 * data/properties.ts directly.
 */

const STORAGE_KEY = "homeguide:custom-properties";
const DELETED_SEED_KEY = "homeguide:deleted-seed-ids";

function readCustom(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
}

function writeCustom(list: Property[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable — changes just won't persist across reloads */
  }
}

function readDeletedSeedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SEED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function getAllProperties(): Property[] {
  const custom = readCustom();
  const customIds = new Set(custom.map((p) => p.id));
  const deletedSeedIds = new Set(readDeletedSeedIds());
  const seed = seedProperties.filter((p) => !customIds.has(p.id) && !deletedSeedIds.has(p.id));
  return [...seed, ...custom];
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return getAllProperties().find((p) => p.slug === slug);
}

export function getPropertyById(id: string): Property | undefined {
  return getAllProperties().find((p) => p.id === id);
}

export function saveProperty(property: Property): void {
  const custom = readCustom();
  const idx = custom.findIndex((p) => p.id === property.id);
  if (idx >= 0) {
    custom[idx] = property;
  } else {
    custom.push(property);
  }
  writeCustom(custom);
}

export function deleteProperty(id: string): void {
  writeCustom(readCustom().filter((p) => p.id !== id));
  const isSeed = seedProperties.some((p) => p.id === id);
  if (isSeed) {
    const deleted = readDeletedSeedIds();
    if (!deleted.includes(id)) {
      try {
        localStorage.setItem(DELETED_SEED_KEY, JSON.stringify([...deleted, id]));
      } catch {
        /* ignore */
      }
    }
  }
}

export function duplicateProperty(id: string): Property | undefined {
  const source = getPropertyById(id);
  if (!source) return undefined;
  const suffix = Math.random().toString(36).slice(2, 7);
  const duplicate: Property = {
    ...source,
    id: `${source.id}-copy-${suffix}`,
    slug: `${source.slug}-copy-${suffix}`,
    address: `${source.address} (Copy)`,
    status: "Draft",
    views: 0,
    questionsAsked: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  saveProperty(duplicate);
  return duplicate;
}

export function isCustomProperty(id: string): boolean {
  return readCustom().some((p) => p.id === id);
}

/** Was this slug a built-in seed property that got deleted in this browser? */
export function isDeletedSeedSlug(slug: string): boolean {
  const seedIds = readDeletedSeedIds();
  if (seedIds.length === 0) return false;
  return seedProperties.some((p) => p.slug === slug && seedIds.includes(p.id));
}

/** Undoes a deleteProperty() call on a seed property, restoring it to its original state. */
export function restoreSeedBySlug(slug: string): void {
  const seed = seedProperties.find((p) => p.slug === slug);
  if (!seed) return;
  const deleted = readDeletedSeedIds().filter((id) => id !== seed.id);
  try {
    localStorage.setItem(DELETED_SEED_KEY, JSON.stringify(deleted));
  } catch {
    /* ignore */
  }
  // Drop any stale custom copy too, so the original seed data reappears untouched.
  writeCustom(readCustom().filter((p) => p.id !== seed.id));
}
