/**
 * Tests: Zod schema reusability across different assets.
 *
 * Simulates 3 completely different assets that share _shared.ts primitives:
 *   Asset A — MotionScene  (folder, card1-3, headline, subline, badge)
 *   Asset B — LogoBanner   (logo, ring, particles, title, tagline)
 *   Asset C — StatsCard    (bg_gradient, chart, value_text, label, icon)
 *
 * Verifies:
 *   - LayerSchema (9 props) works identically for all asset layer names
 *   - LayerTextStyleSchema works with any text-layer key name
 *   - sanitizeZOrder is asset-aware: MotionScene keys != LogoBanner keys
 *   - zIdxOf is fully key-agnostic
 *   - Each asset's parseXxxMeta is independent — no cross-contamination
 */

import { z } from "zod";

// ── Inline _shared.ts (no TypeScript, mirrors the real file) ─────────────────

const LayerSchema = z.object({
  x:              z.number().default(0),
  y:              z.number().default(0),
  scale:          z.number().default(1),
  rotate:         z.number().default(0),
  opacity:        z.number().min(0).max(100).default(100),
  fromFrame:      z.number().default(0),
  durationFrames: z.number().default(150),
  blur:           z.number().min(0).max(20).default(0),
  brightness:     z.number().min(0).max(200).default(100),
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

const zIdxOf = (key, zOrder) => {
  const i = zOrder.indexOf(key);
  return i === -1 ? 0 : i + 1;
};

const sanitizeZOrder = (zOrder, orderableKeys, defaultOrder) => {
  const valid = zOrder.filter((k) => orderableKeys.includes(k));
  return valid.length === 0 ? defaultOrder : valid;
};

// ── Asset A — MotionScene ─────────────────────────────────────────────────────

const MS_ORDERABLE = ["folder", "card1", "card2", "card3", "headline", "subline", "badge"];
const MS_LAYER_KEYS = ["background", ...MS_ORDERABLE];

const MSTextStyleSchema = z.object({
  headline: LayerTextStyleSchema.default({}),
  subline:  LayerTextStyleSchema.default({ color: "#78A878" }),
});

const MotionSceneSchema = z.object({
  headline: z.string().default("make money from spotify"),
  subline:  z.string().default("But it's greater when you actually can"),
  textStyle: MSTextStyleSchema.default({}),
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
  zOrder: z.array(z.string()).default([...MS_ORDERABLE]),
});

const parseMotionSceneMeta = (m) => {
  const r = MotionSceneSchema.safeParse(m ?? {});
  const data = r.success ? r.data : MotionSceneSchema.parse({});
  const clean = sanitizeZOrder(data.zOrder, MS_ORDERABLE, [...MS_ORDERABLE]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};

// ── Asset B — LogoBanner (completely different layers & text keys) ─────────────

const LB_ORDERABLE = ["logo", "ring", "particles", "title", "tagline"];
const LB_LAYER_KEYS = ["background", ...LB_ORDERABLE];

const LBTextStyleSchema = z.object({
  title:   LayerTextStyleSchema.default({ color: "#FFFFFF" }),
  tagline: LayerTextStyleSchema.default({ color: "#AAAAAA" }),
});

const LogoBannerSchema = z.object({
  title:   z.string().default("D1AGENCY"),
  tagline: z.string().default("Digital systems for bold brand growth"),
  textStyle: LBTextStyleSchema.default({}),
  layers: z.object({
    background: LayerSchema.default({}),
    logo:       LayerSchema.default({}),
    ring:       LayerSchema.default({}),
    particles:  LayerSchema.default({}),
    title:      LayerSchema.default({}),
    tagline:    LayerSchema.default({}),
  }).default({}),
  zOrder: z.array(z.string()).default([...LB_ORDERABLE]),
});

const parseLogoBannerMeta = (m) => {
  const r = LogoBannerSchema.safeParse(m ?? {});
  const data = r.success ? r.data : LogoBannerSchema.parse({});
  const clean = sanitizeZOrder(data.zOrder, LB_ORDERABLE, [...LB_ORDERABLE]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};

// ── Asset C — StatsCard (numbers-focused, different text structure) ────────────

const SC_ORDERABLE = ["bg_gradient", "chart", "value_text", "label", "icon"];
const SC_LAYER_KEYS = ["background", ...SC_ORDERABLE];

const SCTextStyleSchema = z.object({
  value_text: LayerTextStyleSchema.default({ color: "#00FF41" }),
  label:      LayerTextStyleSchema.default({ color: "#9BA39E" }),
});

const StatsCardSchema = z.object({
  value_text: z.string().default("$1,234"),
  label:      z.string().default("Monthly Revenue"),
  textStyle:  SCTextStyleSchema.default({}),
  layers: z.object({
    background:  LayerSchema.default({}),
    bg_gradient: LayerSchema.default({}),
    chart:       LayerSchema.default({}),
    value_text:  LayerSchema.default({}),
    label:       LayerSchema.default({}),
    icon:        LayerSchema.default({}),
  }).default({}),
  zOrder: z.array(z.string()).default([...SC_ORDERABLE]),
});

const parseStatsCardMeta = (m) => {
  const r = StatsCardSchema.safeParse(m ?? {});
  const data = r.success ? r.data : StatsCardSchema.parse({});
  const clean = sanitizeZOrder(data.zOrder, SC_ORDERABLE, [...SC_ORDERABLE]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function test(group, name, fn) {
  try {
    fn();
    results.push({ group, name, status: "PASS", detail: "" });
    passed++;
  } catch (e) {
    results.push({ group, name, status: "FAIL", detail: e.message.split("\n")[0] });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg ?? "assertion failed");
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── GROUP 1: LayerSchema itself is asset-agnostic ─────────────────────────────

test("LayerSchema", "parse({}) identical for all assets", () => {
  const ms_layer  = LayerSchema.parse({});
  const lb_layer  = LayerSchema.parse({});
  const sc_layer  = LayerSchema.parse({});
  assert(deepEqual(ms_layer, lb_layer),  "MotionScene == LogoBanner");
  assert(deepEqual(lb_layer, sc_layer),  "LogoBanner == StatsCard");
  assert(deepEqual(ms_layer, DEFAULT_LAYER), "matches DEFAULT_LAYER");
});

test("LayerSchema", "partial x=99 fills remaining with defaults", () => {
  const r = LayerSchema.parse({ x: 99 });
  assert(r.x === 99, "x preserved");
  assert(r.y === 0 && r.scale === 1 && r.opacity === 100 && r.blur === 0, "rest = defaults");
});

test("LayerSchema", "opacity boundaries: 0 and 100 both pass", () => {
  assert(LayerSchema.safeParse({ opacity: 0 }).success,   "opacity 0 ok");
  assert(LayerSchema.safeParse({ opacity: 100 }).success,  "opacity 100 ok");
  assert(!LayerSchema.safeParse({ opacity: 101 }).success, "opacity 101 fails");
  assert(!LayerSchema.safeParse({ opacity: -1 }).success,  "opacity -1 fails");
});

test("LayerSchema", "blur boundaries: 0 and 20 both pass", () => {
  assert(LayerSchema.safeParse({ blur: 0 }).success,   "blur 0 ok");
  assert(LayerSchema.safeParse({ blur: 20 }).success,  "blur 20 ok");
  assert(!LayerSchema.safeParse({ blur: 20.1 }).success, "blur 20.1 fails");
});

test("LayerSchema", "brightness boundaries: 0 and 200 both pass", () => {
  assert(LayerSchema.safeParse({ brightness: 0 }).success,   "brightness 0 ok");
  assert(LayerSchema.safeParse({ brightness: 200 }).success,  "brightness 200 ok");
  assert(!LayerSchema.safeParse({ brightness: 201 }).success, "brightness 201 fails");
});

// ── GROUP 2: LayerTextStyleSchema is key-agnostic ──────────────────────────────

test("LayerTextStyleSchema", "DEFAULT_LAYER_TEXT_STYLE derived correctly", () => {
  assert(DEFAULT_LAYER_TEXT_STYLE.color === "#C8E6C8", "default color");
  assert(DEFAULT_LAYER_TEXT_STYLE.bold === false,       "bold false");
  assert(DEFAULT_LAYER_TEXT_STYLE.maxWidth === 0,       "maxWidth 0");
});

test("LayerTextStyleSchema", "custom color override with rest defaulted", () => {
  const r = LayerTextStyleSchema.parse({ color: "#FF4141" });
  assert(r.color === "#FF4141", "color override");
  assert(r.bold === false && r.underline === false, "rest = defaults");
});

test("LayerTextStyleSchema", "same schema used for both 'title' and 'tagline' layer names", () => {
  // LBTextStyleSchema uses LayerTextStyleSchema for keys 'title' and 'tagline'
  const r = LBTextStyleSchema.parse({});
  assert(r.title.color === "#FFFFFF",   `title color: ${r.title.color}`);
  assert(r.tagline.color === "#AAAAAA", `tagline color: ${r.tagline.color}`);
  assert(r.title.bold === false && r.tagline.bold === false, "bool defaults");
});

test("LayerTextStyleSchema", "same schema used for 'value_text' and 'label'", () => {
  const r = SCTextStyleSchema.parse({});
  assert(r.value_text.color === "#00FF41", `value_text color: ${r.value_text.color}`);
  assert(r.label.color === "#9BA39E",      `label color: ${r.label.color}`);
});

// ── GROUP 3: sanitizeZOrder is asset-aware ────────────────────────────────────

test("sanitizeZOrder", "MotionScene: filters non-MotionScene keys", () => {
  const result = sanitizeZOrder(["folder", "logo", "ring"], MS_ORDERABLE, [...MS_ORDERABLE]);
  assert(deepEqual(result, ["folder"]), `Got: ${JSON.stringify(result)}`);
});

test("sanitizeZOrder", "LogoBanner: filters non-LogoBanner keys", () => {
  const result = sanitizeZOrder(["logo", "folder", "ring"], LB_ORDERABLE, [...LB_ORDERABLE]);
  assert(!result.includes("folder"), "MotionScene 'folder' removed from LogoBanner zOrder");
  assert(result.includes("logo") && result.includes("ring"), "logo+ring kept");
});

test("sanitizeZOrder", "MotionScene keys rejected by LogoBanner sanitizer", () => {
  // If someone pastes MotionScene zOrder into a LogoBanner item → all invalid
  const msDefault = [...MS_ORDERABLE];
  const result = sanitizeZOrder(msDefault, LB_ORDERABLE, [...LB_ORDERABLE]);
  assert(deepEqual(result, [...LB_ORDERABLE]), `Should reset to LB defaults, got: ${JSON.stringify(result)}`);
});

test("sanitizeZOrder", "LogoBanner keys rejected by MotionScene sanitizer", () => {
  const lbDefault = [...LB_ORDERABLE];
  const result = sanitizeZOrder(lbDefault, MS_ORDERABLE, [...MS_ORDERABLE]);
  assert(deepEqual(result, [...MS_ORDERABLE]), `Should reset to MS defaults, got: ${JSON.stringify(result)}`);
});

test("sanitizeZOrder", "keys with underscores (value_text) handled correctly", () => {
  const result = sanitizeZOrder(["value_text", "label"], SC_ORDERABLE, [...SC_ORDERABLE]);
  assert(result.includes("value_text") && result.includes("label"), `Got: ${JSON.stringify(result)}`);
});

test("sanitizeZOrder", "empty array → resets to default", () => {
  const r1 = sanitizeZOrder([], MS_ORDERABLE, [...MS_ORDERABLE]);
  const r2 = sanitizeZOrder([], LB_ORDERABLE, [...LB_ORDERABLE]);
  assert(deepEqual(r1, [...MS_ORDERABLE]), "MS: empty → defaults");
  assert(deepEqual(r2, [...LB_ORDERABLE]), "LB: empty → defaults");
});

// ── GROUP 4: zIdxOf is fully key-agnostic ────────────────────────────────────

test("zIdxOf", "works with MotionScene keys", () => {
  const order = ["folder", "card1", "badge"];
  assert(zIdxOf("background", order) === 0, "background = 0");
  assert(zIdxOf("folder", order)     === 1, "folder = 1");
  assert(zIdxOf("badge", order)      === 3, "badge = 3");
});

test("zIdxOf", "works with LogoBanner keys (logo, ring, title)", () => {
  const order = ["logo", "ring", "title", "tagline"];
  assert(zIdxOf("background", order) === 0, "background = 0");
  assert(zIdxOf("logo", order)       === 1, "logo = 1");
  assert(zIdxOf("tagline", order)    === 4, "tagline = 4");
});

test("zIdxOf", "works with underscored keys (value_text, bg_gradient)", () => {
  const order = ["bg_gradient", "chart", "value_text", "label", "icon"];
  assert(zIdxOf("bg_gradient", order) === 1, "bg_gradient = 1");
  assert(zIdxOf("value_text", order)  === 3, "value_text = 3");
  assert(zIdxOf("icon", order)        === 5, "icon = 5");
});

// ── GROUP 5: No cross-contamination between assets ────────────────────────────

test("Cross-asset", "MotionScene parse({}) has no LogoBanner keys", () => {
  const ms = parseMotionSceneMeta({});
  assert(!("logo" in ms.layers),    "no 'logo' in MotionScene layers");
  assert(!("title" in ms.layers),   "no 'title' in MotionScene layers");
  assert(!("tagline" in ms.layers), "no 'tagline' in MotionScene layers");
  assert("folder" in ms.layers,     "'folder' is present");
});

test("Cross-asset", "LogoBanner parse({}) has no MotionScene keys", () => {
  const lb = parseLogoBannerMeta({});
  assert(!("folder" in lb.layers),    "no 'folder' in LogoBanner layers");
  assert(!("headline" in lb.layers),  "no 'headline' in LogoBanner layers");
  assert(!("badge" in lb.layers),     "no 'badge' in LogoBanner layers");
  assert("logo" in lb.layers,         "'logo' is present");
});

test("Cross-asset", "StatsCard parse({}) has no keys from other assets", () => {
  const sc = parseStatsCardMeta({});
  assert(!("folder" in sc.layers),   "no 'folder'");
  assert(!("logo" in sc.layers),     "no 'logo'");
  assert("value_text" in sc.layers,  "'value_text' is present");
  assert("bg_gradient" in sc.layers, "'bg_gradient' is present");
});

test("Cross-asset", "textStyle keys are fully isolated per asset", () => {
  const ms = parseMotionSceneMeta({});
  const lb = parseLogoBannerMeta({});
  const sc = parseStatsCardMeta({});
  assert("headline" in ms.textStyle, "MS has headline textStyle");
  assert("subline"  in ms.textStyle, "MS has subline textStyle");
  assert(!("title"  in ms.textStyle), "MS does NOT have title textStyle");
  assert("title"   in lb.textStyle, "LB has title textStyle");
  assert("tagline" in lb.textStyle, "LB has tagline textStyle");
  assert(!("headline" in lb.textStyle), "LB does NOT have headline textStyle");
  assert("value_text" in sc.textStyle, "SC has value_text textStyle");
  assert(!("headline" in sc.textStyle), "SC does NOT have headline textStyle");
});

test("Cross-asset", "modifying LogoBanner does not affect MotionScene defaults", () => {
  const ms = parseMotionSceneMeta({});
  const lb = parseLogoBannerMeta({ layers: { logo: { x: 500 } } });
  // MotionScene layers unaffected
  assert(ms.layers.folder.x === 0, "MS folder.x still 0");
  assert(lb.layers.logo.x   === 500, "LB logo.x = 500");
});

// ── GROUP 6: Per-asset parse functions independent ────────────────────────────

test("Asset independence", "LogoBanner null → no crash, returns LB defaults", () => {
  const lb = parseLogoBannerMeta(null);
  assert(lb.title === "D1AGENCY",     `title: ${lb.title}`);
  assert(lb.tagline.includes("bold"), `tagline: ${lb.tagline}`);
  assert("logo" in lb.layers,         "logo layer present");
});

test("Asset independence", "StatsCard corrupt → no crash, returns SC defaults", () => {
  const sc = parseStatsCardMeta("not an object");
  assert(sc.value_text === "$1,234",           `value_text: ${sc.value_text}`);
  assert(sc.label === "Monthly Revenue",       `label: ${sc.label}`);
  assert(sc.textStyle.value_text.color === "#00FF41", "value_text color default");
});

test("Asset independence", "MotionScene zOrder corrupt with LB keys → reset", () => {
  const ms = parseMotionSceneMeta({ zOrder: ["logo", "ring", "title"] });
  assert(deepEqual(ms.zOrder, [...MS_ORDERABLE]), `Should reset to MS defaults, got: ${JSON.stringify(ms.zOrder)}`);
});

test("Asset independence", "LogoBanner zOrder corrupt with MS keys → reset", () => {
  const lb = parseLogoBannerMeta({ zOrder: ["folder", "card1", "badge"] });
  assert(deepEqual(lb.zOrder, [...LB_ORDERABLE]), `Should reset to LB defaults, got: ${JSON.stringify(lb.zOrder)}`);
});

// ── GROUP 7: LayerConfig props work identically for different asset layer names ─

test("LayerConfig reuse", "logo layer uses same 9 props as folder layer", () => {
  const lb = parseLogoBannerMeta({ layers: { logo: { x: 100, scale: 1.5, blur: 2 } } });
  const expected = { ...DEFAULT_LAYER, x: 100, scale: 1.5, blur: 2 };
  assert(deepEqual(lb.layers.logo, expected), `logo layer: ${JSON.stringify(lb.layers.logo)}`);
});

test("LayerConfig reuse", "value_text layer uses same 9 props as headline layer", () => {
  const sc = parseStatsCardMeta({ layers: { value_text: { opacity: 80, fromFrame: 10 } } });
  const expected = { ...DEFAULT_LAYER, opacity: 80, fromFrame: 10 };
  assert(deepEqual(sc.layers.value_text, expected), `value_text layer: ${JSON.stringify(sc.layers.value_text)}`);
});

test("LayerConfig reuse", "all 3 assets produce same DEFAULT_LAYER for unmodified layers", () => {
  const ms = parseMotionSceneMeta({});
  const lb = parseLogoBannerMeta({});
  const sc = parseStatsCardMeta({});
  // Each asset's first orderable layer should equal DEFAULT_LAYER
  assert(deepEqual(ms.layers.folder,     DEFAULT_LAYER), "MS folder = DEFAULT_LAYER");
  assert(deepEqual(lb.layers.logo,       DEFAULT_LAYER), "LB logo = DEFAULT_LAYER");
  assert(deepEqual(sc.layers.bg_gradient,DEFAULT_LAYER), "SC bg_gradient = DEFAULT_LAYER");
});

// ── Report ─────────────────────────────────────────────────────────────────────

const GROUPS = [...new Set(results.map(r => r.group))];

console.log("\n" + "═".repeat(84));
console.log(" ZOD REUSABILITY TEST REPORT");
console.log(" Assets: MotionScene · LogoBanner · StatsCard");
console.log("═".repeat(84));

for (const g of GROUPS) {
  const groupResults = results.filter(r => r.group === g);
  const gPass = groupResults.filter(r => r.status === "PASS").length;
  const gFail = groupResults.filter(r => r.status === "FAIL").length;
  const gIcon = gFail === 0 ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`\n ${gIcon} \x1b[1m${g}\x1b[0m  (${gPass}/${groupResults.length} pass)`);

  for (const r of groupResults) {
    const icon   = r.status === "PASS" ? "\x1b[32m  ✓\x1b[0m" : "\x1b[31m  ✗\x1b[0m";
    const detail = r.status === "FAIL" ? `  \x1b[33m← ${r.detail}\x1b[0m` : "";
    console.log(`${icon} ${r.name}${detail}`);
  }
}

console.log("\n" + "═".repeat(84));
console.log(` TOTAL: ${passed + failed} tests | \x1b[32mPASS: ${passed}\x1b[0m | \x1b[31mFAIL: ${failed}\x1b[0m`);
console.log("═".repeat(84) + "\n");

if (failed > 0) process.exit(1);
