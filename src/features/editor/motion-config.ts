// ══════════════════════════════════════════════════════════════════
//  motion-config.ts  —  Scene 3: AI Song Farming (330f / 11s)
// ══════════════════════════════════════════════════════════════════

export type LayerType = "background" | "asset" | "text";

// ── Thời lượng video (ms) — 1000ms = 1 giây ────────────────────
export const DURATION_MS = 11000; // 330f @ 30fps = 11s

export const LAYER_CONFIG = {
  background:     { type: "background" as const, label: "Background" },
  greenOrb:       { type: "asset"      as const, label: "Green Orb" },
  sunoMockup:     { type: "asset"      as const, label: "Suno Mockup" },
  streamCounter:  { type: "asset"      as const, label: "Stream Counter" },
  line1:          { type: "text"       as const, label: "Line 1", defaultColor: "#EDEFEC" },
  line2:          { type: "text"       as const, label: "Line 2", defaultColor: "#EDEFEC" },
  line3:          { type: "text"       as const, label: "Line 3", defaultColor: "#EDEFEC" },
} as const;

export const TEXT_DEFAULTS: Record<string, string> = {
  line1: "Create AI songs with Suno",
  line2: "Register as artist on Spotify",
  line3: "Get streams. Get paid.",
};

// ══════════════════════════════════════════════════════════════════
//  KHÔNG SỬA PHẦN DƯỚI — tự tính từ config ở trên
// ══════════════════════════════════════════════════════════════════

export type LayerKey = keyof typeof LAYER_CONFIG;

export type TextLayerKey = {
  [K in LayerKey]: (typeof LAYER_CONFIG)[K] extends { type: "text" } ? K : never
}[LayerKey];

export type OrderableLayerKey = {
  [K in LayerKey]: (typeof LAYER_CONFIG)[K] extends { type: "background" } ? never : K
}[LayerKey];

export const LAYER_KEYS     = Object.keys(LAYER_CONFIG) as LayerKey[];

export const ORDERABLE_KEYS = LAYER_KEYS.filter(
  (k) => LAYER_CONFIG[k].type !== "background"
) as OrderableLayerKey[];

export const TEXT_LAYER_KEYS = LAYER_KEYS.filter(
  (k) => LAYER_CONFIG[k].type === "text"
) as TextLayerKey[];

export const LAYER_LABELS: Record<LayerKey, string> = Object.fromEntries(
  LAYER_KEYS.map((k) => [k, LAYER_CONFIG[k].label ?? k])
) as Record<LayerKey, string>;

export const isTextLayerKey = (k: string): k is TextLayerKey =>
  k in LAYER_CONFIG && LAYER_CONFIG[k as LayerKey].type === "text";