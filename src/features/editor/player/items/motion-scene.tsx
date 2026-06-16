import { ITrackItem } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from "remotion";
import { colors, fonts, radii } from "../../../../brand";
import {
  LayerConfig,
  LayersConfig,
  LayerTextStyleConfig,
  parseMotionSceneMeta,
  zIdxOf,
} from "./schemas/motion-scene.schema";

// Parse "Hello [world|#f00] there" → array of {text, color} spans.
// Plain text segments get defaultColor. Returns [{text, color}] for uniform text.
const parseSpans = (
  raw: string,
  defaultColor: string
): { text: string; color: string }[] => {
  const regex = /\[([^\]|]+)\|([^\]]+)\]/g;
  const parts: { text: string; color: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex)
      parts.push({ text: raw.slice(lastIndex, match.index), color: defaultColor });
    parts.push({ text: match[1], color: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < raw.length)
    parts.push({ text: raw.slice(lastIndex), color: defaultColor });
  return parts.length > 0 ? parts : [{ text: raw, color: defaultColor }];
};

// ─── TIMING MAP — 150f = 5s @ 30fps ─────────────────────────────────────────
const T = {
  folderEntry: [5, 22] as const,
  lidOpen: [30, 60] as const,
  cardBase: 35,
  cardStagger: 4,
  textReveal: [60, 72] as const,
  spinStart: 90,
  spinEnd: 135,
  flipStart: 90,
  flipDuration: 25,
  flipStagger: 8,
};

// The 240×200 scene container is the coordinate space shared by folder, cards, badge.
// folder body: position absolute, bottom:0, height:158 → top = 200-158 = 42
// cards were at top:-22 inside folder body → top = 42-22 = 20 in the 240×200 space
const CARDS_TOP = 20;

const ALBUM_COLORS = [
  { bg: "linear-gradient(135deg, #8B1A1A 0%, #C41E3A 100%)" },
  { bg: "linear-gradient(135deg, #1A3A6B 0%, #2563EB 100%)" },
  { bg: "linear-gradient(135deg, #4A1D6B 0%, #7C3AED 100%)" },
];

const layerVis = (l: LayerConfig, frame: number) =>
  frame >= l.fromFrame && frame < l.fromFrame + l.durationFrames ? 1 : 0;

// ─── FOLDER CARD ─────────────────────────────────────────────────────────────
const FolderCard: React.FC<{
  index: number;
  rotateZ?: number;
  layer: LayerConfig;
  zIndex: number;
}> = ({ index, rotateZ = 0, layer, zIndex }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  const popDelay = T.cardBase + index * T.cardStagger;
  const popProgress = interpolate(frame, [popDelay, popDelay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const popScale = interpolate(popProgress, [0, 1], [0.28, 1]);
  const popY = interpolate(popProgress, [0, 1], [34, 0]);
  const popOpacity = interpolate(popProgress, [0, 0.2, 1], [0, 1, 1]);
  const breatheY =
    popProgress >= 1
      ? 2.5 * Math.sin(((frame - popDelay - 14) / 44) * Math.PI)
      : 0;

  const flipDelay = T.flipStart + index * T.flipStagger;
  const flipProgress = interpolate(
    frame,
    [flipDelay, flipDelay + T.flipDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const flipDeg = flipProgress * 180;
  const flipScaleX = Math.abs(Math.cos((flipDeg * Math.PI) / 180));
  const isMoney = flipDeg >= 90;
  const album = ALBUM_COLORS[index];

  return (
    <div
      style={{
        position: "relative",
        zIndex,
        opacity: popOpacity * vis,
        transform: `translateX(${layer.x}px) translateY(${popY + breatheY + layer.y}px) scale(${popScale * layer.scale}) rotateZ(${rotateZ + layer.rotate}deg)`,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        width: 88,
        height: 88,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scaleX(${flipScaleX})`,
          borderRadius: radii.lg,
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {!isMoney ? (
          <div
            style={{
              width: "100%", height: "100%", background: album.bg,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: radii.full, background: "rgba(0,0,0,0.35)", border: "1.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: radii.full, background: "rgba(255,255,255,0.18)" }} />
            </div>
            <div style={{ width: 50, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ width: 34, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.11)" }} />
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1E5C1E 0%, #145214 50%, #0A3B0A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(0,255,65,0.03) 0px, rgba(0,255,65,0.03) 1px, transparent 1px, transparent 8px)" }} />
            <div style={{ position: "absolute", inset: 5, border: "0.5px solid rgba(0,255,65,0.18)", borderRadius: radii.md }} />
            <span style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: fonts.weights.bold, color: "rgba(0,255,65,0.95)", textShadow: "0 0 16px rgba(0,255,65,0.5)", lineHeight: 1, position: "relative" }}>$</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 8, fontWeight: fonts.weights.medium, color: "rgba(0,255,65,0.42)", letterSpacing: "0.1em", marginTop: 2, position: "relative" }}>100</span>
            <div style={{ position: "absolute", top: 8, left: 8, width: 4, height: 4, borderRadius: radii.full, background: "rgba(0,255,65,0.22)" }} />
            <div style={{ position: "absolute", bottom: 8, right: 8, width: 4, height: 4, borderRadius: radii.full, background: "rgba(0,255,65,0.22)" }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── FOLDER LID ──────────────────────────────────────────────────────────────
const FolderLid: React.FC<{ openProgress: number }> = ({ openProgress }) => {
  const lidRotateX = interpolate(openProgress, [0, 1], [0, -44]);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", transformOrigin: "bottom center", transform: `perspective(700px) rotateX(${lidRotateX}deg)` }}>
      <div style={{ position: "absolute", top: -20, left: 18, width: 72, height: 24, borderRadius: "8px 8px 0 0", background: "rgba(0,190,60,0.65)", border: "1.5px solid rgba(0,255,65,0.28)", borderBottom: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />
      <div style={{ width: "100%", height: 68, borderRadius: "14px 14px 0 0", background: "linear-gradient(180deg, rgba(0,215,68,0.82) 0%, rgba(0,168,54,0.72) 100%)", border: "1.5px solid rgba(0,255,65,0.38)", borderBottom: "none", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.18)" }} />
    </div>
  );
};

// ─── SCENE BADGE ─────────────────────────────────────────────────────────────
// Positioned within the badge-wrapper 240×200 div (same coordinate space as original).
const SceneBadge: React.FC<{ layer: LayerConfig; frame: number }> = ({ layer, frame }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 10 + layer.y,
        left: 12 + layer.x,
        display: "flex",
        alignItems: "center",
        gap: 5,
        opacity: vis,
        transform: `scale(${layer.scale}) rotate(${layer.rotate}deg)`,
        transformOrigin: "bottom left",
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: radii.full, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 8, height: 1.5, background: colors.background, borderRadius: 1, boxShadow: `0 -2.5px 0 ${colors.background}, 0 2.5px 0 ${colors.background}` }} />
      </div>
      <span style={{ fontFamily: fonts.mono, fontSize: 8, fontWeight: fonts.weights.medium, color: "rgba(0,255,65,0.6)", letterSpacing: "0.08em" }}>motion</span>
    </div>
  );
};

// ─── ARROW ICON ──────────────────────────────────────────────────────────────
const ArrowIcon: React.FC<{ frame: number; layer: LayerConfig }> = ({ frame, layer }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const entryOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spinOpacity = interpolate(frame, [86, 90, 135, 141], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = 4 * Math.sin((frame / 44) * Math.PI);
  return (
    <div style={{ position: "absolute", bottom: -52, right: -28, opacity: entryOpacity * spinOpacity * vis, transform: `translateY(${floatY}px)` }}>
      <div style={{ width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderBottom: `24px solid ${colors.primary}`, filter: "drop-shadow(0 0 10px rgba(0,255,65,0.55))", transform: "rotate(18deg)" }} />
    </div>
  );
};

// ─── TEXT LAYERS — fully independent siblings ─────────────────────────────────
// Each has its own LayerConfig (x/y/scale/rotate/timing). NOT nested together.
// baseTop: vertical anchor within the 240×200 scene-root coordinate space.

const makeTextReveal = (frame: number) => ({
  opacity: interpolate(frame, T.textReveal, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  animY:   interpolate(frame, T.textReveal, [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
  blur:    interpolate(frame, [T.textReveal[0], T.textReveal[0] + 18], [7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
});

const SceneHeadline: React.FC<{
  text: string;
  layer: LayerConfig;
  zIndex: number;
  ts: LayerTextStyleConfig;
}> = ({ text, layer, zIndex, ts }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const { opacity: animOpacity, animY, blur } = makeTextReveal(frame);
  const hasMaxWidth = ts.maxWidth > 0;
  const spans = parseSpans(text, ts.color);
  return (
    <div style={{
      position: "absolute",
      top: -110 + layer.y,
      left: "50%",
      zIndex,
      opacity: animOpacity * vis,
      // animBlur: reveal animation blur. layer.blur: user-set per-layer blur (additive)
      filter: `blur(${blur + layer.blur}px) brightness(${layer.brightness}%)`,
      transform: `translateX(calc(-50% + ${layer.x}px)) translateY(${animY}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      textAlign: ts.textAlign,
      whiteSpace: hasMaxWidth ? "normal" : "nowrap",
      maxWidth: hasMaxWidth ? ts.maxWidth : undefined,
      wordBreak: hasMaxWidth ? "break-word" : undefined,
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: fonts.heading,
        fontSize: 30,
        fontWeight: ts.bold ? 900 : fonts.weights.heavy,
        letterSpacing: "-0.025em",
        lineHeight: 1,
        textDecoration: ts.underline ? "underline" : "none",
        textTransform: ts.textTransform as React.CSSProperties["textTransform"],
        WebkitTextStroke: ts.strokeWidth > 0 ? `${ts.strokeWidth}px ${ts.strokeColor}` : undefined,
      }}>
        {spans.map((s, i) => <span key={i} style={{ color: s.color }}>{s.text}</span>)}
      </div>
    </div>
  );
};

const SceneSubline: React.FC<{
  text: string;
  layer: LayerConfig;
  zIndex: number;
  ts: LayerTextStyleConfig;
}> = ({ text, layer, zIndex, ts }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const { opacity: animOpacity, animY, blur } = makeTextReveal(frame);
  const hasMaxWidth = ts.maxWidth > 0;
  const spans = parseSpans(text, ts.color);
  return (
    <div style={{
      position: "absolute",
      top: -75 + layer.y,
      left: "50%",
      zIndex,
      opacity: animOpacity * vis,
      filter: `blur(${blur + layer.blur}px) brightness(${layer.brightness}%)`,
      transform: `translateX(calc(-50% + ${layer.x}px)) translateY(${animY}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      textAlign: ts.textAlign,
      whiteSpace: hasMaxWidth ? "normal" : "nowrap",
      maxWidth: hasMaxWidth ? ts.maxWidth : undefined,
      wordBreak: hasMaxWidth ? "break-word" : undefined,
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 11,
        fontWeight: fonts.weights.regular,
        letterSpacing: "0.05em",
        textTransform: ts.textTransform as React.CSSProperties["textTransform"],
      }}>
        {spans.map((s, i) => <span key={i} style={{ color: s.color }}>{s.text}</span>)}
      </div>
    </div>
  );
};

// ─── BACKGROUND GLOW ─────────────────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number; layer: LayerConfig }> = ({ frame, layer }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const breathe = 0.15 + 0.04 * Math.sin((frame / 58) * Math.PI);
  const spinBoost = interpolate(frame, [90, 112, 135], [0, 0.1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 58% 52% at 50% 52%, rgba(0,185,55,${breathe + spinBoost}) 0%, rgba(0,70,18,0.06) 55%, transparent 78%)`,
        opacity: vis,
        transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        zIndex: 0,
      }}
    />
  );
};

// ─── ROOT SCENE ───────────────────────────────────────────────────────────────
// Architecture: all orderable layers are siblings inside a 240×200 scene-root div.
//
//  scene-root (240×200, position:relative)
//  ├── folder-wrapper   — folder body + lid only. Applies folder layer's own x/y/scale/rotate.
//  ├── cards-wrapper    — same spin as folder but NOT folder's scale/x/y. Cards independent.
//  ├── badge-wrapper    — same spin as folder. Badge/arrow layer controls.
//  └── SceneText        — NO spin. Fully independent layer controls.
//
// Sibling wrappers share the same 240×200 coordinate space and transform-origin (center),
// so the spin animation looks identical to the original coupled version.

const RootScene: React.FC<{
  headline: string;
  subline: string;
  layers: LayersConfig;
  zOrder: string[];
  textStyle: { headline: LayerTextStyleConfig; subline: LayerTextStyleConfig };
}> = ({ headline, subline, layers, zOrder, textStyle }) => {
  const frame = useCurrentFrame();

  // ── Shared animation values (computed once, used by multiple wrappers) ──────
  const entryScale = interpolate(frame, T.folderEntry, [0.85, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const entryOpacity = interpolate(frame, [T.folderEntry[0], T.folderEntry[0] + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const openProgress = interpolate(frame, T.lidOpen, [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const tiltX = interpolate(openProgress, [0, 1], [2, -12]);
  const spinDeg = interpolate(frame, [T.spinStart, T.spinEnd], [0, 360], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
  });
  const postSpin = Math.max(0, frame - T.spinEnd);
  const breatheScale = 1 + 0.012 * Math.sin((postSpin / 48) * Math.PI);

  // Base spin shared by folder body, cards wrapper, badge wrapper.
  // Each wrapper is 240×200 with the same transform-origin (center), so spin aligns perfectly.
  const baseSpin = `scale(${entryScale * breatheScale}) perspective(900px) rotateY(${spinDeg}deg) rotateX(${tiltX}deg)`;

  const fl = layers.folder;
  const folderVis = layerVis(fl, frame) * (fl.opacity / 100);

  // Full-size wrapper style (shared base for all three spinning wrappers)
  const wrapperBase: React.CSSProperties = {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    transformStyle: "preserve-3d",
  };

  return (
    <AbsoluteFill
      style={{
        background: colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BackgroundGlow frame={frame} layer={layers.background} />

      {/* ── scene-root: 240×200, coordinate space for all orderable layers ── */}
      <div style={{ position: "relative", width: 240, height: 200 }}>

        {/* ── FOLDER wrapper: body + lid.
            folder.x/y/scale/rotate are user overrides on top of the base animation.
            This wrapper ONLY contains folder visuals — nothing else. ── */}
        <div
          style={{
            ...wrapperBase,
            opacity: entryOpacity * folderVis,
            transform: `translate(${fl.x}px, ${fl.y}px) scale(${entryScale * breatheScale * fl.scale}) perspective(900px) rotateY(${spinDeg}deg) rotateX(${tiltX}deg) rotate(${fl.rotate}deg)`,
            zIndex: zIdxOf("folder", zOrder),
          }}
        >
          {/* filter-wrapper: isolates blur/brightness from the 3D spin transform */}
          <div style={{ position: "absolute", inset: 0, filter: `blur(${fl.blur}px) brightness(${fl.brightness}%)` }}>
            {/* folder body */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0,
                width: "100%", height: 158,
                borderRadius: "0 0 16px 16px",
                background: "linear-gradient(180deg, rgba(0,188,60,0.78) 0%, rgba(0,148,46,0.68) 55%, rgba(0,102,33,0.73) 100%)",
                border: "1.5px solid rgba(0,255,65,0.32)",
                borderTop: "none",
                boxShadow: "0 18px 55px rgba(0,0,0,0.52), inset 0 -2px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.09)",
              }}
            />
            {/* folder lid */}
            <div style={{ position: "absolute", top: 28, left: 0, width: "100%" }}>
              <FolderLid openProgress={openProgress} />
            </div>
          </div>
        </div>

        {/* ── CARDS wrapper: same base spin as folder, but NOT folder's x/y/scale/rotate.
            Each card controls its own layer independently. ── */}
        {openProgress > 0 && (
          <div
            style={{
              ...wrapperBase,
              opacity: entryOpacity,
              transform: baseSpin, // ← no folder layer overrides here
            }}
          >
            <div
              style={{
                position: "absolute",
                top: CARDS_TOP,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              <FolderCard index={0} rotateZ={-9} layer={layers.card1} zIndex={zIdxOf("card1", zOrder)} />
              <FolderCard index={1} rotateZ={1}  layer={layers.card2} zIndex={zIdxOf("card2", zOrder)} />
              <FolderCard index={2} rotateZ={8}  layer={layers.card3} zIndex={zIdxOf("card3", zOrder)} />
            </div>
          </div>
        )}

        {/* ── BADGE wrapper: same base spin as folder, badge layer controls. ── */}
        <div
          style={{
            ...wrapperBase,
            opacity: entryOpacity,
            transform: baseSpin,
            zIndex: zIdxOf("badge", zOrder),
          }}
        >
          {/* filter-wrapper groups SceneBadge + ArrowIcon under one badge-layer filter */}
          <div style={{ position: "absolute", inset: 0, filter: `blur(${layers.badge.blur}px) brightness(${layers.badge.brightness}%)` }}>
            <SceneBadge layer={layers.badge} frame={frame} />
            <ArrowIcon frame={frame} layer={layers.badge} />
          </div>
        </div>

        {/* ── HEADLINE + SUBLINE: independent siblings, no spin. ── */}
        <SceneHeadline
          text={headline}
          layer={layers.headline}
          zIndex={zIdxOf("headline", zOrder)}
          ts={textStyle.headline}
        />
        <SceneSubline
          text={subline}
          layer={layers.subline}
          zIndex={zIdxOf("subline", zOrder)}
          ts={textStyle.subline}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── SEQUENCE ITEM EXPORT ─────────────────────────────────────────────────────
// RENAME: Replace "MotionScene" with your project name when using as a template.
export default function MotionScene({
  item,
  options,
}: {
  item: ITrackItem;
  options: SequenceItemOptions;
}) {
  const { headline, subline, layers, zOrder, textStyle } = parseMotionSceneMeta(item.metadata);
  return BaseSequence({
    item,
    options,
    children: (
      <RootScene headline={headline} subline={subline} layers={layers} zOrder={zOrder} textStyle={textStyle} />
    ),
  });
}
