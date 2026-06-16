// ══════════════════════════════════════════════════════════════════
//  motion-config.ts  ←  CHỈ CHỈNH FILE NÀY KHI ĐỔI MOTION MỚI
//
//  Định nghĩa tên layer + loại → Zod schema, control panel,
//  mock data tự cập nhật theo. Không cần sửa file nào khác.
// ══════════════════════════════════════════════════════════════════

// Layer types:
//   "background" → luôn z=0, không reorder, không có TextStyle
//   "asset"      → reorderable, chỉ LayerSchema (hình, trang trí, card, folder…)
//   "text"       → reorderable, LayerSchema + đầy đủ TextStyle controls (màu, bold, align…)
export type LayerType = "background" | "asset" | "text";

// ── Khai báo layers của motion này ─────────────────────────────
// Thêm / xóa / đổi tên layer ở đây → mọi thứ tự cập nhật.
// Luôn phải có ít nhất 1 layer type "background".
// "text" layer tự có controls: màu, bold, align, stroke, maxWidth…
export const LAYER_CONFIG = {
  background: { type: "background" as const, label: "Background" },
  // Thêm layer tại đây, ví dụ:
  // logo:     { type: "asset" as const, label: "Logo"   },
  // title:    { type: "text"  as const, label: "Text 1" },
  // subtitle: { type: "text"  as const, label: "Text 2", defaultColor: "#78A878" },
} as const;

// ── Nội dung mặc định cho từng text layer ──────────────────────
// Key phải trùng với tên layer có type "text" ở trên.
export const TEXT_DEFAULTS: Record<string, string> = {
  // title:    "Tiêu đề mặc định",
  // subtitle: "Mô tả mặc định",
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
