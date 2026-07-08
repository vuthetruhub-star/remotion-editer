import { IDesign } from "@designcombo/types";

export const AUTOSAVE_KEY = "d1a-editor-autosave";
export const AUTOSAVE_VERSION_KEY = "d1a-editor-autosave-version";

// Bumping DESIGN_SCHEMA_VERSION (in mock.ts) whenever the metadata shape
// changes (new/removed/renamed schema fields, TIMING keys, CONFIG.duration)
// causes any older autosave to be discarded automatically here — the app
// falls back to mock.ts instead of silently loading stale/incompatible data.
export function loadSavedDesign(currentVersion: number): IDesign | null {
  try {
    const savedVersion = localStorage.getItem(AUTOSAVE_VERSION_KEY);
    if (savedVersion !== String(currentVersion)) {
      localStorage.removeItem(AUTOSAVE_KEY);
      localStorage.setItem(AUTOSAVE_VERSION_KEY, String(currentVersion));
      return null;
    }

    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IDesign;
  } catch {
    return null;
  }
}

export function saveDesign(d: IDesign, currentVersion: number) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(d));
    localStorage.setItem(AUTOSAVE_VERSION_KEY, String(currentVersion));
  } catch {}
}

export function clearSavedDesign() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(AUTOSAVE_VERSION_KEY);
  } catch {}
}
