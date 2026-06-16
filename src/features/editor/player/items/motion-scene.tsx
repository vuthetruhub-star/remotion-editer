import { ITrackItem } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { useCurrentFrame, interpolate, Easing, AbsoluteFill, useVideoConfig } from "remotion";
import { colors, fonts, radii, spacing, motion } from "../../../../brand";
import {
  LayerConfig,
  LayersConfig,
  LayerTextStyleConfig,
  parseMotionSceneMeta,
  zIdxOf,
} from "./schemas/motion-scene.schema";

// ─── TIMING MAP — 330f = 11s @ 30fps ────────────────────────────────────────
const T = {
  // Beat 1: Background + orb entry
  orbEntry:       [0, 30]   as const,

  // Beat 2: Line 1 — "Create AI songs with Suno"
  line1In:        [30, 48]  as const,   // fade+slide 18f
  line1Hold:      [48, 90]  as const,   // hold visible
  line1Out:       [90, 105] as const,   // fade out 15f

  // Beat 3: Orb pulse transition
  orbShift:       [90, 110] as const,   // orb moves up

  // Beat 4: Suno mockup + Line 2
  mockupIn:       [110, 140] as const,  // slide up + fade 30f
  line2In:        [120, 138] as const,  // fade+slide 18f
  line2Hold:      [138, 180] as const,
  mockupShrink:   [180, 200] as const,  // shrink + float up
  line2Out:       [180, 195] as const,  // fade out 15f

  // Beat 5: Stream counter + Line 3
  counterIn:      [200, 220] as const,  // fade in
  counterTick:    [220, 260] as const,  // tick 0→10000 over 40f
  line3In:        [205, 223] as const,  // fade+slide 18f
  line3Hold:      [223, 280] as const,
  glowPeak:       [250, 280] as const,  // glow intensifies

  // Beat 6: Hold — everything breathes
  holdStart:      280,
  holdEnd:        330,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const layerVis = (l: LayerConfig, frame: number): number =>
  frame >= l.fromFrame && frame < l.fromFrame + l.durationFrames ? 1 : 0;

const clampInterp = (
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number],
  easing?: (t: number) => number
) =>
  interpolate(frame, [...input], [...output], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// ─── GREEN ORB — CSS fake glass sphere ───────────────────────────────────────

const GreenOrb: React.FC<{ layer: LayerConfig; zIndex: number }> = ({
  layer,
  zIndex,
}) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  // Entry: fade in + scale 0.8→1
  const entryOpacity = clampInterp(frame, T.orbEntry, [0, 1]);
  const entryScale = clampInterp(frame, T.orbEntry, [0.8, 1], Easing.out(Easing.cubic));

  // Shift up when mockup appears
  const shiftY = clampInterp(frame, T.orbShift, [0, -120], Easing.out(Easing.cubic));

  // Breathing pulse (always on after entry)
  const postEntry = Math.max(0, frame - T.orbEntry[1]);
  const breathe = 1 + 0.025 * Math.sin((postEntry / motion.pulse) * Math.PI * 2);

  // Glow intensity ramp during counter reveal
  const glowBoost = clampInterp(frame, T.glowPeak, [0, 0.15]);

  // Base glow opacity
  const baseGlow = 0.18 + 0.06 * Math.sin((postEntry / 50) * Math.PI);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 220,
        height: 220,
        zIndex,
        opacity: entryOpacity * vis,
        transform: `translate(-50%, calc(-50% + ${shiftY + layer.y}px)) scale(${entryScale * breathe * layer.scale}) rotate(${layer.rotate}deg)`,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        pointerEvents: "none",
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: radii.full,
          background: `radial-gradient(circle, rgba(0,255,65,${baseGlow + glowBoost}) 0%, rgba(0,255,65,0.04) 50%, transparent 70%)`,
        }}
      />
      {/* Main sphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radii.full,
          background: `radial-gradient(ellipse 60% 55% at 40% 35%, rgba(0,255,65,0.35) 0%, rgba(0,255,65,0.12) 40%, rgba(0,80,20,0.25) 70%, rgba(0,40,10,0.4) 100%)`,
          boxShadow: `0 0 60px rgba(0,255,65,${0.12 + glowBoost}), inset 0 -20px 40px rgba(0,0,0,0.3), inset 0 4px 16px rgba(255,255,255,0.08)`,
        }}
      />
      {/* Highlight spot */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "30%",
          width: "28%",
          height: "18%",
          borderRadius: radii.full,
          background: "radial-gradient(ellipse, rgba(255,255,255,0.25) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

// ─── SUNO MOCKUP — App UI card ───────────────────────────────────────────────

const SunoMockup: React.FC<{ layer: LayerConfig; zIndex: number }> = ({
  layer,
  zIndex,
}) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  // Slide in from below + fade
  const entryOpacity = clampInterp(frame, T.mockupIn, [0, 1]);
  const entryY = clampInterp(frame, T.mockupIn, [80, 0], Easing.out(Easing.cubic));
  const entryScale = clampInterp(frame, T.mockupIn, [0.9, 1], Easing.out(Easing.cubic));

  // Shrink + float up after hold
  const shrinkScale = clampInterp(frame, T.mockupShrink, [1, 0.45], Easing.out(Easing.cubic));
  const shrinkY = clampInterp(frame, T.mockupShrink, [0, -280], Easing.out(Easing.cubic));
  const shrinkOpacity = clampInterp(frame, T.mockupShrink, [1, 0.6]);

  const isShrinking = frame >= T.mockupShrink[0];
  const currentScale = isShrinking ? shrinkScale : entryScale;
  const currentY = isShrinking ? shrinkY : entryY;
  const currentOpacity = isShrinking ? shrinkOpacity : entryOpacity;

  // Breathing pulse after entry
  const postEntry = Math.max(0, frame - T.mockupIn[1]);
  const breathe = 1 + 0.01 * Math.sin((postEntry / 48) * Math.PI);

  return (
    <div
      style={{
        position: "absolute",
        top: "48%",
        left: "50%",
        width: 240,
        zIndex,
        opacity: currentOpacity * vis,
        transform: `translate(-50%, calc(-50% + ${currentY + layer.y}px)) scale(${currentScale * breathe * layer.scale}) rotate(${layer.rotate}deg)`,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        pointerEvents: "none",
      }}
    >
      {/* Card container */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          borderRadius: radii.xl,
          padding: spacing.md,
          display: "flex",
          flexDirection: "column",
          gap: spacing.sm,
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,65,0.06)`,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
          {/* Suno icon placeholder */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.lg,
              background: `linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,180,45,0.5))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 18 }}>🎵</span>
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.heading,
                fontSize: fonts.sizes.sm,
                fontWeight: fonts.weights.semibold,
                color: colors.text.primary,
              }}
            >
              Suno AI
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fonts.sizes.xs,
                color: colors.text.muted,
              }}
            >
              AI Music Generator
            </div>
          </div>
        </div>

        {/* Song preview bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[0.85, 0.65, 0.75, 0.5, 0.9].map((w, i) => (
            <div
              key={i}
              style={{
                height: 4,
                borderRadius: 2,
                background: colors.borderSubtle,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${w * 100}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${colors.primary}, rgba(0,255,65,0.4))`,
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div
          style={{
            background: colors.primary,
            borderRadius: radii.sm,
            padding: `${spacing.xs}px ${spacing.md}px`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: fonts.sizes.xs,
              fontWeight: fonts.weights.medium,
              color: colors.background,
              letterSpacing: "0.04em",
            }}
          >
            ▶ GENERATE
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── STREAM COUNTER — Number ticker ──────────────────────────────────────────

const StreamCounter: React.FC<{ layer: LayerConfig; zIndex: number }> = ({
  layer,
  zIndex,
}) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  // Fade in
  const entryOpacity = clampInterp(frame, T.counterIn, [0, 1]);
  const entryScale = clampInterp(frame, T.counterIn, [0.95, 1], Easing.out(Easing.cubic));

  // Number tick
  const tickValue = clampInterp(frame, T.counterTick, [0, 10000], Easing.out(Easing.cubic));
  const isTicking = frame >= T.counterTick[0] && frame < T.counterTick[1];

  // Breathing
  const postEntry = Math.max(0, frame - T.counterIn[1]);
  const breathe = 1 + 0.012 * Math.sin((postEntry / 48) * Math.PI);

  return (
    <div
      style={{
        position: "absolute",
        top: "58%",
        left: "50%",
        zIndex,
        opacity: entryOpacity * vis,
        transform: `translate(-50%, -50%) scale(${entryScale * breathe * layer.scale}) rotate(${layer.rotate}deg)`,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: spacing.xs,
      }}
    >
      {/* Counter value */}
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 56,
          fontWeight: fonts.weights.bold,
          color: isTicking ? colors.primary : colors.text.primary,
          textShadow: isTicking
            ? `0 0 20px ${colors.glowSoft}, 0 0 40px rgba(0,255,65,0.15)`
            : "none",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {Math.round(tickValue).toLocaleString()}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fonts.sizes.xs,
          fontWeight: fonts.weights.regular,
          color: colors.text.muted,
          letterSpacing: "0.08em",
        }}
      >
        ▶ STREAMS
      </div>
    </div>
  );
};

// ─── SCENE TEXT — fade+slide in/out ──────────────────────────────────────────

const SceneText: React.FC<{
  text: string;
  layer: LayerConfig;
  zIndex: number;
  ts: LayerTextStyleConfig;
  entryRange: readonly [number, number];
  exitRange: readonly [number, number] | null;
  yPosition: string;
}> = ({ text, layer, zIndex, ts, entryRange, exitRange, yPosition }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  // Entry: fade + slide up
  const entryOpacity = clampInterp(frame, entryRange, [0, 1]);
  const entryY = clampInterp(frame, entryRange, [24, 0], Easing.out(Easing.cubic));

  // Exit: fade out
  const exitOpacity = exitRange
    ? clampInterp(frame, exitRange, [1, 0])
    : 1;

  const hasMaxWidth = ts.maxWidth > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        left: "50%",
        zIndex,
        opacity: entryOpacity * exitOpacity * vis,
        transform: `translateX(calc(-50% + ${layer.x}px)) translateY(${entryY + layer.y}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
        textAlign: ts.textAlign,
        whiteSpace: hasMaxWidth ? "normal" : "nowrap",
        maxWidth: hasMaxWidth ? ts.maxWidth : 900,
        wordBreak: hasMaxWidth ? "break-word" : undefined,
        filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 38,
          fontWeight: ts.bold ? fonts.weights.heavy : fonts.weights.bold,
          color: ts.color,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          textDecoration: ts.underline ? "underline" : "none",
          textTransform: ts.textTransform as React.CSSProperties["textTransform"],
          WebkitTextStroke:
            ts.strokeWidth > 0
              ? `${ts.strokeWidth}px ${ts.strokeColor}`
              : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── BACKGROUND GLOW ─────────────────────────────────────────────────────────

const BackgroundGlow: React.FC<{ layer: LayerConfig }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);

  // Slow breathing
  const breathe = 0.12 + 0.05 * Math.sin((frame / 70) * Math.PI);

  // Glow peak during counter
  const glowBoost = clampInterp(frame, T.glowPeak, [0, 0.08]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 45%, rgba(0,255,65,${breathe + glowBoost}) 0%, rgba(0,60,15,0.06) 50%, transparent 75%)`,
        opacity: vis,
        zIndex: 0,
      }}
    />
  );
};

// ─── ROOT SCENE ──────────────────────────────────────────────────────────────

const RootScene: React.FC<{
  line1: string;
  line2: string;
  line3: string;
  layers: LayersConfig;
  zOrder: string[];
  textStyle: {
    line1: LayerTextStyleConfig;
    line2: LayerTextStyleConfig;
    line3: LayerTextStyleConfig;
  };
}> = ({ line1, line2, line3, layers, zOrder, textStyle }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      {/* Background glow — always on */}
      <BackgroundGlow layer={layers.background} />

      {/* Green orb — center, shifts up */}
      <GreenOrb
        layer={layers.greenOrb}
        zIndex={zIdxOf("greenOrb", zOrder)}
      />

      {/* Line 1: "Create AI songs with Suno" — beat 2 */}
      <SceneText
        text={line1}
        layer={layers.line1}
        zIndex={zIdxOf("line1", zOrder)}
        ts={textStyle.line1}
        entryRange={T.line1In}
        exitRange={T.line1Out}
        yPosition="62%"
      />

      {/* Suno mockup — beat 4 */}
      <SunoMockup
        layer={layers.sunoMockup}
        zIndex={zIdxOf("sunoMockup", zOrder)}
      />

      {/* Line 2: "Register as artist on Spotify" — beat 4 */}
      <SceneText
        text={line2}
        layer={layers.line2}
        zIndex={zIdxOf("line2", zOrder)}
        ts={textStyle.line2}
        entryRange={T.line2In}
        exitRange={T.line2Out}
        yPosition="28%"
      />

      {/* Stream counter — beat 5 */}
      <StreamCounter
        layer={layers.streamCounter}
        zIndex={zIdxOf("streamCounter", zOrder)}
      />

      {/* Line 3: "Get streams. Get paid." — beat 5 */}
      <SceneText
        text={line3}
        layer={layers.line3}
        zIndex={zIdxOf("line3", zOrder)}
        ts={textStyle.line3}
        entryRange={T.line3In}
        exitRange={null}
        yPosition="72%"
      />
    </AbsoluteFill>
  );
};

// ─── SEQUENCE ITEM EXPORT ────────────────────────────────────────────────────

export default function MotionScene({
  item,
  options,
}: {
  item: ITrackItem;
  options: SequenceItemOptions;
}) {
  const { line1, line2, line3, layers, zOrder, textStyle } =
    parseMotionSceneMeta(item.metadata);
  return BaseSequence({
    item,
    options,
    children: (
      <RootScene
        line1={line1}
        line2={line2}
        line3={line3}
        layers={layers}
        zOrder={zOrder}
        textStyle={textStyle as any}
      />
    ),
  });
}
