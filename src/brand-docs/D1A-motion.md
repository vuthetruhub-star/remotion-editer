# D1A Motion — Remotion Design Guide

> Synthesized from: `claude-design.md` · `taste-skill/premium-bento` · `impeccable/motion-design` · `impeccable/layout` · `impeccable/typography` · `skill-main/emil-design-eng` · `impeccable/brand` · `motion- cho web.md`
> All motion values in **frames at 30fps** unless noted.

---

## 1. Brand Identity

**Company:** D1AGENCY — Digital systems for bold brand growth
**Aesthetic split:**
- VISUAL layer → `premium-bento` (font, surfaces, modules)
- UX layer → terminal engineering (interactions, labels, feedback)

**Dials (Premium Bento defaults):**
- `DESIGN_VARIANCE: 6` — authored asymmetry, not chaos
- `MOTION_INTENSITY: 6` — alive but disciplined
- `VISUAL_DENSITY: 5` — balanced, practical

---

## 2. Color Tokens

Import from `brand.ts`:

```ts
import { colors } from './brand';
```

### Dark mode (default)

| Role | Token | Hex | Rule |
|---|---|---|---|
| Background | `colors.background` | `#080A0F` | Off-black cool tint — never pure `#000` |
| Surface | `colors.surface` | `#0F1218` | Bento modules, panels |
| Surface Raised | `colors.surfaceAlt` | `#161B24` | Elevated modules, modals |
| Surface Tint | `colors.surfaceHover` | `#1A2030` | Spotlight tile, featured module |
| Primary | `colors.primary` | `#00FF41` | CTAs, active states — never ambient decoration |
| Accent/Hover | `colors.primaryHover` | `#33FF66` | Hover on interactive elements |
| Text Primary | `colors.text.primary` | `#E8EDF5` | Body, headings — off-white |
| Text Secondary | `colors.text.secondary` | `#6B7A99` | Descriptions, captions |
| Text Mono | `colors.text.muted` | `#A8B5CC` | Monospace labels, metadata |
| Border | `colors.border` | `#1E2535` | Bento tile borders |
| Green Glow | `colors.glowSoft` | `rgba(0,255,65,0.08)` | Terminal UX only |

**Green glow rule:** ONLY on cursor, active command, focused input, CTA hover. Never on bento modules as ambient decoration.

### Bento module surface recipe

```tsx
style={{
  background: colors.surface,         // #0F1218
  border: `1px solid ${colors.border}`,
  borderTop: `1px solid rgba(255,255,255,0.06)`,
}}
```

### Spotlight tile recipe

```tsx
style={{
  background: colors.surfaceHover,    // #1A2030
  border: `1px solid rgba(255,255,255,0.08)`,
}}
```

---

## 3. Typography

Import from `brand.ts`:

```ts
import { fonts } from './brand';
```

**Font system:** Geist (display/heading/body) + Geist Mono (everything interactive)

| Role | Token | Weight | Size | Used for |
|---|---|---|---|---|
| Display / Hero | `fonts.display` | 800 | 56–80px | Hero headline |
| Heading H1 | `fonts.heading` | 700 | 36–48px | Section titles |
| Heading H2 | `fonts.heading` | 600 | 28–36px | Sub-sections |
| Heading H3 | `fonts.heading` | 600 | 20–24px | Module titles |
| Body | `fonts.body` | 400 | 16–18px | Content |
| Button / CTA | `fonts.mono` | 600 | 14px | All buttons use mono |
| Label / Tag | `fonts.mono` | 400 | 12px | System labels, badges |
| Data / Metric | `fonts.mono` | 700 | varies | All numbers — tabular-nums |

**Logic:** Geist = premium visual hierarchy. Geist Mono = terminal UX layer (everything the user interacts with).

**Rules from impeccable/typography:**
- Never use Geist Mono for long-form body or heading text
- Numbers always use `fontVariantNumeric: 'tabular-nums'`
- Light text on dark bg: add 0.05–0.1 to line-height
- H1 must land in 1–3 lines. 4 lines is the hard ceiling
- Body copy max-width: ~65ch

---

## 4. Spacing & Radii

```ts
import { spacing, radii } from './brand';
```

### Spacing scale

| Token | px | Use |
|---|---|---|
| `spacing.xs` | 4 | Icon gaps, inline |
| `spacing.sm` | 8 | Tight padding, tags |
| `spacing.mdSm` | 12 | Form element internal |
| `spacing.md` | 16 | Default padding |
| `spacing.lg` | 24 | Card padding, component gaps |
| `spacing.xl` | 32 | Section internal |
| `spacing.xxl` | 48 | Between components |
| `spacing.xxxl` | 64 | Between sections |

### Radii system

| Element | Token | px | Rule |
|---|---|---|---|
| Bento modules / cards | `radii.xl` | 12 | Premium-bento softness |
| Section containers | `radii.lg` | 8 | Contained, premium |
| Buttons | `radii.sm` | 4 | Terminal precision |
| Inputs, Tags | `radii.sm` | 4 | Engineered, sharp |
| Terminal frames | `radii.none` | 0 | Hard edge — terminal only |
| Status dots | `radii.full` | 9999 | ONLY for live status dots |

**Rule:** Pill (9999px) is reserved for live status dots only — never the default shape.

---

## 5. Motion System

```ts
import { motion } from './brand';
```

### Duration tokens (frames at 30fps)

| Token | Frames | Real time | Use for |
|---|---|---|---|
| `motion.press` | 2 | ~67ms | Button click, scan burst |
| `motion.fast` | 4 | ~133ms | Hover transitions, micro-interactions |
| `motion.base` | 6 | ~200ms | Default enters/exits |
| `motion.slow` | 8 | ~267ms | Exits, modals |
| `motion.section` | 18 | ~600ms | Section / module reveals |
| `motion.typing` | 1 | ~33ms/char | Typing reveal |
| `motion.pulse` | 60 | 2s | Status dot cycle |
| `motion.scan` | 72 | 2.4s | Skeleton sweep |

### Easing reference

From `impeccable/motion-design` + `emil-design-eng`:

| Curve | Use | CSS |
|---|---|---|
| ease-out | Elements entering | `cubic-bezier(0.23, 1, 0.32, 1)` |
| ease-snap | Button press, hover | `cubic-bezier(0.5, 0, 0.1, 1)` |
| ease-in-out | State toggles | `cubic-bezier(0.77, 0, 0.175, 1)` |
| ease-drawer | Drawer/modal slide | `cubic-bezier(0.32, 0.72, 0, 1)` |

**Never use ease-in for UI animations.** It starts slow — the interface feels sluggish.

### Motion decision rules (Emil design-eng)

Ask before animating:
1. **Should it animate?** — High-frequency actions (keyboard shortcuts) should NEVER animate
2. **What is the purpose?** — Spatial consistency, state indication, feedback, preventing jarring changes
3. **Which easing?** — Entering: ease-out. Moving on screen: ease-in-out. Constant: linear
4. **How fast?** — UI animations stay under 300ms (9 frames). Marketing can go longer

**Never animate from scale(0).** Start from `scale(0.95)` + opacity: 0.

**Exit animations are faster than entrances.** Use ~75% of enter duration.

### Stagger tokens

| Token | Frames | Use |
|---|---|---|
| `motion.stagger` | 2 | Between stagger reveal items |
| `motion.bootLine` | 5 | Between boot sequence lines |
| `motion.moduleStagger` | 2 | 50ms between bento module reveals |

Cap total stagger time: 10 items × 2 frames = 20 frames. Reduce per-item delay for larger sets.

---

## 6. The 12 Motion Enhancements in Remotion

Translated from `motion- cho web.md` into Remotion frame-based code.

### Which enhancements per scene type

| Scene type | Enhancements |
|---|---|
| Intro / brand reveal | #1 Typing + #2 Boot + #8 Pulse |
| Stats / metrics | #5 Number ticker + #10 Stagger |
| Hero atmospheric | #3 Scanline + #8 Pulse + #10 Stagger |
| Loading state | #11 Skeleton scan |
| Footer / status | #12 Live ticker + #8 Pulse |
| Demo / presentation | #1 Typing + #2 Boot + #6 Cursor trail |

**Stack limit:** 3–5 enhancements per scene. Never #3 + #11 together.

---

### #1 Typing Reveal

35ms/char = `motion.typing` (1 frame/char at 30fps)

```tsx
import { useCurrentFrame } from 'remotion';
import { fonts, colors, motion } from './brand';

export const TypingReveal = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.floor(frame / motion.typing);
  const visible = text.slice(0, charsVisible);
  const done = charsVisible >= text.length;

  return (
    <span style={{ fontFamily: fonts.mono, color: colors.text.primary }}>
      {visible}
      <span style={{
        opacity: done ? (Math.floor(frame / 15) % 2 === 0 ? 1 : 0) : 1,
        color: colors.primary,
        marginLeft: 2,
      }}>|</span>
    </span>
  );
};
```

---

### #2 Boot Sequence

Lines appear every `motion.bootLine` frames (5f = ~167ms stagger).

```tsx
import { useCurrentFrame } from 'remotion';
import { fonts, colors, spacing, motion } from './brand';

const BOOT_LINES = [
  '[BOOT] initializing d1agency.os...',
  '[SYS]  loading brand modules',
  '[ENV]  digital systems ready',
  '▶ SYSTEM ONLINE',
];

export const BootSequence = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {BOOT_LINES.map((line, i) => {
        const delay = i * motion.bootLine;
        const visible = frame >= delay;
        const isOk = line.startsWith('▶');

        return (
          <div key={i} style={{
            fontFamily: fonts.mono,
            fontSize: fonts.sizes.sm,
            color: isOk ? colors.primary : colors.text.secondary,
            opacity: visible ? 1 : 0,
            transform: `translateY(${visible ? 0 : 4}px)`,
            textShadow: isOk ? `0 0 10px ${colors.glowSoft}` : 'none',
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
```

---

### #5 Number Ticker

1200ms = 36 frames. Ease-out cubic.

```tsx
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { fonts, colors, motion } from './brand';

export const NumberTicker = ({
  from = 0, to, prefix = '', suffix = '', startFrame = 0
}: {
  from?: number; to: number; prefix?: string; suffix?: string; startFrame?: number;
}) => {
  const frame = useCurrentFrame();
  const duration = 36;
  const counting = frame >= startFrame && frame < startFrame + duration;

  const value = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [from, to],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  return (
    <span style={{
      fontFamily: fonts.mono,
      fontWeight: fonts.weights.bold,
      fontSize: fonts.sizes.xxl,
      color: counting ? colors.primary : colors.text.primary,
      textShadow: counting ? `0 0 12px ${colors.glowSoft}` : 'none',
      fontVariantNumeric: 'tabular-nums',
      transition: 'none',
    }}>
      {prefix}{Math.round(value).toLocaleString()}{suffix}
    </span>
  );
};
```

---

### #8 Status Pulse

2s loop = `motion.pulse` (60 frames).

```tsx
import { useCurrentFrame, interpolate } from 'remotion';
import { colors, radii, motion } from './brand';

export const StatusDot = ({ size = 8 }: { size?: number }) => {
  const frame = useCurrentFrame();
  const phase = frame % motion.pulse;

  const opacity = interpolate(
    phase,
    [0, motion.pulse / 2, motion.pulse],
    [0.6, 1, 0.6]
  );

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radii.full,
      background: colors.primary,
      opacity,
      boxShadow: `0 0 8px 2px ${colors.glowSoft}`,
    }} />
  );
};
```

---

### #10 Stagger Reveal

Items fade up one by one — 2 frame stagger = 60ms.

```tsx
import { useCurrentFrame, interpolate } from 'remotion';
import { motion } from './brand';

export const StaggerItem = ({
  index, children, startFrame = 0,
}: {
  index: number; children: React.ReactNode; startFrame?: number;
}) => {
  const frame = useCurrentFrame();
  const delay = startFrame + index * motion.stagger;
  const duration = motion.base; // 6 frames

  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [delay, delay + duration], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      {children}
    </div>
  );
};
```

---

### #12 Live Ticker

Terminal status scrolling strip.

```tsx
import { useCurrentFrame } from 'remotion';
import { fonts, colors, spacing, motion } from './brand';

const TICKER_ITEMS = [
  { label: '[BUILD] passing', ok: true },
  { label: '[DEPLOY] ready', ok: true },
  { label: '[STATUS] online', ok: true },
  { label: '[ENV] production', ok: false },
  { label: '[UPTIME] 99.98%', ok: false },
];

const ITEM_WIDTH = 180;
const TOTAL_WIDTH = TICKER_ITEMS.length * ITEM_WIDTH;

export const LiveTicker = ({ width = 1920 }: { width?: number }) => {
  const frame = useCurrentFrame();
  const speed = TOTAL_WIDTH / motion.tickerDuration;
  const x = -(frame * speed) % TOTAL_WIDTH;

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: `1px solid ${colors.borderSubtle}`,
      background: colors.background,
      padding: `${spacing.sm}px 0`,
      maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
    }}>
      <div style={{ display: 'flex', transform: `translateX(${x}px)`, whiteSpace: 'nowrap' }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{
            fontFamily: fonts.mono,
            fontSize: fonts.sizes.xs,
            color: item.ok ? colors.primary : colors.text.muted,
            padding: `0 ${spacing.lg}px`,
            letterSpacing: '0.04em',
          }}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
```

---

## 7. Layout Principles

From `impeccable/layout` + `taste-skill/premium-bento`:

### Bento module rules
- Use **varied module spans**: micro, standard, tall, hero, banner — never identical tiles
- Each module has one job — text, stat, preview, command demo, image
- At least one module must break expectation through span or media treatment
- Labels and descriptions may sit outside cards when clarity improves
- **Never use cards inside cards**
- Mix carded and uncarded sections to preserve rhythm

### Hierarchy
- **Squint test:** blur your eyes — can you still identify the most important element?
- Tight grouping: 8–12px between related siblings
- Generous separation: 48–96px between distinct sections
- Space is structural meaning: tight = same group, medium = related, large = new chapter

### Layout tools
- Use **Flexbox for 1D** (nav, button groups, card internals)
- Use **Grid for 2D** (page-level, bento, dashboards)
- `repeat(auto-fit, minmax(280px, 1fr))` for breakpoint-free responsive grids

### Forbidden layout patterns (from premium-bento AI tells)
- Three equal feature boxes below the hero
- Identical tile shells
- Centered hero as the only idea (when DESIGN_VARIANCE ≥ 4)
- Dashboard screenshot nobody can read
- Generic dashboard-wall feel
- Cards inside cards
- Pill shape as the default (reserved for status dots only)

---

## 8. Craft Rules (Emil Design Engineering)

### Buttons
- `scale(0.97)` on press — physical, confirms the UI is listening
- Never animate from `scale(0)` — start from `scale(0.95)` + opacity: 0
- `transform: scale(0.97)` on `:active`, 160ms ease-out

### Popovers / modals
- Popovers scale from their trigger — set `transform-origin` to trigger location
- Modals always scale from center — they are not anchored to a trigger

### Easing consistency
- Entering: ease-out → starts fast, feels responsive
- Exiting: ease-in → accelerates toward completion
- On-screen: ease-in-out → natural movement
- Constant motion: linear

### Transitions over keyframes for dynamic UI
- CSS transitions are interruptible — keyframes restart from zero
- For rapidly-triggered elements (status updates, live metrics), use transitions

### Performance
- Only animate `transform` and `opacity` — these skip layout/paint
- Never animate `top`, `left`, `width`, `height` casually
- Keep blur/filter effects bounded to small or isolated areas
- `will-change` only when animation is imminent — never globally

---

## 9. Do's and Don'ts

### Do
- Use Geist for display/heading/body — premium visual hierarchy
- Use Geist Mono for buttons, labels, inputs, metrics, data
- Use `radii.xl` (12px) for bento modules, `radii.sm` (4px) for interactive elements
- Add inner `border-top: 1px solid rgba(255,255,255,0.06)` on premium surfaces
- Use weighted spring for section reveals; snappy `motion.fast` for interactions
- Use `tabular-nums` for all numerical data
- Restrict green glow to terminal UX moments only
- Exit animations ~75% of enter duration

### Don't
- Never use Geist Mono for long-form body or heading text
- Never place `colors.glowSoft` ambience on bento modules
- Never loop terminal animations — once per scene only
- Never clone bento tile sizes identically
- Never use pill shape as the default
- Never use gradient text (`background-clip: text`)
- Never use pure `#000000` as background
- Never use purple-blue palette
- Never use cards inside cards
- Never animate from `scale(0)`
- Never use `ease-in` for UI entrances
- Never animate `width`, `height`, `top`, `left` directly

---

## 10. Scene Combination Matrix

| Scene | Enhancements | Dials |
|---|---|---|
| Brand intro / splash | #2 Boot + #1 Typing + #8 Pulse | MOTION_INTENSITY: 7 |
| Hero metrics | #5 Ticker + #10 Stagger + #8 Pulse | VISUAL_DENSITY: 6 |
| Atmospheric section | #3 Scanline + #10 Stagger | MOTION_INTENSITY: 4 |
| Live dashboard | #8 Pulse + #12 Ticker + #5 Ticker | VISUAL_DENSITY: 7 |
| Feature reveal | #10 Stagger + #1 Typing | DESIGN_VARIANCE: 6 |
| Loading state | #11 Skeleton | MOTION_INTENSITY: 3 |

**Max 3–5 enhancements per scene. Never stack #3 + #11.**

---

## 11. Quick Reference — Remotion Imports

```ts
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import { colors, fonts, spacing, radii, motion } from './brand';
```

### Common interpolate patterns

```tsx
// Fade in over motion.base frames
const opacity = interpolate(frame, [0, motion.base], [0, 1], { extrapolateRight: 'clamp' });

// Slide up
const y = interpolate(frame, [0, motion.section], [32, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

// Scale from 0.95
const scale = interpolate(frame, [0, motion.base], [0.95, 1], { extrapolateRight: 'clamp' });

// Spring (weighted, premium feel)
const s = spring({ frame, fps: 30, config: { damping: 200, stiffness: 100 } });
```

---

*D1A Motion v1.0 — synced with `brand.ts` · `motion- cho web.md` · `claude-design.md`*
