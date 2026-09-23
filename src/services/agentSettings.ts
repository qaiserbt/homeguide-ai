import type { Agent } from "../types/property";
import { properties as seedProperties } from "../data/properties";

const STORAGE_KEY = "homeguide:agent-settings";

const defaultAgent: Agent = seedProperties[0].agent;

export function getAgentSettings(): Agent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultAgent, ...(JSON.parse(raw) as Partial<Agent>) } : defaultAgent;
  } catch {
    return defaultAgent;
  }
}

export function saveAgentSettings(agent: Agent): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agent));
  } catch {
    /* localStorage unavailable */
  }
}
