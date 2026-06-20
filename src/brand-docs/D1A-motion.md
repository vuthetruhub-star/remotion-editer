# D1A Motion — Code Guide

> Chỉ chứa pattern kỹ thuật. Không chứa màu sắc, spacing, radii, hay aesthetic rules.
> Đọc `CLAUDE.md` để biết luật ưu tiên khi viết motion.

---

## 1. D1A Defaults (chỉ 2)

| Thứ | Giá trị | Ghi chú |
|---|---|---|
| Accent color | `#00FF41` | Dùng làm `accentColor` default trong Zod schema — user có thể override |
| Font | `Geist, system-ui, sans-serif` | Font mặc định cho mọi text |

**Tất cả giá trị khác** (màu nền, màu text, size, spacing, radii) → lấy từ reference hoặc hỏi user.

---

## 2. Motion Pattern — Prop-Based / Beat-Based

### Kiến trúc

```
motion-config.ts    → CONFIG, TIMING, easing functions
motion-scene.tsx    → Beat components + MotionScene + Zod schema + entry point
```

### Quy tắc bất biến

| ✅ ĐÚNG | ❌ SAI |
|---|---|
| Truyền `{ f, data }` vào mọi Beat component | `useCurrentFrame()` bên trong Beat |
| `useCurrentFrame()` CHỈ trong `SceneContent` wrapper | `interpolate()` từ Remotion |
| Timing theo **giây** trong TIMING object | Timing hardcode số frame |
| Animate `transform` + `opacity` | Animate `width`, `height`, `top`, `left` |
| `Math.max(0, value)` cho mọi opacity | Để opacity âm |

---

## 3. Easing Functions

```ts
export function normalize(f: number, s0: number, s1: number): number {
  return Math.max(0, Math.min(1, (f - s0 * CONFIG.fps) / ((s1 - s0) * CONFIG.fps)));
}

function easeOutCubic(t: number): number { const t1 = t - 1; return t1*t1*t1 + 1; }
function easeInCubic(t: number): number  { return t*t*t; }
function easeOutBack(t: number): number  {
  const c1 = 1.70158, c3 = c1 + 1;
  return Math.max(0, c3*t*t*t - c1*t*t);
}

export const s4ei  = (f: number, s0: number, s1: number) => easeOutCubic(normalize(f, s0, s1));
export const s4eo  = (f: number, s0: number, s1: number) => 1 - easeInCubic(normalize(f, s0, s1));
export const s4eb  = (f: number, s0: number, s1: number) => Math.max(0, easeOutBack(normalize(f, s0, s1)));
export const s4vis = (f: number, i0: number, i1: number, o0?: number, o1?: number) =>
  Math.max(0, Math.min(s4ei(f, i0, i1), o0 != null ? s4eo(f, o0, o1!) : 1));
```

---

## 4. Timing Cheat Sheet

| Hiệu ứng | Công thức |
|---|---|
| Fade in | `s4ei(f, start, start + dur)` |
| Fade out | `s4eo(f, start, start + dur)` |
| Fade in → out | `s4vis(f, inStart, inEnd, outStart, outEnd)` |
| Scale 0.9 → 1 | `0.9 + 0.1 * s4ei(f, start, end)` |
| Slide up từ offset | `offset * (1 - s4ei(f, start, end))` |
| Bounce in | `s4eb(f, start, end)` |
| Typewriter + cursor | xem section 6 |

---

## 5. Template Files

Template đã có sẵn — **không copy từ đây, dùng trực tiếp 2 file**:

```
src/features/editor/motion-config.ts
src/features/editor/player/items/motion-scene.tsx
```

Mở 2 file đó, đọc comment hướng dẫn và điền vào.

---

## 6. Visual Techniques — CHỈ THAM KHẢO

> ⚠️ **Phần này là kỹ thuật tham khảo, KHÔNG áp dụng mặc định.**
>
> Chỉ dùng khi:
> - User không có reference VÀ yêu cầu AI tự quyết định visual
> - User yêu cầu cụ thể liên quan đến kỹ thuật này
>
> Khi có reference → bỏ qua section này hoàn toàn, copy từ reference.
> Khi áp dụng → **mọi giá trị số/màu phải hỏi user hoặc tự điều chỉnh theo taste**,
> không copy nguyên giá trị từ ví dụ dưới đây.

---

### 6.1 Background với ánh sáng nhiều lớp

Kỹ thuật: xếp nhiều `div` với `radial-gradient` để tạo chiều sâu và nguồn sáng.

```tsx
// Wrapper — màu base + opacity gắn với staticOp
<div style={{ position: 'absolute', inset: 0, background: '<màu base>', opacity: staticOp }}>

  {/* Mỗi div = 1 nguồn sáng. Vị trí, màu, kích thước tuỳ scene */}
  <div style={{ position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse <w>% <h>% at <x>% <y>%, <màu> 0%, transparent <stop>%)'
  }}/>

  {/* Grid overlay mờ — tạo texture */}
  <div style={{ position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(<màu grid> 1px, transparent 1px),
      linear-gradient(90deg, <màu grid> 1px, transparent 1px)
    `,
    backgroundSize: '<size>px <size>px',
  }}/>
</div>
```

Nguyên lý:
- Nguồn sáng chính thường ở trung tâm hoặc góc nổi bật nhất
- Màu và opacity của từng blob tạo ra mood — hỏi user nếu không có reference
- Grid size và màu grid tuỳ scene — giá trị trong ví dụ chỉ để minh hoạ cú pháp

---

### 6.2 Glass / Frosted Card

Kỹ thuật: kết hợp `backdropFilter` + `border` mỏng + `boxShadow` inset để tạo cảm giác kính.

```tsx
<div style={{
  background:           '<màu nền mờ>',          // thường rgba với alpha thấp
  backdropFilter:       'blur(<Xpx>) saturate(<Y>)',
  WebkitBackdropFilter: 'blur(<Xpx>) saturate(<Y>)',
  border:               '1px solid <màu viền>',   // thường rgba trắng mờ
  boxShadow: [
    '<inset highlight trên> inset',  // dải sáng cạnh trên — tạo cảm giác kính
    '<drop shadow ngoài>',
  ].join(', '),
}}/>
```

Nguyên lý:
- `backdropFilter blur` càng cao → kính càng mờ
- `saturate` > 1 làm màu phía sau rực hơn khi nhìn qua kính
- Inset shadow `0 1px 0 rgba(255,255,255,X)` ở cạnh trên tạo highlight đặc trưng của kính
- Alpha của `background` quyết định mức độ trong suốt — hỏi user

---

### 6.3 SVG Icon có chiều sâu

Kỹ thuật: `radialGradient` + `feGaussianBlur filter` + highlight path để tạo khối 3D.

```tsx
<svg width={size} height={size} viewBox="0 0 200 200" fill="none">
  <defs>
    {/* Gradient: tâm sáng góc trên-trái, tối dần góc dưới-phải → cảm giác khối */}
    <radialGradient id="g" cx="30%" cy="28%" r="68%">
      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="<cao>"/>
      <stop offset="100%" stopColor={color}   stopOpacity="<thấp>"/>
    </radialGradient>

    {/* Glow filter: blur ra rồi merge lại để tạo hào quang */}
    <filter id="glow">
      <feGaussianBlur stdDeviation="<X>" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  {/* Shape chính: fill mờ + stroke = outline phát sáng */}
  {/* Highlight path: nét trắng mờ cạnh trên-trái = cạnh sáng của khối 3D */}
</svg>
```

Nguyên lý:
- `cx ~30%, cy ~28%` đặt tâm sáng góc trên-trái — ánh sáng cổ điển cho 3D
- `fillOpacity` thấp (0.08–0.15) + `stroke` tạo cảm giác outline phát sáng
- `feGaussianBlur stdDeviation` lớn hơn = glow rộng hơn — tuỳ taste

---

### 6.4 Typewriter với cursor nhấp nháy

```tsx
// Utility function — đặt ở đầu file, không sửa
function tw(text: string, f: number, dur: number): string {
  return text.slice(0, Math.ceil(Math.min(1, f / dur) * text.length));
}

// Trong scene component:
const TW      = <số frame cho typewriter effect>;  // hỏi user hoặc tuỳ taste
const display = tw(text, f, TW);
const blink   = Math.floor(f / 4) % 2 === 0;      // cursor nhấp nháy mỗi 4 frame
const cursor  = <span style={{ opacity: blink ? 1 : 0 }}>|</span>;

// Render:
<span>{display}{f < TW && display.length < text.length && cursor}</span>
```

---

### 6.5 staticOp — hiện ngay, chỉ fade lúc thoát

```tsx
// Dùng khi muốn toàn bộ scene hiện ngay frame 0, chỉ fade out ở beat cuối
const exit     = TIMING.<tênBeatCuối>;
const staticOp = s4eo(f, exit.start, exit.start + exit.duration);

// Gán vào opacity của background wrapper và từng layer:
// opacity: staticOp * (layer.opacity / 100)
```

---

*D1A Motion v5.0 — Reference-first · No hardcode · Ask when unsure*
