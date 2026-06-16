import { IDesign } from "@designcombo/types";

export const AUTOSAVE_KEY = "d1a-editor-autosave";

export function loadSavedDesign(): IDesign | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IDesign;
  } catch {
    return null;
  }
}

export function saveDesign(d: IDesign) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(d));
  } catch {}
}

export function clearSavedDesign() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch {}
}
