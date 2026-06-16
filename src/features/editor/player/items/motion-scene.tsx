import { ITrackItem } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { useCurrentFrame, interpolate, Easing, AbsoluteFill, useVideoConfig } from "remotion";
import { colors, fonts, radii, motion as M } from "../../../../brand";
import {
  LayerConfig,
  LayerTextStyleConfig,
  parseMotionSceneMeta,
  zIdxOf,
} from "./schemas/motion-scene.schema";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const layerVis = (l: LayerConfig, frame: number) =>
  frame >= l.fromFrame && frame < l.fromFrame + l.durationFrames ? 1 : 0;

const easeOut = Easing.bezier(...M.easeOut);
const easeInOut = Easing.bezier(...M.easeInOut);

const ci = (frame: number, from: number, to: number, a: number, b: number, easing = easeOut) =>
  interpolate(frame, [from, to], [a, b], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// Parse "Hello [world|#f00] there" → [{text, color}]
const parseSpans = (raw: string, defaultColor: string) => {
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

// ─── TIMING ──────────────────────────────────────────────────────────────────
const T = {
  bgFade:      [0,  18] as const,
  orbEntry:    [4,  26] as const,
  sunoEntry:   [14, 36] as const,
  counterEntry:[22, 44] as const,
  line1Entry:  [34, 50] as const,
  line2Entry:  [40, 56] as const,
  line3Entry:  [48, 64] as const,
};

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
const SceneBackground: React.FC<{ frame: number; layer: LayerConfig }> = ({ frame, layer }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const fade = ci(frame, ...T.bgFade, 0, 1);
  const breathe = 0.12 + 0.03 * Math.sin((frame / 60) * Math.PI);
  return (
    <AbsoluteFill
      style={{
        background: colors.background,
        opacity: fade * vis,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        zIndex: 0,
      }}
    >
      {/* ambient glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 60% 45% at 50% 55%, rgba(0,185,55,${breathe}) 0%, transparent 70%)`,
      }} />
    </AbsoluteFill>
  );
};

// ─── GREEN ORB ───────────────────────────────────────────────────────────────
const GreenOrb: React.FC<{ frame: number; layer: LayerConfig; zIndex: number }> = ({ frame, layer, zIndex }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const scale = ci(frame, ...T.orbEntry, 0, 1, easeOut);
  const opacity = ci(frame, T.orbEntry[0], T.orbEntry[0] + 10, 0, 1);
  const floatY = 5 * Math.sin((frame / 50) * Math.PI);
  const pulse = 0.85 + 0.15 * Math.sin((frame / 38) * Math.PI);

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      zIndex,
      opacity: opacity * vis,
      transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${floatY + layer.y - 60}px)) scale(${scale * layer.scale}) rotate(${layer.rotate}deg)`,
      filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
    }}>
      {/* outer glow ring */}
      <div style={{
        position: "absolute",
        inset: -24,
        borderRadius: radii.full,
        background: `radial-gradient(circle, rgba(0,255,65,${0.18 * pulse}) 0%, transparent 70%)`,
      }} />
      {/* orb body */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: radii.full,
        background: `radial-gradient(circle at 38% 35%, rgba(0,255,100,0.95) 0%, rgba(0,200,60,0.85) 45%, rgba(0,120,35,0.7) 100%)`,
        boxShadow: `0 0 32px rgba(0,255,65,0.55), 0 0 64px rgba(0,255,65,0.22), inset 0 2px 4px rgba(255,255,255,0.25)`,
        transform: `scale(${pulse})`,
      }} />
    </div>
  );
};

// ─── SUNO MOCKUP ─────────────────────────────────────────────────────────────
const SunoMockup: React.FC<{ frame: number; layer: LayerConfig; zIndex: number }> = ({ frame, layer, zIndex }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const slideY = ci(frame, ...T.sunoEntry, 28, 0, easeOut);
  const opacity = ci(frame, T.sunoEntry[0], T.sunoEntry[0] + 12, 0, 1);

  const bars = [0.4, 0.75, 0.55, 0.9, 0.65, 0.8, 0.5, 0.7, 0.85, 0.6];
  const barAnim = bars.map((h, i) =>
    h * (0.7 + 0.3 * Math.sin(((frame - i * 4) / 28) * Math.PI))
  );

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      zIndex,
      opacity: opacity * vis,
      transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${slideY + layer.y + 30}px)) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
    }}>
      {/* phone frame */}
      <div style={{
        width: 130,
        height: 86,
        borderRadius: radii.xl,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,65,0.08)`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflow: "hidden",
      }}>
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: radii.sm, background: colors.primary, opacity: 0.9 }} />
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.text.primary, fontWeight: fonts.weights.semibold, letterSpacing: "0.04em" }}>SUNO</div>
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.text.muted }}>AI</div>
        </div>
        {/* waveform */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, paddingLeft: 2 }}>
          {barAnim.map((h, i) => (
            <div key={i} style={{
              width: 6,
              height: `${h * 100}%`,
              borderRadius: 2,
              background: i % 3 === 0
                ? colors.primary
                : i % 3 === 1
                ? `rgba(0,255,65,0.5)`
                : `rgba(0,255,65,0.25)`,
            }} />
          ))}
        </div>
        {/* song label */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: radii.full, background: colors.primary }} />
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.text.secondary, letterSpacing: "0.06em" }}>generating...</div>
        </div>
      </div>
    </div>
  );
};

// ─── STREAM COUNTER ───────────────────────────────────────────────────────────
const StreamCounter: React.FC<{ frame: number; layer: LayerConfig; zIndex: number }> = ({ frame, layer, zIndex }) => {
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const slideX = ci(frame, ...T.counterEntry, 20, 0, easeOut);
  const opacity = ci(frame, T.counterEntry[0], T.counterEntry[0] + 12, 0, 1);

  // Counting up animation
  const countProgress = ci(frame, T.counterEntry[0], T.counterEntry[0] + 40, 0, 1, easeInOut);
  const streams = Math.floor(countProgress * 1247893);
  const formatted = streams.toLocaleString("en-US");

  return (
    <div style={{
      position: "absolute",
      bottom: "50%",
      right: "50%",
      zIndex,
      opacity: opacity * vis,
      transform: `translate(calc(50% + ${slideX + layer.x + 80}px), calc(50% + ${layer.y + 20}px)) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
    }}>
      <div style={{
        padding: "8px 12px",
        borderRadius: radii.lg,
        background: colors.surfaceAlt,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,65,0.06)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
      }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.text.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Monthly Streams</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: fonts.weights.bold, color: colors.primary, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {formatted}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 4, height: 4, borderRadius: radii.full, background: colors.primary, boxShadow: `0 0 6px ${colors.primary}` }} />
          <div style={{ fontFamily: fonts.mono, fontSize: 6, color: "rgba(0,255,65,0.6)", letterSpacing: "0.06em" }}>LIVE</div>
        </div>
      </div>
    </div>
  );
};

// ─── TEXT LINE ───────────────────────────────────────────────────────────────
const TextLine: React.FC<{
  text: string;
  layer: LayerConfig;
  zIndex: number;
  ts: LayerTextStyleConfig;
  entryRange: readonly [number, number];
  baseTop: number;
}> = ({ text, layer, zIndex, ts, entryRange, baseTop }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const opacity = ci(frame, entryRange[0], entryRange[1], 0, 1);
  const slideY = ci(frame, entryRange[0], entryRange[1], 12, 0, easeOut);
  const blur = ci(frame, entryRange[0], entryRange[0] + 12, 6, 0);
  const hasMaxWidth = ts.maxWidth > 0;
  const spans = parseSpans(text, ts.color);

  return (
    <div style={{
      position: "absolute",
      top: baseTop + layer.y,
      left: "50%",
      zIndex,
      opacity: opacity * vis,
      filter: `blur(${blur + layer.blur}px) brightness(${layer.brightness}%)`,
      transform: `translateX(calc(-50% + ${layer.x}px)) translateY(${slideY}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      textAlign: ts.textAlign,
      whiteSpace: hasMaxWidth ? "normal" : "nowrap",
      maxWidth: hasMaxWidth ? ts.maxWidth : undefined,
      wordBreak: hasMaxWidth ? "break-word" : undefined,
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 13,
        fontWeight: ts.bold ? fonts.weights.bold : fonts.weights.medium,
        letterSpacing: "0.04em",
        lineHeight: 1.3,
        textDecoration: ts.underline ? "underline" : "none",
        textTransform: ts.textTransform as React.CSSProperties["textTransform"],
        WebkitTextStroke: ts.strokeWidth > 0 ? `${ts.strokeWidth}px ${ts.strokeColor}` : undefined,
      }}>
        {spans.map((s, i) => <span key={i} style={{ color: s.color }}>{s.text}</span>)}
      </div>
    </div>
  );
};

// ─── ROOT SCENE ───────────────────────────────────────────────────────────────
const RootScene: React.FC<{
  line1: string;
  line2: string;
  line3: string;
  layers: Record<string, LayerConfig>;
  zOrder: string[];
  textStyle: Record<string, LayerTextStyleConfig>;
}> = ({ line1, line2, line3, layers, zOrder, textStyle }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const bg   = layers.background    ?? { x:0, y:0, scale:1, rotate:0, opacity:100, fromFrame:0, durationFrames:330, blur:0, brightness:100 };
  const orb  = layers.greenOrb      ?? { ...bg };
  const suno = layers.sunoMockup    ?? { ...bg };
  const ctr  = layers.streamCounter ?? { ...bg };
  const l1   = layers.line1         ?? { ...bg };
  const l2   = layers.line2         ?? { ...bg };
  const l3   = layers.line3         ?? { ...bg };

  const ts1 = textStyle.line1 ?? { bold: false, underline: false, textTransform: "none", color: colors.text.primary, textAlign: "center", strokeWidth: 0, strokeColor: "#000", maxWidth: 0 };
  const ts2 = textStyle.line2 ?? ts1;
  const ts3 = textStyle.line3 ?? ts1;

  const centerY = height / 2;
  const centerX = width / 2;

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <SceneBackground frame={frame} layer={bg} />

      <GreenOrb       frame={frame} layer={orb}  zIndex={zIdxOf("greenOrb",      zOrder)} />
      <SunoMockup     frame={frame} layer={suno} zIndex={zIdxOf("sunoMockup",     zOrder)} />
      <StreamCounter  frame={frame} layer={ctr}  zIndex={zIdxOf("streamCounter",  zOrder)} />

      <TextLine text={line1} layer={l1} zIndex={zIdxOf("line1", zOrder)} ts={ts1} entryRange={T.line1Entry} baseTop={centerY - 30} />
      <TextLine text={line2} layer={l2} zIndex={zIdxOf("line2", zOrder)} ts={ts2} entryRange={T.line2Entry} baseTop={centerY - 12} />
      <TextLine text={line3} layer={l3} zIndex={zIdxOf("line3", zOrder)} ts={ts3} entryRange={T.line3Entry} baseTop={centerY + 8} />
    </AbsoluteFill>
  );
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────
export default function MotionScene({
  item,
  options,
}: {
  item: ITrackItem;
  options: SequenceItemOptions;
}) {
  const meta = parseMotionSceneMeta(item.metadata);
  const { layers, zOrder, textStyle } = meta;

  const line1 = (meta as unknown as Record<string, string>).line1 ?? "";
  const line2 = (meta as unknown as Record<string, string>).line2 ?? "";
  const line3 = (meta as unknown as Record<string, string>).line3 ?? "";

  return BaseSequence({
    item,
    options,
    children: (
      <RootScene
        line1={line1}
        line2={line2}
        line3={line3}
        layers={layers as unknown as Record<string, LayerConfig>}
        zOrder={zOrder}
        textStyle={textStyle as unknown as Record<string, LayerTextStyleConfig>}
      />
    ),
  });
}
