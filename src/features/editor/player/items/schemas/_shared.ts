/**
 * Shared Zod primitives — reusable across ALL motion assets.
 *
 * Import these into any asset schema file:
 *   import { LayerSchema, LayerTextStyleSchema, DEFAULT_LAYER, zIdxOf, sanitizeZOrder }
 *     from './_shared';
 *
 * Do NOT put asset-specific keys (ORDERABLE_KEYS, LAYER_LABELS, TextStyleSchema) here.
 * Those always belong in the per-asset schema file.
 */

import { z } from "zod";

// ─── LAYER SCHEMA — 9 props, reused by every sub-layer in every asset ─────────
// fromFrame / durationFrames: relative to clip start (frame 0 = first frame of clip).
export const LayerSchema = z.object({
  x:              z.number().default(0),
  y:              z.number().default(0),
  scale:          z.number().default(1),
  rotate:         z.number().default(0),
  opacity:        z.number().min(0).max(100).default(100),
  fromFrame:      z.number().default(0),
  durationFrames: z.number().default(9999),
  blur:            z.number().min(0).max(20).default(0),
  brightness:      z.number().min(0).max(200).default(100),
  entranceEffect:   z.string().default("fade"),
  backgroundEffect: z.string().default("none"),
  effectDuration:   z.number().min(0).max(120).default(0),   // 0 = use preset default
  effectIntensity:  z.number().min(0).max(200).default(100), // 100 = normal
});

export type LayerConfig = z.infer<typeof LayerSchema>;

// Single source of truth — derived, never hardcoded.
export const DEFAULT_LAYER: LayerConfig = LayerSchema.parse({});

// ─── TEXT STYLE SCHEMA — per text-layer style, reused by every asset that has text ──
export const LayerTextStyleSchema = z.object({
  bold:          z.boolean().default(false),
  underline:     z.boolean().default(false),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).default("none"),
  color:         z.string().default("#C8E6C8"),
  textAlign:     z.enum(["left", "center", "right"]).default("center"),
  strokeWidth:   z.number().min(0).max(10).default(0),
  strokeColor:   z.string().default("#00FF41"),
  maxWidth:      z.number().min(0).max(800).default(0), // 0 = no wrap
});

export type LayerTextStyleConfig = z.infer<typeof LayerTextStyleSchema>;

// Single source of truth — derived, never hardcoded.
export const DEFAULT_LAYER_TEXT_STYLE: LayerTextStyleConfig = LayerTextStyleSchema.parse({});

// ─── UTILITIES ────────────────────────────────────────────────────────────────

// z-index from zOrder position. background is always below (reserve z=0).
// Works with ANY string key names — asset-agnostic.
export const zIdxOf = (key: string, zOrder: readonly string[]): number => {
  const i = zOrder.indexOf(key);
  return i === -1 ? 0 : i + 1;
};

// Sanitize a parsed zOrder array: drop keys not in this asset's ORDERABLE_KEYS,
// reset to defaults if the result is empty.
// Call this inside every asset's parse function.
export const sanitizeZOrder = (
  zOrder: string[],
  orderableKeys: readonly string[],
  defaultOrder: string[]
): string[] => {
  const valid = zOrder.filter((k) => orderableKeys.includes(k));
  if (valid.length === 0) return defaultOrder;
  return valid;
};
