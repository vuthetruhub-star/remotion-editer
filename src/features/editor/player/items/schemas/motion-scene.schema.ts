import { z } from "zod";

// Per-layer overrides applied on top of the built-in animation.
// fromFrame / durationFrames are relative to clip start (frame 0 = first frame of this clip).
const LayerSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  rotate: z.number().default(0),
  opacity: z.number().min(0).max(100).default(100),
  fromFrame: z.number().default(0),
  durationFrames: z.number().default(150),
  blur: z.number().min(0).max(20).default(0),
  brightness: z.number().min(0).max(200).default(100),
});

export type LayerConfig = z.infer<typeof LayerSchema>;

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
export type LayerKey = (typeof LAYER_KEYS)[number];
export type OrderableKey = (typeof ORDERABLE_KEYS)[number];

export const LAYER_LABELS: Record<LayerKey, string> = {
  background: "Background",
  folder: "Folder",
  card1: "Card 1",
  card2: "Card 2",
  card3: "Card 3",
  headline: "Headline",
  subline: "Subline",
  badge: "Badge",
};

// Default layer config (all Zod defaults, no overrides)
export const DEFAULT_LAYER: LayerConfig = {
  x: 0, y: 0, scale: 1, rotate: 0,
  opacity: 100, fromFrame: 0, durationFrames: 150,
  blur: 0, brightness: 100,
};

// Per-layer text styling — each text layer (headline, subline) has its own independent style.
// Use [text|#color] syntax in headline/subline strings for per-span colors.
const LayerTextStyleSchema = z.object({
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

// Container holding independent styles for each text layer.
const TextStyleSchema = z.object({
  headline: LayerTextStyleSchema.default({}),
  subline:  LayerTextStyleSchema.default({ color: "#78A878" }),
});

export type TextStyleConfig = z.infer<typeof TextStyleSchema>;

export const DEFAULT_LAYER_TEXT_STYLE: LayerTextStyleConfig = {
  bold: false, underline: false, textTransform: "none",
  color: "#C8E6C8", textAlign: "center", strokeWidth: 0, strokeColor: "#00FF41", maxWidth: 0,
};

export const DEFAULT_TEXT_STYLE: TextStyleConfig = {
  headline: DEFAULT_LAYER_TEXT_STYLE,
  subline:  { ...DEFAULT_LAYER_TEXT_STYLE, color: "#78A878" },
};

// RENAME: Replace "MotionScene" with your project name when using as a template.
export const MotionSceneSchema = z.object({
  headline: z.string().default("make money from spotify"),
  subline: z.string().default("But it's greater when you actually can"),
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
  // zOrder: lowest index = bottom, highest = top. background is always below all.
  zOrder: z
    .array(z.string())
    .default(["folder", "card1", "card2", "card3", "headline", "subline", "badge"]),
});

export type MotionSceneMeta = z.infer<typeof MotionSceneSchema>;
export type LayersConfig = MotionSceneMeta["layers"];

export const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const result = MotionSceneSchema.safeParse(metadata ?? {});
  return result.success ? result.data : MotionSceneSchema.parse({});
};

// z-index value for a given layer key (based on its position in zOrder)
export const zIdxOf = (key: string, zOrder: string[]): number => {
  const i = zOrder.indexOf(key);
  return i === -1 ? 0 : i + 1; // +1: reserve 0 for background
};
