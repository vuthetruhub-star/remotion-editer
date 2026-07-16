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
// ═══════════════════════════════════════════════════════════════════════════════

// Bump this every time the metadata shape below changes (add/remove/rename a
// schema field, change TIMING keys, change CONFIG.duration). This invalidates
// any stale browser autosave automatically — see utils/autosave.ts — so a
// schema change here can never get silently overridden by old saved data.
export const DESIGN_SCHEMA_VERSION = 12;

const MOTION_SCENE_DURATION_MS = 5_000; // motion-config.ts CONFIG.duration (5.0s = 4s30f) * 1000

export const design = {
  id:  "motion-scene-default",
  fps: 30,
  tracks: [
    {
      id:       "track-motion-scene",
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
      display:  { from: 0, to: MOTION_SCENE_DURATION_MS },
      duration: MOTION_SCENE_DURATION_MS,
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
        background: { color: '#FFFFFF' },
        headline:   { color: '#111111' },
        icon:       {},
      },
    },
  },
};
