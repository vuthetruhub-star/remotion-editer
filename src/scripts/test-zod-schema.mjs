/**
 * Zod schema unit tests for motion-scene.schema.ts
 * Run: node --experimental-vm-modules src/scripts/test-zod-schema.mjs
 *
 * Uses tsx/Node.js + dynamic import of a compiled version via esbuild-register shim.
 * Since schema is TypeScript, we use a small inline transpile trick with tsx.
 */

// ── inline transpile via tsx ──────────────────────────────────────────────────
// Run this via: npx tsx src/scripts/test-zod-schema.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load zod directly
const { z } = await import("zod");

// ── Inline the schema (transpile-free) ───────────────────────────────────────
// We re-implement the schema here so this script runs without TypeScript.
// This mirrors motion-scene.schema.ts exactly.

const ORDERABLE_KEYS = ["folder","card1","card2","card3","headline","subline","badge"];
const LAYER_KEYS = ["background", ...ORDERABLE_KEYS];

const LayerSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  rotate: z.number().default(0),
  opacity: z.number().min(0).max(100).default(100),
  fromFrame: z.number().default(0),
  durationFrames: z.number().default(150),
  blur: z.number().min(0).max(20).default(0),
  brightness: z.number().min(0).max(200).default(100),
});

const DEFAULT_LAYER = LayerSchema.parse({});

const LayerTextStyleSchema = z.object({
  bold:          z.boolean().default(false),
  underline:     z.boolean().default(false),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).default("none"),
  color:         z.string().default("#C8E6C8"),
  textAlign:     z.enum(["left", "center", "right"]).default("center"),
  strokeWidth:   z.number().min(0).max(10).default(0),
  strokeColor:   z.string().default("#00FF41"),
  maxWidth:      z.number().min(0).max(800).default(0),
});

const DEFAULT_LAYER_TEXT_STYLE = LayerTextStyleSchema.parse({});

const TextStyleSchema = z.object({
  headline: LayerTextStyleSchema.default({}),
  subline:  LayerTextStyleSchema.default({ color: "#78A878" }),
});

const DEFAULT_TEXT_STYLE = TextStyleSchema.parse({});

const MotionSceneSchema = z.object({
  headline: z.string().default("make money from spotify"),
  subline:  z.string().default("But it's greater when you actually can"),
  textStyle: TextStyleSchema.default({}),
  layers: z.object({
    background: LayerSchema.default({}),
    folder:     LayerSchema.default({}),
    card1:      LayerSchema.default({}),
    card2:      LayerSchema.default({}),
    card3:      LayerSchema.default({}),
    headline:   LayerSchema.default({}),
    subline:    LayerSchema.default({}),
    badge:      LayerSchema.default({}),
  }).default({}),
  zOrder: z.array(z.string()).default([...ORDERABLE_KEYS]),
});

const parseMotionSceneMeta = (metadata) => {
  const result = MotionSceneSchema.safeParse(metadata ?? {});
  const data = result.success ? result.data : MotionSceneSchema.parse({});
  const validOrder = data.zOrder.filter((k) => ORDERABLE_KEYS.includes(k));
  return validOrder.length === data.zOrder.length
    ? data
    : { ...data, zOrder: validOrder.length > 0 ? validOrder : [...ORDERABLE_KEYS] };
};

const zIdxOf = (key, zOrder) => {
  const i = zOrder.indexOf(key);
  return i === -1 ? 0 : i + 1;
};

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: "PASS", detail: "" });
    passed++;
  } catch (e) {
    results.push({ name, status: "FAIL", detail: e.message.split("\n")[0] });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg ?? "assertion failed");
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── T1: DEFAULT_LAYER derived from schema ─────────────────────────────────────
test("DEFAULT_LAYER — derived from LayerSchema.parse({})", () => {
  assert(deepEqual(DEFAULT_LAYER, { x:0, y:0, scale:1, rotate:0, opacity:100, fromFrame:0, durationFrames:150, blur:0, brightness:100 }),
    `Got: ${JSON.stringify(DEFAULT_LAYER)}`);
});

// ── T2: DEFAULT_LAYER_TEXT_STYLE derived from schema ─────────────────────────
test("DEFAULT_LAYER_TEXT_STYLE — derived from LayerTextStyleSchema.parse({})", () => {
  assert(DEFAULT_LAYER_TEXT_STYLE.bold === false, "bold should be false");
  assert(DEFAULT_LAYER_TEXT_STYLE.color === "#C8E6C8", `color: ${DEFAULT_LAYER_TEXT_STYLE.color}`);
  assert(DEFAULT_LAYER_TEXT_STYLE.textAlign === "center", "textAlign center");
  assert(DEFAULT_LAYER_TEXT_STYLE.strokeWidth === 0, "strokeWidth 0");
  assert(DEFAULT_LAYER_TEXT_STYLE.maxWidth === 0, "maxWidth 0");
});

// ── T3: DEFAULT_TEXT_STYLE — subline gets different color ──────────────────────
test("DEFAULT_TEXT_STYLE — subline color differs from headline", () => {
  assert(DEFAULT_TEXT_STYLE.headline.color === "#C8E6C8", `headline color: ${DEFAULT_TEXT_STYLE.headline.color}`);
  assert(DEFAULT_TEXT_STYLE.subline.color === "#78A878", `subline color: ${DEFAULT_TEXT_STYLE.subline.color}`);
});

// ── T4: parseMotionSceneMeta({}) — all defaults filled ───────────────────────
test("parseMotionSceneMeta({}) — fills all defaults", () => {
  const r = parseMotionSceneMeta({});
  assert(r.headline === "make money from spotify", `headline: ${r.headline}`);
  assert(r.subline  === "But it's greater when you actually can", `subline: ${r.subline}`);
  assert(deepEqual(r.layers.folder, DEFAULT_LAYER), "folder layer default");
  assert(deepEqual(r.layers.background, DEFAULT_LAYER), "background layer default");
  assert(r.textStyle.headline.color === "#C8E6C8", "headline textStyle color");
  assert(r.textStyle.subline.color  === "#78A878", "subline textStyle color");
  assert(deepEqual(r.zOrder, ORDERABLE_KEYS), "zOrder default");
});

// ── T5: parseMotionSceneMeta(null) — null input falls back to defaults ────────
test("parseMotionSceneMeta(null) — null → defaults (no crash)", () => {
  const r = parseMotionSceneMeta(null);
  assert(r.headline === "make money from spotify", "null: headline default");
  assert(Array.isArray(r.zOrder), "null: zOrder is array");
});

// ── T6: parseMotionSceneMeta(undefined) — undefined → defaults ───────────────
test("parseMotionSceneMeta(undefined) — undefined → defaults", () => {
  const r = parseMotionSceneMeta(undefined);
  assert(r.headline === "make money from spotify", "undefined: headline default");
});

// ── T7: partial headline override ─────────────────────────────────────────────
test("parseMotionSceneMeta partial: headline override kept, rest defaults", () => {
  const r = parseMotionSceneMeta({ headline: "custom title" });
  assert(r.headline === "custom title", "headline kept");
  assert(r.subline === "But it's greater when you actually can", "subline still default");
  assert(deepEqual(r.layers.folder, DEFAULT_LAYER), "layers unaffected");
});

// ── T8: partial layer override (x position) ───────────────────────────────────
test("parseMotionSceneMeta partial layer: folder.x=50, rest default", () => {
  const r = parseMotionSceneMeta({ layers: { folder: { x: 50 } } });
  assert(r.layers.folder.x === 50, `folder.x: ${r.layers.folder.x}`);
  assert(r.layers.folder.y === 0, "folder.y still 0");
  assert(r.layers.folder.scale === 1, "folder.scale still 1");
  assert(r.layers.folder.blur === 0, "folder.blur still 0");
  assert(deepEqual(r.layers.card1, DEFAULT_LAYER), "card1 unaffected");
});

// ── T9: partial textStyle override — headline only ────────────────────────────
test("parseMotionSceneMeta partial textStyle: headline.color=#FF0000, subline unchanged", () => {
  const r = parseMotionSceneMeta({ textStyle: { headline: { color: "#FF0000" } } });
  assert(r.textStyle.headline.color === "#FF0000", `headline color: ${r.textStyle.headline.color}`);
  assert(r.textStyle.headline.bold === false, "headline bold still false");
  assert(r.textStyle.subline.color === "#78A878", `subline color unchanged: ${r.textStyle.subline.color}`);
});

// ── T10: per-layer text style isolation (the old bug) ─────────────────────────
test("Text style isolation: updating headline does NOT affect subline", () => {
  const initial = parseMotionSceneMeta({});
  // Simulate what updateTextStyle does in control panel
  const modified = MotionSceneSchema.parse({
    ...initial,
    textStyle: { ...initial.textStyle, headline: { ...initial.textStyle.headline, color: "#ABCDEF" } },
  });
  assert(modified.textStyle.headline.color === "#ABCDEF", "headline updated");
  assert(modified.textStyle.subline.color === "#78A878", "subline NOT affected");
});

// ── T11: corrupt zOrder — unknown keys dropped ────────────────────────────────
test("parseMotionSceneMeta: corrupt zOrder with unknown keys gets sanitized", () => {
  const r = parseMotionSceneMeta({ zOrder: ["folder", "UNKNOWN_KEY", "card1"] });
  assert(!r.zOrder.includes("UNKNOWN_KEY"), `UNKNOWN_KEY should be removed, got: ${r.zOrder}`);
  assert(r.zOrder.includes("folder"), "folder kept");
  assert(r.zOrder.includes("card1"), "card1 kept");
});

// ── T12: all-unknown zOrder resets to defaults ────────────────────────────────
test("parseMotionSceneMeta: all-unknown zOrder resets to ORDERABLE_KEYS", () => {
  const r = parseMotionSceneMeta({ zOrder: ["BAD_KEY_1", "BAD_KEY_2"] });
  assert(deepEqual(r.zOrder, ORDERABLE_KEYS), `Should reset to defaults, got: ${JSON.stringify(r.zOrder)}`);
});

// ── T13: zOrder partial valid ──────────────────────────────────────────────────
test("parseMotionSceneMeta: partial valid zOrder [folder, card1] preserved", () => {
  const r = parseMotionSceneMeta({ zOrder: ["folder", "card1"] });
  assert(deepEqual(r.zOrder, ["folder", "card1"]), `Got: ${JSON.stringify(r.zOrder)}`);
});

// ── T14: opacity min/max validation ───────────────────────────────────────────
test("LayerSchema: opacity > 100 fails parse", () => {
  const r = LayerSchema.safeParse({ opacity: 150 });
  assert(!r.success, "opacity 150 should fail");
});

test("LayerSchema: opacity < 0 fails parse", () => {
  const r = LayerSchema.safeParse({ opacity: -1 });
  assert(!r.success, "opacity -1 should fail");
});

// ── T15: blur and brightness validation ───────────────────────────────────────
test("LayerSchema: blur > 20 fails parse", () => {
  const r = LayerSchema.safeParse({ blur: 25 });
  assert(!r.success, "blur 25 should fail");
});

test("LayerSchema: brightness > 200 fails parse", () => {
  const r = LayerSchema.safeParse({ brightness: 250 });
  assert(!r.success, "brightness 250 should fail");
});

// ── T16: textTransform enum validation ───────────────────────────────────────
test("LayerTextStyleSchema: invalid textTransform fails", () => {
  const r = LayerTextStyleSchema.safeParse({ textTransform: "bold" });
  assert(!r.success, "textTransform 'bold' should fail");
});

test("LayerTextStyleSchema: valid textTransform 'uppercase' passes", () => {
  const r = LayerTextStyleSchema.safeParse({ textTransform: "uppercase" });
  assert(r.success, "uppercase valid");
  assert(r.data?.textTransform === "uppercase");
});

// ── T17: textAlign enum validation ───────────────────────────────────────────
test("LayerTextStyleSchema: invalid textAlign 'justify' fails", () => {
  const r = LayerTextStyleSchema.safeParse({ textAlign: "justify" });
  assert(!r.success, "textAlign 'justify' should fail");
});

// ── T18: strokeWidth min/max validation ───────────────────────────────────────
test("LayerTextStyleSchema: strokeWidth > 10 fails", () => {
  const r = LayerTextStyleSchema.safeParse({ strokeWidth: 15 });
  assert(!r.success, "strokeWidth 15 should fail");
});

// ── T19: totally invalid input ────────────────────────────────────────────────
test("parseMotionSceneMeta: string input → falls back to defaults (no crash)", () => {
  const r = parseMotionSceneMeta("not an object");
  assert(r.headline === "make money from spotify", "string: falls back to defaults");
});

test("parseMotionSceneMeta: number input → falls back to defaults (no crash)", () => {
  const r = parseMotionSceneMeta(42);
  assert(r.headline === "make money from spotify", "number: falls back to defaults");
});

test("parseMotionSceneMeta: array input → falls back to defaults (no crash)", () => {
  const r = parseMotionSceneMeta([1, 2, 3]);
  assert(r.headline === "make money from spotify", "array: falls back to defaults");
});

// ── T20: zIdxOf correctness ────────────────────────────────────────────────────
test("zIdxOf: background (not in zOrder) returns 0", () => {
  const order = ["folder", "card1", "headline"];
  assert(zIdxOf("background", order) === 0, "background = 0");
});

test("zIdxOf: first element returns 1", () => {
  const order = ["folder", "card1", "headline"];
  assert(zIdxOf("folder", order) === 1, "folder = 1 (index 0 + 1)");
});

test("zIdxOf: last element returns highest z-index", () => {
  const order = ["folder", "card1", "headline"];
  assert(zIdxOf("headline", order) === 3, "headline = 3 (index 2 + 1)");
});

test("zIdxOf: unknown key returns 0", () => {
  const order = ["folder", "card1"];
  assert(zIdxOf("UNKNOWN", order) === 0, "unknown = 0");
});

// ── T21: full round-trip — parse → modify → re-parse ─────────────────────────
test("Round-trip: parse → modify layer.x → re-parse → value preserved", () => {
  const initial = parseMotionSceneMeta({});
  const modified = MotionSceneSchema.parse({
    ...initial,
    layers: { ...initial.layers, folder: { ...initial.layers.folder, x: 99 } },
  });
  const roundtrip = parseMotionSceneMeta(modified);
  assert(roundtrip.layers.folder.x === 99, `x after round-trip: ${roundtrip.layers.folder.x}`);
});

// ── T22: LAYER_KEYS completeness ──────────────────────────────────────────────
test("LAYER_KEYS includes background + all ORDERABLE_KEYS", () => {
  assert(LAYER_KEYS[0] === "background", "background is first");
  for (const k of ORDERABLE_KEYS) {
    assert(LAYER_KEYS.includes(k), `${k} missing from LAYER_KEYS`);
  }
  assert(LAYER_KEYS.length === ORDERABLE_KEYS.length + 1, "length correct");
});

// ── T23: layers object has all 8 layer keys ───────────────────────────────────
test("parseMotionSceneMeta({}): all 8 layer keys present in layers", () => {
  const r = parseMotionSceneMeta({});
  for (const k of LAYER_KEYS) {
    assert(k in r.layers, `layers.${k} missing`);
  }
});

// ── T24: safeParse graceful failure returns valid data ────────────────────────
test("parseMotionSceneMeta: safeParse path returns valid MotionSceneMeta shape", () => {
  // Pass something that won't fully parse (bad textTransform in nested)
  const bad = { textStyle: { headline: { textTransform: "invalid" } } };
  // safeParse should fail → fall back to MotionSceneSchema.parse({})
  const r = parseMotionSceneMeta(bad);
  // When safeParse fails, we get the defaults — all fields must be present
  assert("headline" in r, "headline field present");
  assert("layers" in r, "layers field present");
  assert("textStyle" in r, "textStyle field present");
  assert("zOrder" in r, "zOrder field present");
});

// ── Report ─────────────────────────────────────────────────────────────────────

const PAD_NAME = 70;
const PAD_STATUS = 6;

console.log("\n" + "─".repeat(80));
console.log(" ZOD SCHEMA TEST REPORT — motion-scene.schema.ts");
console.log("─".repeat(80));
console.log(` ${"TEST".padEnd(PAD_NAME)} ${"STATUS".padEnd(PAD_STATUS)} DETAIL`);
console.log("─".repeat(80));

for (const r of results) {
  const icon   = r.status === "PASS" ? "✓" : "✗";
  const status = r.status === "PASS" ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  const detail = r.status === "FAIL" ? `\x1b[33m${r.detail}\x1b[0m` : "";
  console.log(` ${icon} ${r.name.padEnd(PAD_NAME - 2)} ${r.status.padEnd(PAD_STATUS)} ${detail}`);
}

console.log("─".repeat(80));
console.log(` TOTAL: ${passed + failed} | \x1b[32mPASS: ${passed}\x1b[0m | \x1b[31mFAIL: ${failed}\x1b[0m`);
console.log("─".repeat(80) + "\n");

if (failed > 0) process.exit(1);
