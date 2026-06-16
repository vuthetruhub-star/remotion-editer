# D1AGENCY — Brand Guide for Remotion

> Tokens from `brand.ts`. All motion values are in **frames at 30fps**.
> Read alongside `D1A-motion.md` for the 12 enhancement references.

---

## Import

```ts
import { colors, fonts, spacing, radii, motion } from './brand';
```

---

## Colors

### Core palette

| Token | Hex | Use for |
|---|---|---|
| `colors.primary` | `#00FF41` | CTAs, highlights, progress bars, active states |
| `colors.primaryHover` | `#33FF66` | Hover states |
| `colors.primaryPressed` | `#00CC34` | Click/press feedback |
| `colors.primaryFaded` | `rgba(0,255,65,0.12)` | Selected backgrounds, badge fills |
| `colors.glow` | `rgba(0,255,65,0.22)` | Strong glow — use sparingly |
| `colors.glowSoft` | `rgba(0,255,65,0.10)` | Subtle glow on text, dots |

### Surfaces

| Token | Hex | Use for |
|---|---|---|
| `colors.background` | `#0A0B0A` | Root background |
| `colors.surface` | `#101211` | Cards, panels |
| `colors.surfaceAlt` | `#161A18` | Nested surfaces, modals |
| `colors.surfaceHover` | `#1A1F1C` | Hover on interactive surfaces |

### Borders

| Token | Hex | Use for |
|---|---|---|
| `colors.border` | `#1F2A23` | Default borders |
| `colors.borderSubtle` | `#141816` | Dividers, inner separators |
| `colors.borderHover` | `#2D3D33` | Focused/hovered borders |

### Text

| Token | Hex | Use for |
|---|---|---|
| `colors.text.primary` | `#EDEFEC` | Headings, body |
| `colors.text.secondary` | `#9BA39E` | Subtitles, labels |
| `colors.text.muted` | `#5C6560` | Placeholders, timestamps, meta |

### Status

| Token | Hex | Use for |
|---|---|---|
| `colors.critical` | `#EF4444` | Errors, warnings |
| `colors.notice` | `#A78BFA` | Info badges, highlights |
| `colors.info` | `#86EFAC` | Success, passing states |

---

## Fonts

**Font System:** Geist (display/heading/body) + Geist Mono (data, numbers, interactive elements).

| Role | Font | Weight | Size | Used for |
|---|---|---|---|---|
| Display / Hero | Geist | 800 | 56–80px | Premium hero headline |
| Heading H1 | Geist | 700 | 36–48px | Section titles |
| Heading H2 | Geist | 600 | 28–36px | Sub-sections |
| Heading H3 | Geist | 600 | 20–24px | Module titles |
| Body Large | Geist | 400 | 18px | Feature descriptions |
| Body Regular | Geist | 400 | 16px | Main content |
| Body Small | Geist | 400 | 14px | Supporting copy |
| Button / CTA | Geist Mono | 600 | 14px | Terminal UX — all buttons |
| Label / Tag | Geist Mono | 400 | 12px | System labels, metadata, badges |
| Command / Input | Geist Mono | 400 | 14px | Command palette, form inputs |
| Data / Metric | Geist Mono | 700 | varies | All numbers and metrics |
| Code | Geist Mono | 400 | 14px | Code blocks |

> **Logic:** Geist = premium visual hierarchy. Geist Mono = terminal UX layer (everything interactive).

---

## Spacing

| Token | Value (px) |
|---|---|
| `spacing.xs` | `4` |
| `spacing.sm` | `8` |
| `spacing.md` | `16` |
| `spacing.lg` | `32` |
| `spacing.xl` | `64` |
| `spacing.xxl` | `128` |

---

## Border Radii

| Token | Value (px) | Use for |
|---|---|---|
| `radii.sm` | `4` | Chips, tags, buttons |
| `radii.md` | `6` | Inputs, small cards |
| `radii.lg` | `8` | Cards |
| `radii.xl` | `12` | Modals, panels, bento modules |
| `radii.full` | `9999` | Pills, dots, circles — status only |

---

## Motion — Animation Timing

> All values in **frames**. At 30fps: `1 frame = ~33ms`.

### Duration tokens

| Token | Frames | Real time | Use for |
|---|---|---|---|
| `motion.press` | `2` | ~67ms | Button click |
| `motion.fast` | `4` | ~133ms | Micro-interactions, hover |
| `motion.base` | `6` | ~200ms | Default enters/exits |
| `motion.slow` | `8` | ~267ms | Exits, modal fade |
| `motion.section` | `18` | ~600ms | Section / module reveals |
| `motion.typing` | `1` | ~33ms/char | Typing reveal (#1) |
| `motion.pulse` | `60` | 2s | Status pulse cycle (#8) |
| `motion.scan` | `72` | 2.4s | Skeleton sweep (#11) |

### Stagger tokens

| Token | Frames | Use for |
|---|---|---|
| `motion.stagger` | `2` | Between stagger reveal items (#10) |
| `motion.bootLine` | `5` | Between boot sequence lines (#2) |

### Ticker

| Token | Frames | Use for |
|---|---|---|
| `motion.tickerDuration` | `1200` | Live ticker full loop (#12) |

---

## Combination Rules

| Scene type | Which enhancements to use |
|---|---|
| Intro / brand reveal | #1 Typing + #2 Boot + #8 Pulse |
| Stats / metrics section | #5 Number ticker + #10 Stagger |
| Loading / async state | #11 Skeleton scan |
| Atmospheric background | #3 Scanline |
| Footer / status bar | #12 Live ticker + #8 Pulse |

**Stack limit:** Maximum 3–5 motion effects per scene. Never combine scanline (#3) + skeleton (#11).

---

## Changing the Brand

Edit only `src/brand.ts`. Every composition that imports from it reflects changes instantly.
