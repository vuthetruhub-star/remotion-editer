# D1A Motion — How to Describe Motion for Remotion

> Use this file when you want Claude to suggest or build a motion scene.
> Tell Claude what you want in plain language — Claude will translate it into Remotion code using `brand.ts` tokens.

---

## How to describe a scene to Claude

You don't need to write code. Just describe:

1. **What appears** — text, card, number, logo, background
2. **When it appears** — at the start, after X seconds, after another element
3. **How it moves** — fades in, slides up, types out, counts up, pulses
4. **How it feels** — snappy, cinematic, soft, bouncy, instant

Claude will pick the right enhancement from D1A-motion.md and write the Remotion code.

---

## Plain language → Remotion translation

| You say | Claude builds |
|---|---|
| "fade in slowly" | `interpolate` opacity 0→1, ease-in-out, ~18 frames |
| "slide up from below" | `interpolate` translateY 32→0, ease-out, ~6 frames |
| "snap into place" | `interpolate` with `Easing.bezier(0.5, 0, 0.1, 1)`, ~4 frames |
| "cinematic entrance" | opacity + scale 0.95→1 + translateY, ~18 frames |
| "type out letter by letter" | Enhancement #1 — TypingReveal, 1 frame/char |
| "boot sequence / terminal intro" | Enhancement #2 — BootSequence, 5 frame stagger |
| "count up to a number" | Enhancement #5 — NumberTicker, 36 frames ease-out-cubic |
| "glowing dot, breathing" | Enhancement #8 — StatusPulse, 60 frame loop |
| "cards appear one by one" | Enhancement #10 — StaggerReveal, 2 frame stagger |
| "scrolling status bar" | Enhancement #12 — LiveTicker, continuous scroll |
| "scene fades into next" | `TransitionSeries` + `fade()`, 15 frame transition |
| "scene slides to next" | `TransitionSeries` + `slide({ direction: 'from-left' })` |

---

## Motion feel guide

Use these words when describing how something should feel:

| Word | What it means in Remotion |
|---|---|
| **snappy** | `Easing.bezier(0.5, 0, 0.1, 1)`, short duration (~4f) |
| **smooth** | `Easing.bezier(0.16, 1, 0.3, 1)`, medium duration (~12f) |
| **cinematic** | `Easing.bezier(0.45, 0, 0.55, 1)`, long duration (~18–30f) |
| **instant** | 1–2 frames, no easing needed |
| **weighted / premium** | `spring({ damping: 200, stiffness: 100 })` |
| **bouncy** | `Easing.bezier(0.34, 1.56, 0.64, 1)` — use sparingly |
| **terminal / mechanical** | Typing reveal or step-based, mono font |

---

## Timing vocabulary

| You say | Frames | Real time at 30fps |
|---|---|---|
| "instant" | 1–2f | ~33–67ms |
| "quick" / "snappy" | 4–6f | ~133–200ms |
| "normal" | 8–12f | ~267–400ms |
| "slow" / "cinematic" | 18–30f | ~600ms–1s |
| "very slow" / "epic" | 30–60f | 1–2s |
| "after 1 second" | `from={1 * fps}` | 1s |
| "after 2 seconds" | `from={2 * fps}` | 2s |
| "hold for 3 seconds" | `durationInFrames={3 * fps}` | 3s |

---

## Scene structure patterns

### Pattern A — Single reveal
One element fades/slides in at the start.

```
"Show the title, fade in over 1 second"
→ opacity 0→1, frame [0, fps], ease-out
```

### Pattern B — Staggered entrance
Multiple elements appear one by one.

```
"Three cards slide up, one after another"
→ StaggerItem with index * motion.stagger delay
```

### Pattern C — Timed sequence
Elements appear at specific moments.

```
"Logo appears first, then title after 1 second, then subtitle after 2 seconds"
→ <Sequence from={0}> logo
→ <Sequence from={1 * fps}> title
→ <Sequence from={2 * fps}> subtitle
```

### Pattern D — Scene transitions
Multiple scenes cut together.

```
"Scene A fades into Scene B"
→ TransitionSeries + fade(), 15 frames

"Scene A slides left into Scene B"
→ TransitionSeries + slide({ direction: 'from-right' }), 20 frames
```

### Pattern E — Looping / always-on
Elements that animate continuously.

```
"A breathing green dot in the corner"
→ StatusPulse — loops every 60 frames

"A scrolling status bar at the bottom"
→ LiveTicker — continuous translateX
```

---

## D1AGENCY motion combinations per scene type

Tell Claude which scene type and it will apply the right combination:

| Scene type | Say this to Claude |
|---|---|
| Brand intro | "D1A brand intro scene" |
| Metrics / stats | "D1A metrics scene with [number]" |
| Hero with text | "D1A hero scene with [headline]" |
| Loading / skeleton | "D1A loading state" |
| Live dashboard | "D1A dashboard scene" |
| Terminal boot | "D1A boot sequence scene" |
| Scene transition | "D1A transition from [A] to [B]" |

---

## What to tell Claude — template

Copy and fill in:

```
Build a Remotion scene where:
- Background: [color / dark / surface]
- Main element: [text / number / logo / card]
- Motion: [how it enters — fade, slide, type, count]
- Feel: [snappy / cinematic / premium / terminal]
- Timing: [how long the scene is — e.g. 3 seconds]
- After this scene: [cuts to / fades to / nothing]
```

**Example:**
```
Build a Remotion scene where:
- Background: D1A dark background
- Main element: The text "Digital systems for bold brand growth."
- Motion: Types out letter by letter, cursor blinks at the end
- Feel: Terminal, precise
- Timing: Scene lasts 4 seconds
- After this scene: Fades into the next scene
```

---

## Remotion technical rules (always applied)

Claude always follows these — you don't need to mention them:

- No CSS transitions or CSS animations (forbidden in Remotion)
- All animation via `useCurrentFrame()` + `interpolate()`
- `fps` always from `useVideoConfig()` — never hardcoded
- `<Sequence from={} durationInFrames={}>` for timing
- Always `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'`
- Tokens from `brand.ts` — never hardcoded values
- `premountFor={fps}` on every `<Sequence>`
