# d1a-editor — Claude Instructions

This repo is `designcombo/react-video-editor` (Next.js video editor app with a
built-in Remotion player, timeline, and control panels) combined with the
D1AGENCY brand/design system.

## Running this project
- `pnpm install`
- `pnpm dev` — starts the Next.js editor at http://localhost:3000
- This is NOT a `npx remotion studio` project — there is no separate Remotion
  CLI workflow. Remotion runs inside the editor via `@remotion/player`.

## Design System (always read these first)
Before writing or styling any composition/element/control panel, read:
- `src/brand-docs/D1A-motion.md` — D1AGENCY brand system, motion rules, color tokens, enhancement recipes
- `src/brand-docs/D1A-motion-describe.md` — how to translate plain language motion descriptions into Remotion code
- `src/brand.ts` — live design tokens (import these, never hardcode values)

## Token rules
When adding or editing elements, control panels, or compositions, import from
`src/brand.ts`:
- Colors → `colors.*`
- Fonts → `fonts.*`
- Spacing → `spacing.*`
- Radii → `radii.*`
- Motion timing → `motion.*` (all values in frames at 30fps)

## Remotion rules (apply inside player/composition code)
- CSS transitions and CSS animations are FORBIDDEN inside Remotion
  compositions/animated items — they will not render correctly when exported.
- Use `useCurrentFrame()` + `interpolate()` for all frame-based animation.
- Always get `fps` from `useVideoConfig()` — never hardcode 30.
- Use `<Sequence from={} durationInFrames={}>` to time elements.
- Use `staticFile()` for assets in the `public/` folder.
- Use `<Img>`, `<Video>`, `<Audio>` from remotion — not plain HTML tags.
- Never make implementation decisions on your own — follow only explicit
  instructions, and confirm before large refactors.

## Known gaps / roadmap (control-item panels)
The existing control panels in `src/features/editor/control-item/common/`
already cover: transform (position/scale/rotation), opacity, blur,
brightness, flip, shadow (glow), speed. Still missing, to be added later
following the same patterns:
- `contrast` (alongside `brightness.tsx`)
- `skewX` / `skewY` (alongside `transform.tsx`)
- Copy/paste of only the "effects" group between two different elements
- Group/ungroup (linked properties across multiple selected elements)
