// motion-config.ts
// ═══════════════════════════════════════════════════════════════════════════════
// HƯỚNG DẪN ĐIỀN FILE NÀY
// ───────────────────────────────────────────────────────────────────────────────
// 1. CONFIG.duration  → tổng thời lượng scene tính bằng giây
//                       Ví dụ: 3.0 | 4.5 | 3.1 (3 giây 3 frame @ 30fps)
//
// 2. TIMING           → định nghĩa các beats của scene theo giây
//    - Đặt tên beat mô tả hành động, ví dụ: intro / reveal / hold / outro
//    - Mỗi beat: { start: <giây bắt đầu>, duration: <giây kéo dài> }
//    - BẮT BUỘC: beat cuối cùng phải thoả: start + duration === CONFIG.duration
//    - Tham chiếu beat trong motion-scene.tsx bằng TIMING.<tênBeat>.start / .duration
//
// KHÔNG ĐIỀN / KHÔNG SỬA:
//    ACCENT, FONT, normalize, s4ei, s4eo, s4vis, s4eb, calculateGlowIntensity
// ═══════════════════════════════════════════════════════════════════════════════

export const CONFIG = {
  fps:        30,
  duration:   0,            // ← điền tổng giây
  background: 'transparent',
  width:      1080,
  height:     1920,
};

export const ACCENT = '#00FF41';
export const FONT   = 'Geist, system-ui, sans-serif';

export const TIMING: Record<string, { start: number; duration: number }> = {
  // ← điền beats của scene, ví dụ:
  // intro:  { start: 0,   duration: 0 },
  // hold:   { start: 0,   duration: 0 },
  // outro:  { start: 0,   duration: 0 },  ← start + duration phải = CONFIG.duration
};

// ── EASING FUNCTIONS — không sửa ─────────────────────────────────────────────

export function normalize(f: number, s0: number, s1: number): number {
  return Math.max(0, Math.min(1, (f - s0 * CONFIG.fps) / ((s1 - s0) * CONFIG.fps)));
}

function easeOutCubic(t: number): number { const t1 = t - 1; return t1 * t1 * t1 + 1; }
function easeInCubic(t: number): number  { return t * t * t; }
function easeOutBack(t: number): number  {
  const c1 = 1.70158, c3 = c1 + 1;
  return Math.max(0, c3 * t * t * t - c1 * t * t);
}

// s4ei  — ease-in:  0→1, xuất hiện mượt
export function s4ei(f: number, s0: number, s1: number): number { return easeOutCubic(normalize(f, s0, s1)); }

// s4eo  — ease-out: 1→0, biến mất mượt
export function s4eo(f: number, s0: number, s1: number): number { return 1 - easeInCubic(normalize(f, s0, s1)); }

// s4eb  — ease-out-back: bounce nhẹ khi vào
export function s4eb(f: number, s0: number, s1: number): number { return Math.max(0, easeOutBack(normalize(f, s0, s1))); }

// s4vis — visible window: vào rồi ra trong 1 lần
export function s4vis(f: number, i0: number, i1: number, o0?: number, o1?: number): number {
  return Math.max(0, Math.min(s4ei(f, i0, i1), o0 != null ? s4eo(f, o0, o1!) : 1));
}

export const calculateGlowIntensity = (frame: number): number => {
  const normalized = (frame % 60) / 60;
  return 0.2 + Math.sin(normalized * Math.PI) * 0.4;
};
