"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ITrackItem } from "@designcombo/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import {
  MotionSceneSchema,
  MotionSceneMeta,
  LayerConfig,
  LayerTextStyleConfig,
  LayerKey,
  OrderableKey,
  LAYER_KEYS,
  TEXT_LAYER_KEYS,
  LAYER_LABELS,
  DEFAULT_LAYER,
  DEFAULT_LAYER_TEXT_STYLE,
  isTextLayerKey,
  parseMotionSceneMeta,
} from "../player/items/schemas/motion-scene.schema";

// ─── helpers ─────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Number input that allows backspace/empty while editing, dispatches only on blur or Enter.

// Slider + number input box side by side (commits on blur/Enter, backspace works freely).
const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, unit = "" }) => {
  // `editing` is non-null only while the user types in the number box.
  const [editing, setEditing] = useState<string | null>(null);

  const fmt = (v: number) => Number.isInteger(step) ? String(Math.round(v)) : v.toFixed(2);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(clamp(n, min, max));
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        {/* number box — shows live prop when not editing */}
        <div className="relative w-16 shrink-0">
          <Input
            type="number"
            className="h-7 text-xs pr-5"
            value={editing ?? fmt(value)}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setEditing(e.target.value)}
            onFocus={() => setEditing(fmt(value))}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(editing ?? fmt(value)); }}
          />
          {unit && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>
        {/* slider — always controlled by live prop */}
        <input
          type="range"
          className="flex-1 h-1.5 accent-white cursor-pointer"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

// Two-column layout for X/Y position inputs — each axis gets a slider + box.
const XYFields: React.FC<{
  x: number;
  y: number;
  onX: (v: number) => void;
  onY: (v: number) => void;
}> = ({ x, y, onX, onY }) => (
  <div className="flex flex-col gap-1">
    <Label className="text-xs font-semibold">Position</Label>
    <SliderField label="X" value={x} onChange={onX} min={-1080} max={2160} step={1} unit="px" />
    <SliderField label="Y" value={y} onChange={onY} min={-1920} max={3840} step={1} unit="px" />
  </div>
);

// ─── LAYER INSPECTOR ─────────────────────────────────────────────────────────

const LayerInspector: React.FC<{
  layerKey: LayerKey;
  layer: LayerConfig;
  onUpdate: (field: keyof LayerConfig, value: number) => void;
}> = ({ layer, onUpdate }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Timing</Label>
      <SliderField label="From" value={layer.fromFrame} min={0} max={149} step={1} unit="f" onChange={(v) => onUpdate("fromFrame", v)} />
      <SliderField label="Duration" value={layer.durationFrames} min={1} max={150} step={1} unit="f" onChange={(v) => onUpdate("durationFrames", v)} />
    </div>

    <XYFields x={layer.x} y={layer.y} onX={(v) => onUpdate("x", v)} onY={(v) => onUpdate("y", v)} />

    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Transform</Label>
      <SliderField label="Scale"  value={layer.scale}  min={0.1} max={5}   step={0.05} unit="×" onChange={(v) => onUpdate("scale",  v)} />
      <SliderField label="Rotate" value={layer.rotate} min={0}   max={360} step={1}    unit="°" onChange={(v) => onUpdate("rotate", v)} />
    </div>

    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Appearance</Label>
      <SliderField label="Opacity"    value={layer.opacity}    min={0}   max={100} step={1}   unit="%" onChange={(v) => onUpdate("opacity",    v)} />
      <SliderField label="Blur"       value={layer.blur}       min={0}   max={20}  step={0.5} unit="px" onChange={(v) => onUpdate("blur",       v)} />
      <SliderField label="Brightness" value={layer.brightness} min={0}   max={200} step={1}   unit="%" onChange={(v) => onUpdate("brightness", v)} />
    </div>
  </div>
);

// ─── DELTA SLIDER FIELD ───────────────────────────────────────────────────────
// Uncontrolled range input: browser owns the thumb position during drag.
// Display label synced via state; thumb reset to 0 via ref on pointer-up.

const DeltaSliderField: React.FC<{
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onPointerDown: () => void;
  onChange: (delta: number) => void;
  onPointerUp: () => void;
}> = ({ label, min, max, step = 1, unit = "", onPointerDown, onChange, onPointerUp }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Use a DOM ref for the display span — direct mutation bypasses React's
  // batching so the number always reflects the drag value even if a parent
  // re-render from dispatch() races with our setState.
  const displayRef = useRef<HTMLSpanElement>(null);

  const fmt = (v: number) => {
    const s = step < 1 ? v.toFixed(2) : String(Math.round(v));
    return v >= 0 ? `+${s}` : s;
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <span
          ref={displayRef}
          className="w-12 text-[10px] font-mono text-right text-muted-foreground tabular-nums shrink-0"
        >
          {fmt(0)}
        </span>
        <input
          ref={inputRef}
          type="range"
          className="flex-1 h-1.5 accent-white cursor-pointer"
          min={min} max={max} step={step}
          defaultValue={0}
          onPointerDown={onPointerDown}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (displayRef.current) displayRef.current.textContent = fmt(v);
            onChange(v);
          }}
          onPointerUp={() => {
            if (inputRef.current) inputRef.current.value = "0";
            if (displayRef.current) displayRef.current.textContent = fmt(0);
            onPointerUp();
          }}
        />
        {unit && <span className="text-[9px] text-muted-foreground/60 w-4 shrink-0">{unit}</span>}
      </div>
    </div>
  );
};

// ─── GROUP INSPECTOR ──────────────────────────────────────────────────────────

const GroupInspector: React.FC<{
  selectedKeys: LayerKey[];
  layers: MotionSceneMeta["layers"];
  onCaptureSnapshot: () => void;
  onDelta: (field: "x" | "y" | "scale" | "rotate", delta: number) => void;
  onRelease: () => void;
  onAbsolute: (field: "opacity" | "blur" | "brightness", value: number) => void;
}> = ({ selectedKeys, layers, onCaptureSnapshot, onDelta, onRelease, onAbsolute }) => {
  const avg = (field: "opacity" | "blur" | "brightness") =>
    Math.round(selectedKeys.reduce((s, k) => s + (layers[k]?.[field] ?? DEFAULT_LAYER[field]), 0) / selectedKeys.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md bg-green-500/8 border border-green-500/20 px-3 py-1.5 text-center">
        <span className="text-[10px] font-mono text-green-400">{selectedKeys.length} layers selected</span>
        <span className="text-[9px] text-muted-foreground/50 font-mono ml-2">Ctrl+click để bỏ chọn</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold">Position offset</Label>
        <DeltaSliderField label="X" min={-200} max={200} step={1} unit="px"
          onPointerDown={onCaptureSnapshot} onChange={(v) => onDelta("x", v)} onPointerUp={onRelease} />
        <DeltaSliderField label="Y" min={-200} max={200} step={1} unit="px"
          onPointerDown={onCaptureSnapshot} onChange={(v) => onDelta("y", v)} onPointerUp={onRelease} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold">Transform offset</Label>
        <DeltaSliderField label="Scale"  min={-2}   max={2}   step={0.05} unit="×"
          onPointerDown={onCaptureSnapshot} onChange={(v) => onDelta("scale",  v)} onPointerUp={onRelease} />
        <DeltaSliderField label="Rotate" min={-360} max={360} step={1}    unit="°"
          onPointerDown={onCaptureSnapshot} onChange={(v) => onDelta("rotate", v)} onPointerUp={onRelease} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold">Appearance (set all)</Label>
        <SliderField label="Opacity"    value={avg("opacity")}    min={0} max={100} step={1}   unit="%" onChange={(v) => onAbsolute("opacity",    v)} />
        <SliderField label="Blur"       value={avg("blur")}       min={0} max={20}  step={0.5} unit="px" onChange={(v) => onAbsolute("blur",       v)} />
        <SliderField label="Brightness" value={avg("brightness")} min={0} max={200} step={1}   unit="%" onChange={(v) => onAbsolute("brightness", v)} />
      </div>
    </div>
  );
};

// ─── LAYER ORDER LIST ─────────────────────────────────────────────────────────

const LayerOrderList: React.FC<{
  zOrder: string[];
  selectedLayers: LayerKey[];
  onSelect: (k: LayerKey, ctrlHeld: boolean) => void;
  onMoveUp: (k: OrderableKey) => void;
  onMoveDown: (k: OrderableKey) => void;
}> = ({ zOrder, selectedLayers, onSelect, onMoveUp, onMoveDown }) => {
  const display = [...zOrder].reverse() as OrderableKey[];

  return (
    <div className="flex flex-col gap-0.5">
      {display.map((key, displayIdx) => {
        const isTop    = displayIdx === 0;
        const isBottom = displayIdx === display.length - 1;
        const isActive = selectedLayers.includes(key as LayerKey);
        return (
          <div
            key={key}
            className={[
              "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer select-none transition-colors",
              isActive
                ? "bg-green-500/15 border border-green-500/30"
                : "border border-transparent hover:bg-white/5",
            ].join(" ")}
            onClick={(e) => onSelect(key as LayerKey, e.ctrlKey)}
          >
            <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                className={["w-6 h-5 flex items-center justify-center rounded text-[10px] font-bold leading-none transition-colors", isTop ? "opacity-20 cursor-not-allowed text-muted-foreground" : "hover:bg-white/15 text-muted-foreground hover:text-white cursor-pointer"].join(" ")}
                disabled={isTop}
                onClick={() => !isTop && onMoveUp(key)}
              >▲</button>
              <button
                className={["w-6 h-5 flex items-center justify-center rounded text-[10px] font-bold leading-none transition-colors", isBottom ? "opacity-20 cursor-not-allowed text-muted-foreground" : "hover:bg-white/15 text-muted-foreground hover:text-white cursor-pointer"].join(" ")}
                disabled={isBottom}
                onClick={() => !isBottom && onMoveDown(key)}
              >▼</button>
            </div>
            <span className={["text-xs font-mono flex-1", isActive ? "text-green-400 font-semibold" : "text-muted-foreground"].join(" ")}>
              {LAYER_LABELS[key as LayerKey]}
            </span>
            <span className={["text-[9px] tabular-nums font-mono", isActive ? "text-green-500/70" : "text-muted-foreground/50"].join(" ")}>
              z{zOrder.indexOf(key) + 1}
            </span>
          </div>
        );
      })}

      {/* Background — can be selected (has blur/brightness), not reorderable */}
      <div
        className={["flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer select-none border transition-colors",
          selectedLayers.includes("background") ? "bg-green-500/15 border-green-500/30" : "border-transparent hover:bg-white/5 opacity-60",
        ].join(" ")}
        onClick={(e) => onSelect("background", e.ctrlKey)}
      >
        <div className="w-6 shrink-0" />
        <span className={["text-xs font-mono flex-1 italic", selectedLayers.includes("background") ? "text-green-400 font-semibold not-italic" : "text-muted-foreground"].join(" ")}>
          {LAYER_LABELS.background}
        </span>
        <span className="text-[9px] text-muted-foreground/40 font-mono">locked z</span>
      </div>
    </div>
  );
};

// ─── SAVE STACK INDICATOR ────────────────────────────────────────────────────

const SaveStackIndicator: React.FC<{ saves: LayerConfig[]; pos: number }> = ({
  saves,
  pos,
}) => {
  const MAX_SAVES = 5;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: MAX_SAVES }).map((_, i) => (
        <div
          key={i}
          className={[
            "w-2 h-2 rounded-full transition-colors",
            i < saves.length
              ? i === pos
                ? "bg-green-400"       // current position
                : "bg-green-500/40"   // saved but not current
              : "bg-white/10",         // empty slot
          ].join(" ")}
          title={i < saves.length ? `Save ${i + 1}` : "Empty"}
        />
      ))}
      <span className="text-[9px] font-mono text-muted-foreground/60 ml-0.5">
        {saves.length}/{MAX_SAVES}
      </span>
    </div>
  );
};

// ─── TEXT STYLE INSPECTOR ────────────────────────────────────────────────────
// Only shown when activeLayer === "text".

const ToggleBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ active, onClick, children, title }) => (
  <button
    title={title}
    onClick={onClick}
    className={[
      "h-7 px-2.5 rounded text-xs font-bold transition-colors select-none",
      active
        ? "bg-green-500/25 border border-green-500/50 text-green-400"
        : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white",
    ].join(" ")}
  >
    {children}
  </button>
);

const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <Label className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</Label>
    <input
      type="color"
      value={value.startsWith("#") ? value : "#C8E6C8"}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 28, height: 24, padding: 0, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }}
    />
    <span className="text-[10px] font-mono text-muted-foreground">{value}</span>
  </div>
);

const TextStyleInspector: React.FC<{
  ts: LayerTextStyleConfig;
  onUpdate: (field: keyof LayerTextStyleConfig, value: unknown) => void;
}> = ({ ts, onUpdate }) => (
  <div className="flex flex-col gap-3">

    {/* Style toggles */}
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Style</Label>
      <div className="flex flex-wrap gap-1.5">
        <ToggleBtn active={ts.bold} onClick={() => onUpdate("bold", !ts.bold)} title="Bold">
          <span style={{ fontWeight: 900 }}>B</span>
        </ToggleBtn>
        <ToggleBtn active={ts.underline} onClick={() => onUpdate("underline", !ts.underline)} title="Underline">
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToggleBtn>
        <ToggleBtn active={ts.textTransform === "none"} onClick={() => onUpdate("textTransform", "none")} title="Normal case">Aa</ToggleBtn>
        <ToggleBtn active={ts.textTransform === "uppercase"} onClick={() => onUpdate("textTransform", "uppercase")} title="UPPERCASE">AA</ToggleBtn>
        <ToggleBtn active={ts.textTransform === "lowercase"} onClick={() => onUpdate("textTransform", "lowercase")} title="lowercase">aa</ToggleBtn>
      </div>
    </div>

    {/* Alignment */}
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">Alignment</Label>
      <div className="flex gap-1">
        {(["left", "center", "right"] as const).map((a) => (
          <ToggleBtn key={a} active={ts.textAlign === a} onClick={() => onUpdate("textAlign", a)}>
            {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
          </ToggleBtn>
        ))}
      </div>
    </div>

    {/* Color */}
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Color</Label>
      <ColorRow label="Color" value={ts.color} onChange={(v) => onUpdate("color", v)} />
    </div>

    {/* Stroke */}
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold">Stroke</Label>
      <SliderField label="Width" value={ts.strokeWidth} min={0} max={10} step={0.5} unit="px"
        onChange={(v) => onUpdate("strokeWidth", v)} />
      {ts.strokeWidth > 0 && (
        <ColorRow label="Color" value={ts.strokeColor} onChange={(v) => onUpdate("strokeColor", v)} />
      )}
    </div>

    {/* Max width */}
    <div className="flex flex-col gap-0.5">
      <SliderField label="Max width" value={ts.maxWidth} min={0} max={600} step={10} unit="px"
        onChange={(v) => onUpdate("maxWidth", v)} />
      <p className="text-[9px] text-muted-foreground/50 pl-0.5">0 = no wrap</p>
    </div>

    {/* Phase A hint */}
    <div className="rounded-md bg-white/4 border border-white/8 px-3 py-2.5 font-mono text-[10px] text-muted-foreground leading-relaxed">
      <p className="text-white/60 font-semibold mb-1">Multi-color spans</p>
      <p>Dùng format trong ô Headline / Subline:</p>
      <p className="text-green-400 mt-1">Hello <span className="text-yellow-400/80">[world|#FF4141]</span> there</p>
      <p className="text-muted-foreground/50 mt-1">→ "world" hiển thị màu #FF4141</p>
    </div>
  </div>
);

// ─── MAIN CONTROL PANEL ───────────────────────────────────────────────────────
// RENAME: Replace "MotionScene" with your project name when using as a template.

const MAX_HISTORY = 60;
const MAX_SAVES   = 5;

type LayerSaveStack = { saves: LayerConfig[]; pos: number };
const emptyStack = (): LayerSaveStack => ({ saves: [], pos: -1 });
const initSaveStacks = (): Record<LayerKey, LayerSaveStack> =>
  Object.fromEntries(LAYER_KEYS.map((k) => [k, emptyStack()])) as Record<LayerKey, LayerSaveStack>;

// ── localStorage persistence ───────────────────────────────────────────────
const SS_KEY   = (id: string) => `d1a-saves-${id}`;
const META_KEY = (id: string) => `d1a-meta-${id}`;

const loadSaveStacks = (id: string): Record<LayerKey, LayerSaveStack> => {
  try {
    const raw = localStorage.getItem(SS_KEY(id));
    if (!raw) return initSaveStacks();
    const parsed = JSON.parse(raw) as Record<string, LayerSaveStack>;
    const base = initSaveStacks();
    for (const k of LAYER_KEYS) {
      const entry = parsed[k];
      if (entry && Array.isArray(entry.saves) && typeof entry.pos === "number") {
        base[k] = entry;
      }
    }
    return base;
  } catch {
    return initSaveStacks();
  }
};
const persistSaveStacks = (id: string, stacks: Record<LayerKey, LayerSaveStack>) => {
  try { localStorage.setItem(SS_KEY(id), JSON.stringify(stacks)); } catch { /* quota */ }
};

const loadPersistedMeta = (id: string): MotionSceneMeta | null => {
  try {
    const raw = localStorage.getItem(META_KEY(id));
    if (!raw) return null;
    const r = MotionSceneSchema.safeParse(JSON.parse(raw));
    return r.success ? r.data : null;
  } catch { return null; }
};
const persistMeta = (id: string, m: MotionSceneMeta) => {
  try { localStorage.setItem(META_KEY(id), JSON.stringify(m)); } catch { /* quota */ }
};

const BasicMotionScene = ({ trackItem }: { trackItem: ITrackItem }) => {
  const [meta, setMeta] = useState<MotionSceneMeta>(() =>
    loadPersistedMeta(trackItem.id) ?? parseMotionSceneMeta(trackItem.metadata)
  );
  // Multi-select: Ctrl+click adds/removes layers. 1 layer = single mode, 2+ = group mode.
  const [selectedLayers, setSelectedLayers] = useState<LayerKey[]>(["folder"]);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [saveStackVersion, setSaveStackVersion] = useState(0);

  // Derived
  const isGroupMode  = selectedLayers.length >= 2;
  const activeLayer  = selectedLayers[selectedLayers.length - 1];

  // Refs
  const metaRef          = useRef(meta);       // always current meta, used in group delta
  metaRef.current        = meta;
  const historyRef       = useRef<MotionSceneMeta[]>([]);
  const saveStacksRef    = useRef<Record<LayerKey, LayerSaveStack>>(loadSaveStacks(trackItem.id));
  const panelRef         = useRef<HTMLDivElement>(null);
  // Snapshot of selected-layer configs at drag-start, used for delta group moves
  const groupSnapshotRef = useRef<Partial<Record<LayerKey, LayerConfig>>>({});
  // Stable ref so keyboard handler doesn't need selectedLayers in its deps
  const activeLayerRef   = useRef<LayerKey>(activeLayer);
  activeLayerRef.current = activeLayer;

  useEffect(() => {
    const persisted = loadPersistedMeta(trackItem.id);
    const resolved  = persisted ?? parseMotionSceneMeta(trackItem.metadata);
    setMeta(resolved);
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: resolved } } });
    historyRef.current = [];
    saveStacksRef.current = loadSaveStacks(trackItem.id);
    setSaveStackVersion((v) => v + 1);
    setSelectedLayers(["folder"]);
  }, [trackItem.id]); // dep on id only — metadata changes (same clip) must NOT reset selection

  // Push to history, then apply and dispatch.
  const applyMeta = useCallback((prev: MotionSceneMeta, next: MotionSceneMeta) => {
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  }, [trackItem.id]);

  const updateContent = (key: string, value: string) => {
    const next = MotionSceneSchema.parse({ ...meta, [key]: value });
    applyMeta(meta, next);
  };

  const updateLayer = useCallback((layerKey: LayerKey, field: keyof LayerConfig, value: number) => {
    const prev = metaRef.current;
    const next = MotionSceneSchema.parse({
      ...prev,
      layers: { ...prev.layers, [layerKey]: { ...prev.layers[layerKey], [field]: value } },
    });
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  }, [trackItem.id]);

  const updateTextStyle = useCallback((field: keyof LayerTextStyleConfig, value: unknown) => {
    const al = activeLayerRef.current;
    if (!isTextLayerKey(al)) return; // guard: style only applies to text layers
    const layerKey = al;
    const prev = metaRef.current;
    const ts = prev.textStyle as Record<string, LayerTextStyleConfig>;
    const next = MotionSceneSchema.parse({
      ...prev,
      textStyle: { ...prev.textStyle, [layerKey]: { ...ts[layerKey], [field]: value } },
    });
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  }, [trackItem.id]);

  const updateZOrder = useCallback((newOrder: string[]) => {
    const prev = metaRef.current;
    const next = MotionSceneSchema.parse({ ...prev, zOrder: newOrder });
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  }, [trackItem.id]);

  const moveLayerUp = (key: OrderableKey) => {
    const order = [...meta.zOrder];
    const i = order.indexOf(key);
    if (i < order.length - 1) {
      [order[i], order[i + 1]] = [order[i + 1], order[i]];
      updateZOrder(order);
    }
  };

  const moveLayerDown = (key: OrderableKey) => {
    const order = [...meta.zOrder];
    const i = order.indexOf(key);
    if (i > 0) {
      [order[i - 1], order[i]] = [order[i], order[i - 1]];
      updateZOrder(order);
    }
  };

  // ── Multi-select handler ──────────────────────────────────────────────────
  const handleLayerSelect = useCallback((key: LayerKey, ctrlHeld: boolean) => {
    setEditingText(null);
    if (ctrlHeld) {
      setSelectedLayers((prev) => {
        if (prev.includes(key)) {
          const next = prev.filter((k) => k !== key);
          return next.length > 0 ? next : prev;
        }
        return [...prev, key];
      });
    } else {
      setSelectedLayers([key]);
    }
  }, []);

  // ── Group update helpers ───────────────────────────────────────────────────
  // preGroupMetaRef: full meta snapshot captured at drag-start for history
  const preGroupMetaRef = useRef<MotionSceneMeta | null>(null);

  const captureGroupSnapshot = () => {
    const snap: Partial<Record<LayerKey, LayerConfig>> = {};
    selectedLayers.forEach((k) => { snap[k] = { ...meta.layers[k] }; });
    groupSnapshotRef.current = snap;
    preGroupMetaRef.current = meta;
  };

  const applyGroupDelta = (field: "x" | "y" | "scale" | "rotate", delta: number) => {
    const snap = groupSnapshotRef.current;
    const prev = metaRef.current;
    const newLayers = { ...prev.layers };
    selectedLayers.forEach((k) => {
      const base = snap[k] ?? prev.layers[k];
      const newVal =
        field === "scale"
          ? Math.max(0.1, base.scale + delta)
          : (base[field as "x" | "y" | "rotate"] as number) + delta;
      newLayers[k] = { ...newLayers[k], [field]: newVal } as LayerConfig;
    });
    const next = MotionSceneSchema.parse({ ...prev, layers: newLayers });
    // dispatch BEFORE setMeta — both are synchronous in the same event tick,
    // React 18 batches them. Keeping dispatch outside the updater avoids
    // a Zustand synchronous re-render that would fight with React's pending setVal.
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  };

  const onGroupDragEnd = () => {
    if (preGroupMetaRef.current) {
      historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), preGroupMetaRef.current];
      preGroupMetaRef.current = null;
    }
  };

  const applyGroupAbsolute = (field: "opacity" | "blur" | "brightness", value: number) => {
    const prev = metaRef.current;
    const newLayers = { ...prev.layers };
    selectedLayers.forEach((k) => {
      newLayers[k] = { ...newLayers[k], [field]: value } as LayerConfig;
    });
    const next = MotionSceneSchema.parse({ ...prev, layers: newLayers });
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
    setMeta(next);
  };

  // ── Keyboard shortcuts — uses activeLayerRef to avoid stale closure ────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!panelRef.current?.contains(document.activeElement)) return;

      const isCtrl  = e.ctrlKey;
      const isShift = e.shiftKey;
      const key     = e.key.toLowerCase();
      const al      = activeLayerRef.current; // always current

      if (isCtrl && !isShift && key === "s") {
        e.preventDefault(); e.stopPropagation();
        const ss = saveStacksRef.current[al];
        if (ss.saves.length >= MAX_SAVES) {
          setSaveError(`Save limit reached (${MAX_SAVES}/5).`);
          setTimeout(() => setSaveError(null), 3000);
          return;
        }
        const newSaves = [...ss.saves, { ...metaRef.current.layers[al] }];
        const newStacks = { ...saveStacksRef.current, [al]: { saves: newSaves, pos: newSaves.length - 1 } };
        saveStacksRef.current = newStacks;
        persistSaveStacks(trackItem.id, newStacks);
        persistMeta(trackItem.id, metaRef.current);
        setSaveStackVersion((v) => v + 1);
        return;
      }

      if (isCtrl && isShift && key === "z") {
        e.preventDefault(); e.stopPropagation();
        const ss = saveStacksRef.current[al];
        let targetLayer: LayerConfig;
        let newPos: number;
        if (ss.pos > 0) { newPos = ss.pos - 1; targetLayer = ss.saves[newPos]; }
        else if (ss.pos === 0) { newPos = -1; targetLayer = DEFAULT_LAYER; }
        else return;
        const prev = metaRef.current;
        saveStacksRef.current = { ...saveStacksRef.current, [al]: { ...ss, pos: newPos } };
        setSaveStackVersion((v) => v + 1);
        const next = MotionSceneSchema.parse({ ...prev, layers: { ...prev.layers, [al]: targetLayer } });
        historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
        dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
        setMeta(next);
        return;
      }

      if (isCtrl && isShift && key === "f") {
        e.preventDefault(); e.stopPropagation();
        const ss = saveStacksRef.current[al];
        if (ss.pos >= ss.saves.length - 1) return;
        const newPos = ss.pos + 1;
        const prev = metaRef.current;
        saveStacksRef.current = { ...saveStacksRef.current, [al]: { ...ss, pos: newPos } };
        setSaveStackVersion((v) => v + 1);
        const next = MotionSceneSchema.parse({ ...prev, layers: { ...prev.layers, [al]: ss.saves[newPos] } });
        historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev];
        dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
        setMeta(next);
        return;
      }

      if (isCtrl && !isShift && key === "z") {
        e.preventDefault(); e.stopPropagation();
        const stack = historyRef.current;
        if (stack.length === 0) return;
        const prev = stack[stack.length - 1];
        historyRef.current = stack.slice(0, -1);
        dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: prev } } });
        setMeta(prev);
      }
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [trackItem.id]); // activeLayerRef.current is always fresh — no need in deps

  // Which text line is currently in edit mode (double-click to activate)
  const [editingText, setEditingText] = useState<string | null>(null);

  // ── Save Project — download current metadata as JSON preset ────────────────
  const [showGuide, setShowGuide] = useState(false);

  const saveProject = () => {
    const preset = {
      _info: "D1A Motion Editor preset. Paste the 'metadata' field into mock.ts → trackItemsMap → metadata.",
      _savedAt: new Date().toISOString(),
      metadata: meta,
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `motion-scene-preset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={panelRef}
      className="flex lg:h-[calc(100vh-84px)] flex-1 flex-col overflow-hidden min-h-[340px]"
      tabIndex={-1} // makes div focusable so activeElement check works
    >
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 px-4 py-4">

          {/* ── 1. Layer Order — always top; Ctrl+click for multi-select ── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="font-sans text-xs font-semibold">Layer Order</Label>
              <span className="text-[9px] text-muted-foreground/60 font-mono">
                {isGroupMode ? `${selectedLayers.length} selected` : "top → bottom"}
              </span>
            </div>
            <LayerOrderList
              zOrder={meta.zOrder}
              selectedLayers={selectedLayers}
              onSelect={handleLayerSelect}
              onMoveUp={moveLayerUp}
              onMoveDown={moveLayerDown}
            />
          </div>

          <div className="h-px bg-white/8" />

          {/* ── 2. Inspector — GROUP mode or SINGLE mode ── */}
          {isGroupMode ? (
            <GroupInspector
              selectedKeys={selectedLayers}
              layers={meta.layers}
              onCaptureSnapshot={captureGroupSnapshot}
              onDelta={applyGroupDelta}
              onRelease={onGroupDragEnd}
              onAbsolute={applyGroupAbsolute}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* layer name + save stack */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] font-mono text-muted-foreground px-1">{LAYER_LABELS[activeLayer]}</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              <div className="-mt-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-muted-foreground/50 font-mono">Ctrl+S save · ⇧Z back · ⇧F fwd · Z undo</p>
                  <SaveStackIndicator
                    saves={saveStacksRef.current[activeLayer].saves}
                    pos={saveStacksRef.current[activeLayer].pos}
                    key={saveStackVersion}
                  />
                </div>
                {saveError && <p className="text-[9px] text-red-400 font-mono bg-red-500/10 rounded px-2 py-1">{saveError}</p>}
              </div>

              {/* Content block — only for text layers, shown FIRST */}
              {isTextLayerKey(activeLayer) && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Content</Label>
                  {TEXT_LAYER_KEYS.map((key) => {
                    const metaAny   = meta as unknown as Record<string, string>;
                    const isActive  = activeLayer === key;
                    const isEditing = editingText === key;
                    return (
                      <div
                        key={key}
                        className={["rounded-md px-3 py-2 cursor-pointer select-none transition-all",
                          isActive ? "border border-green-500/50 bg-green-500/8 shadow-[0_0_10px_rgba(0,255,65,0.12)]"
                                   : "border border-white/10 bg-white/3 hover:border-white/20",
                        ].join(" ")}
                        onClick={() => handleLayerSelect(key as LayerKey, false)}
                        onDoubleClick={(e) => { e.preventDefault(); handleLayerSelect(key as LayerKey, false); setEditingText(key); }}
                      >
                        <p className={["text-[9px] font-mono mb-1", isActive ? "text-green-400/60" : "text-muted-foreground/40"].join(" ")}>
                          {LAYER_LABELS[key as LayerKey]}
                        </p>
                        {isEditing ? (
                          <Input
                            autoFocus
                            className="h-6 text-xs bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-green-500/50"
                            value={metaAny[key] ?? ""}
                            onChange={(e) => updateContent(key, e.target.value)}
                            onBlur={() => setEditingText(null)}
                            onKeyDown={(e) => { if (e.key === "Enter") setEditingText(null); }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className={["text-xs font-mono truncate leading-snug", isActive ? "text-white" : "text-muted-foreground/70"].join(" ")}>
                            {metaAny[key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-[9px] text-muted-foreground/35 font-mono pl-0.5">click chọn · double-click sửa</p>
                </div>
              )}

              {/* Layer Inspector */}
              <LayerInspector
                layerKey={activeLayer}
                layer={meta.layers[activeLayer]}
                onUpdate={(field, value) => updateLayer(activeLayer, field, value)}
              />

              {/* Text Style */}
              {isTextLayerKey(activeLayer) && (
                <div className="flex flex-col gap-3 pt-2 border-t border-white/8">
                  <Label className="text-xs font-semibold">Text Style</Label>
                  <TextStyleInspector
                    ts={(meta.textStyle as Record<string, LayerTextStyleConfig>)[activeLayer] ?? DEFAULT_LAYER_TEXT_STYLE}
                    onUpdate={updateTextStyle}
                  />
                </div>
              )}
            </div>
          )}

          <div className="h-px bg-white/8" />

          {/* ── 3. Save Project ── */}
          <div className="flex flex-col gap-2">
            <button onClick={saveProject}
              className="w-full h-8 rounded-md text-xs font-mono font-semibold bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 hover:border-green-500/50 transition-colors"
            >↓ Save Project Preset</button>
            <button onClick={() => setShowGuide((v) => !v)}
              className="text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground text-left transition-colors"
            >{showGuide ? "▾" : "▸"} How to load preset back</button>
            {showGuide && (
              <div className="flex flex-col gap-1.5 rounded-md bg-white/4 border border-white/8 px-3 py-2.5 font-mono text-[10px] text-muted-foreground leading-relaxed">
                <p className="text-white/70 font-semibold">1. Mở file JSON vừa tải</p>
                <p>Copy object trong <span className="text-green-400">"metadata": {"{"} ... {"}"}</span></p>
                <p className="text-white/70 font-semibold mt-1">2. Mở <span className="text-green-400">src/features/editor/mock.ts</span></p>
                <p>Tìm item → trường <span className="text-green-400">metadata:</span> → paste vào thay thế.</p>
                <p className="text-white/70 font-semibold mt-1">3. Lưu → Remotion tự render lại.</p>
              </div>
            )}
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicMotionScene;
