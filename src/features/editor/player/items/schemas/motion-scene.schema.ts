import { z } from "zod";
import {
  LayerSchema,
  LayerTextStyleSchema,
  DEFAULT_LAYER,
  DEFAULT_LAYER_TEXT_STYLE,
  zIdxOf,
  sanitizeZOrder,
} from "./_shared";

// Re-export shared primitives so consumers only need one import.
export type { LayerConfig, LayerTextStyleConfig } from "./_shared";
export { LayerSchema, LayerTextStyleSchema, DEFAULT_LAYER, DEFAULT_LAYER_TEXT_STYLE, zIdxOf };

// ─── ASSET-SPECIFIC: MotionScene layer keys ───────────────────────────────────
// "background" is always at the bottom — excluded from zOrder.
export const ORDERABLE_KEYS = [
  "folder",
  "card1",
  "card2",
  "card3",
  "headline",
  "subline",
  "badge",
] as const;

export const LAYER_KEYS = ["background", ...ORDERABLE_KEYS] as const;
export type LayerKey      = (typeof LAYER_KEYS)[number];
export type OrderableKey  = (typeof ORDERABLE_KEYS)[number];

export const LAYER_LABELS: Record<LayerKey, string> = {
  background: "Background",
  folder:     "Folder",
  card1:      "Card 1",
  card2:      "Card 2",
  card3:      "Card 3",
  headline:   "Headline",
  subline:    "Subline",
  badge:      "Badge",
};

// ─── TEXT STYLE — one entry per text layer, named after the layer key ─────────
// "headline" and "subline" are the text layers in THIS asset.
// Other assets define their own keys here (e.g. "title", "caption").
const TextStyleSchema = z.object({
  headline: LayerTextStyleSchema.default({}),
  subline:  LayerTextStyleSchema.default({ color: "#78A878" }),
});

export type TextStyleConfig = z.infer<typeof TextStyleSchema>;

export const DEFAULT_TEXT_STYLE: TextStyleConfig = TextStyleSchema.parse({});

// ─── MAIN SCHEMA ──────────────────────────────────────────────────────────────
export const MotionSceneSchema = z.object({
  headline: z.string().default("make money from spotify"),
  subline:  z.string().default("But it's greater when you actually can"),
  textStyle: TextStyleSchema.default({}),
  layers: z
    .object({
      background: LayerSchema.default({}),
      folder:     LayerSchema.default({}),
      card1:      LayerSchema.default({}),
      card2:      LayerSchema.default({}),
      card3:      LayerSchema.default({}),
      headline:   LayerSchema.default({}),
      subline:    LayerSchema.default({}),
      badge:      LayerSchema.default({}),
    })
    .default({}),
  // zOrder: lowest index = bottom, highest = top. background excluded.
  zOrder: z.array(z.string()).default([...ORDERABLE_KEYS]),
});

export type MotionSceneMeta  = z.infer<typeof MotionSceneSchema>;
export type LayersConfig      = MotionSceneMeta["layers"];

export const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const result = MotionSceneSchema.safeParse(metadata ?? {});
  const data   = result.success ? result.data : MotionSceneSchema.parse({});
  const clean  = sanitizeZOrder(data.zOrder, ORDERABLE_KEYS, [...ORDERABLE_KEYS]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};
