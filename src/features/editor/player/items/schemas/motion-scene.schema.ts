import { z } from "zod";
import {
  LayerSchema, LayerTextStyleSchema,
  DEFAULT_LAYER, DEFAULT_LAYER_TEXT_STYLE,
  zIdxOf, sanitizeZOrder,
} from "./_shared";
import type { LayerConfig, LayerTextStyleConfig } from "./_shared";
import {
  LAYER_CONFIG, LAYER_KEYS, ORDERABLE_KEYS, TEXT_LAYER_KEYS,
  LAYER_LABELS, isTextLayerKey, TEXT_DEFAULTS,
} from "../../../motion-config";
import type { LayerKey, TextLayerKey, OrderableLayerKey } from "../../../motion-config";

// ── Re-exports for consumers ──────────────────────────────────
export type { LayerConfig, LayerTextStyleConfig };
export { LayerSchema, LayerTextStyleSchema, DEFAULT_LAYER, DEFAULT_LAYER_TEXT_STYLE, zIdxOf };
export { LAYER_KEYS, ORDERABLE_KEYS, TEXT_LAYER_KEYS, LAYER_LABELS, isTextLayerKey };
export type { LayerKey, TextLayerKey, OrderableLayerKey };
export type OrderableKey = OrderableLayerKey;

// ── Layers schema: every layer gets LayerSchema ───────────────
type LayerSchemaShape = { [K in LayerKey]: z.ZodDefault<typeof LayerSchema> };
const LayersSchema = z.object(
  (Object.fromEntries(LAYER_KEYS.map((k) => [k, LayerSchema.default({})])) as LayerSchemaShape)
);

// ── TextStyle schema: one per text layer, optional defaultColor ─
type TextStyleSchemaShape = { [K in TextLayerKey]: z.ZodDefault<typeof LayerTextStyleSchema> };
const TextStyleSchema = z.object(
  (Object.fromEntries(
    TEXT_LAYER_KEYS.map((k) => {
      const cfg = LAYER_CONFIG[k];
      const dflt = (cfg.type === "text" && "defaultColor" in cfg && cfg.defaultColor)
        ? { color: cfg.defaultColor as string }
        : {};
      return [k, LayerTextStyleSchema.default(dflt)];
    })
  ) as TextStyleSchemaShape)
);
export type TextStyleConfig = z.infer<typeof TextStyleSchema>;
export const DEFAULT_TEXT_STYLE: TextStyleConfig = TextStyleSchema.parse({});

// ── Content schema: one z.string() per text layer (top-level) ─
// e.g. meta.headline, meta.subline — names come from config
type ContentShape = { [K in TextLayerKey]: z.ZodDefault<z.ZodString> };
const textContentShape = Object.fromEntries(
  TEXT_LAYER_KEYS.map((k) => [k, z.string().default(TEXT_DEFAULTS[k] ?? "")])
) as ContentShape;

// ── Main schema ───────────────────────────────────────────────
export const MotionSceneSchema = z.object({
  ...textContentShape,
  textStyle: TextStyleSchema.default({}),
  layers:    LayersSchema.default({}),
  zOrder:    z.array(z.string()).default([...ORDERABLE_KEYS]),
});

export type MotionSceneMeta = z.infer<typeof MotionSceneSchema>;
export type LayersConfig     = z.infer<typeof LayersSchema>;

export const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const result = MotionSceneSchema.safeParse(metadata ?? {});
  const data   = result.success ? result.data : MotionSceneSchema.parse({});
  const clean  = sanitizeZOrder(data.zOrder, ORDERABLE_KEYS, [...ORDERABLE_KEYS]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};
