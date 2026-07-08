/**
 * Shared Zod primitives — reusable across ALL motion assets.
 *
 * 3 nhóm chuẩn — MỌI motion mới phải phân loại asset vào đúng 1 trong 3 nhóm
 * này khi viết schema (xem HOW-TO-ADD-MOTION.md):
 *
 *   TextLayerSchema  — headline / text / title / subtitle (asset có chữ)
 *   AssetLayerSchema — card / hình khối / icon / ảnh (đa số asset trong motion)
 *   BackgroundSchema — nền của cả composition (chỉ 1 field: color)
 *
 * Import vào file schema của từng asset:
 *   import { TextLayerSchema, AssetLayerSchema, BackgroundSchema, zIdxOf, sanitizeZOrder }
 *     from './_shared';
 *
 * Do NOT put asset-specific keys (ORDERABLE_KEYS, LAYER_LABELS, icon paths...) here.
 * Those always belong in the per-asset schema file.
 *
 * Mỗi schema có 1 WIDGET MAP đi kèm (*_WIDGETS bên dưới) — panel tự sinh
 * (control-item/auto-panel.tsx) đọc map này để biết field nào vẽ slider, màu
 * nào vẽ color-picker, v.v. Đây là dữ liệu THẬT (không phải comment), đọc được
 * lúc chạy — khi thêm field mới vào schema, LUÔN thêm entry tương ứng vào map.
 */

import { z } from "zod";

// ─── WIDGET TYPES — dùng chung cho auto-panel ─────────────────────────────────

export type WidgetSpec =
  | { type: "slider"; min: number; max: number; step?: number }
  | { type: "color" }
  | { type: "checkbox" }
  | { type: "select"; options: string[] }
  | { type: "text" }
  | { type: "number" };

// ─── TEXT LAYER — headline / text / title / subtitle ──────────────────────────
export const TextLayerSchema = z.object({
  x:             z.number().default(0),
  y:             z.number().default(0),
  scale:         z.number().default(1),
  rotate:        z.number().default(0),
  bold:          z.boolean().default(false),
  underline:     z.boolean().default(false),
  italic:        z.boolean().default(false),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).default("none"),
  color:         z.string().default("#FFFFFF"),
  lineHeight:    z.number().min(0.8).max(3).default(1.3),
  maxWidth:      z.number().min(0).max(2000).default(0), // 0 = không giới hạn/không xuống dòng
  textAlign:     z.enum(["left", "center", "right"]).default("center"),
});

export type TextLayerConfig = z.infer<typeof TextLayerSchema>;
export const DEFAULT_TEXT_LAYER: TextLayerConfig = TextLayerSchema.parse({});

export const TEXT_LAYER_WIDGETS: Record<keyof TextLayerConfig, WidgetSpec> = {
  x:             { type: "slider", min: -960, max: 960 },
  y:             { type: "slider", min: -1920, max: 1920 },
  scale:         { type: "slider", min: 0.1, max: 4, step: 0.01 },
  rotate:        { type: "slider", min: -180, max: 180 },
  bold:          { type: "checkbox" },
  underline:     { type: "checkbox" },
  italic:        { type: "checkbox" },
  textTransform: { type: "select", options: ["none", "uppercase", "lowercase"] },
  color:         { type: "color" },
  lineHeight:    { type: "slider", min: 0.8, max: 3, step: 0.05 },
  maxWidth:      { type: "slider", min: 0, max: 2000 },
  textAlign:     { type: "select", options: ["left", "center", "right"] },
};

// ─── ASSET LAYER — card / hình khối / icon / ảnh (đa số asset trong motion) ───
// color mặc định '' (rỗng) = dùng màu gốc riêng của asset đó (vd icon brand
// thật) — chỉ override khi user chỉnh tay. Cùng idiom với borderColor cũ.
export const AssetLayerSchema = z.object({
  x:              z.number().default(0),
  y:              z.number().default(0),
  rotate:         z.number().default(0),
  color:          z.string().default(""),
  scale:          z.number().default(1),
  effectDuration: z.number().min(0).max(120).default(0), // tốc độ hiệu ứng vào/ra, 0 = dùng mặc định preset
});

export type AssetLayerConfig = z.infer<typeof AssetLayerSchema>;
export const DEFAULT_ASSET_LAYER: AssetLayerConfig = AssetLayerSchema.parse({});

export const ASSET_LAYER_WIDGETS: Record<keyof AssetLayerConfig, WidgetSpec> = {
  x:              { type: "slider", min: -960, max: 960 },
  y:              { type: "slider", min: -1920, max: 1920 },
  rotate:         { type: "slider", min: -180, max: 180 },
  color:          { type: "color" },
  scale:          { type: "slider", min: 0.1, max: 4, step: 0.01 },
  effectDuration: { type: "slider", min: 0, max: 120 },
};

// ─── BACKGROUND — nền cả composition, chỉ màu ──────────────────────────────────
export const BackgroundSchema = z.object({
  color: z.string().default("#FFFFFF"),
});

export type BackgroundConfig = z.infer<typeof BackgroundSchema>;
export const DEFAULT_BACKGROUND: BackgroundConfig = BackgroundSchema.parse({});

export const BACKGROUND_WIDGETS: Record<keyof BackgroundConfig, WidgetSpec> = {
  color: { type: "color" },
};

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
