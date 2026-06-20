// mock.ts — TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
// File này định nghĩa dữ liệu khởi tạo cho editor khi load scene.
// AI đọc file này để biết đúng shape của metadata object.
//
// ĐIỀN VÀO:
//   DURATION_MS  → CONFIG.duration * 1000  (ví dụ: 3.0s = 3_000, 3s3f = 3_100)
//   metadata     → mỗi layer khớp chính xác với Zod schema đã định nghĩa
//                  trong motion-scene.tsx — sai field là editor không load được
//
// KHÔNG SỬA:
//   Cấu trúc ngoài (id, fps, tracks, size, details, animations)
//   Các field từ LayerSchema: x, y, scale, rotate, opacity, fromFrame,
//   durationFrames, blur, brightness, entranceEffect, backgroundEffect,
//   effectDuration, effectIntensity
//   Các field từ LayerTextStyleSchema: bold, underline, textTransform,
//   color, textAlign, strokeWidth, strokeColor, maxWidth
// ═══════════════════════════════════════════════════════════════════════════════

const DURATION_MS = 0; // ← CONFIG.duration * 1000

export const design = {
  id:  "motion-scene-default",
  fps: 30,
  tracks: [
    {
      id:       "track-motion-main",
      type:     "video",
      name:     "MotionScene",
      accepts:  ["text","image","video","audio","composition","caption","template","motionScene"],
      items:    ["motion-scene-item-1"],
      magnetic: false,
      static:   false,
    },
  ],
  size: { width: 1080, height: 1920 },
  trackItemIds:   ["motion-scene-item-1"],
  transitionsMap: {},
  trackItemsMap: {
    "motion-scene-item-1": {
      id:       "motion-scene-item-1",
      name:     "Motion Scene 1",
      type:     "motionScene",
      display:  { from: 0, to: DURATION_MS },
      duration: DURATION_MS,
      details: {
        width: 1080, height: 1920, top: 0, left: 0,
        opacity: 100, transform: "none", rotate: "0deg",
        blur: 0, brightness: 100,
        flipX: false, flipY: false, visibility: "visible",
        borderRadius: 0, borderWidth: 0, borderColor: "transparent",
        boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
      },
      animations: {},
      metadata: {
        // ─── Mỗi key ở đây = 1 layer trong ORDERABLE_KEYS ──────────────────
        // Thêm/bớt layer cho khớp với motion-scene.tsx
        // Field của LayerSchema (không sửa tên, chỉ sửa giá trị nếu cần):
        //   x, y, scale, rotate, opacity, fromFrame, durationFrames,
        //   blur, brightness, entranceEffect, backgroundEffect,
        //   effectDuration, effectIntensity
        // Field của LayerTextStyleSchema (chỉ dùng cho text layer):
        //   bold, underline, textTransform, color, textAlign,
        //   strokeWidth, strokeColor, maxWidth
        // Field tuỳ chỉnh: lấy đúng từ schema đã định nghĩa trong motion-scene.tsx

        // ← ví dụ visual layer (card, icon...):
        // layerName: {
        //   x: 0, y: 0, scale: 1, rotate: 0, opacity: 100,
        //   fromFrame: 0, durationFrames: 9999,
        //   blur: 0, brightness: 100,
        //   entranceEffect: 'fade', backgroundEffect: 'none',
        //   effectDuration: 0, effectIntensity: 100,
        //   // ← custom fields từ schema, ví dụ:
        //   // cardBg: '', cardWidth: 0, cardHeight: 0, ...
        // },

        // ← ví dụ text layer (label, title...):
        // layerName: {
        //   x: 0, y: 0, scale: 1, rotate: 0, opacity: 100,
        //   fromFrame: 0, durationFrames: 9999,
        //   blur: 0, brightness: 100,
        //   entranceEffect: 'fade', backgroundEffect: 'none',
        //   effectDuration: 0, effectIntensity: 100,
        //   bold: false, underline: false, textTransform: 'none',
        //   color: '', textAlign: 'center',
        //   strokeWidth: 0, strokeColor: '', maxWidth: 0,
        //   // ← custom fields từ schema, ví dụ:
        //   // content: '', fontSize: 0, gapBelow: 0,
        // },

        accentColor: '#00FF41',
        zOrder: [], // ← điền đúng thứ tự layers, khớp với ORDERABLE_KEYS
      },
    },
  },
};
