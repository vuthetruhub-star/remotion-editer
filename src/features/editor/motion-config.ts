// motion-config.ts — TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
// File này định nghĩa CONFIG (kích thước/thời lượng/nền) và TIMING (các beat
// theo giây) cho motion hiện tại. Đây là 1 trong 2 file duy nhất cần sửa khi
// tạo motion mới — không tạo thêm file config nào khác.
//
// ĐIỀN VÀO (đánh dấu ← FILL):
//   CONFIG.duration → tổng thời lượng scene, tính bằng giây
//   TIMING          → chia scene thành các beat theo giây (vd: intro, hold, outro)
//   ACCENT / FONT   → chỉ đổi nếu user yêu cầu; mặc định giữ #00FF41 + Geist
//
// KHÔNG SỬA:
//   Các easing function (normalize, s4ei, s4eo, s4vis, s4eb) — dùng chung mãi mãi
// ═══════════════════════════════════════════════════════════════════════════════

export const CONFIG = {
  fps:        30,
  duration:   5.0, // ← FILL: tổng thời lượng scene (giây)
  background: 'transparent',
  width:      1080,
  height:     1920,
};

// ← FILL: chia scene thành các beat theo giây. Mỗi beat có start + duration.
// Ví dụ 1 mẫu 3-beat: vào (ease-in) → giữ → ra (ease-out).
export const TIMING: Record<string, { start: number; duration: number }> = {
  intro: { start: 0,   duration: 0.6 },
  hold:  { start: 0.6, duration: 3.8 },
  outro: { start: 4.4, duration: 0.6 }, // 4.4 + 0.6 = 5.0 = CONFIG.duration
};

export const ACCENT = '#00FF41';
export const FONT   = 'Geist, system-ui, sans-serif';

// ── EASING FUNCTIONS — không sửa ─────────────────────────────────────────────

export function normalize(f: number, s0: number, s1: number): number {
  return Math.max(0, Math.min(1, (f - s0 * CONFIG.fps) / ((s1 - s0) * CONFIG.fps)));
}

function easeOutCubic(t: number): number { const t1 = t - 1; return t1 * t1 * t1 + 1; }
function easeInCubic(t: number): number  { return t * t * t; }

// s4ei — ease-in: 0→1, xuất hiện mượt
export function s4ei(f: number, s0: number, s1: number): number { return easeOutCubic(normalize(f, s0, s1)); }

// s4eo — ease-out: 1→0, biến mất mượt
export function s4eo(f: number, s0: number, s1: number): number { return 1 - easeInCubic(normalize(f, s0, s1)); }

// s4vis — visible window: vào rồi ra trong 1 lần
export function s4vis(f: number, i0: number, i1: number, o0?: number, o1?: number): number {
  return Math.max(0, Math.min(s4ei(f, i0, i1), o0 != null ? s4eo(f, o0, o1!) : 1));
}

function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return Math.max(0, c3 * t * t * t - c1 * t * t);
}

// s4eb — ease-out-back: bounce nhẹ khi vào
export function s4eb(f: number, s0: number, s1: number): number { return Math.max(0, easeOutBack(normalize(f, s0, s1))); }
