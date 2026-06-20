/**
 * test-motion-schema.mjs
 * Chạy sau khi làm xong motion-scene.tsx để verify:
 *   1. Mỗi layer parse đúng với default
 *   2. Partial input được merge với default đúng
 *   3. zOrder sanitize đúng
 *   4. accentColor truyền qua đúng
 *
 * Usage: node src/scripts/test-motion-schema.mjs
 */

import { z } from 'zod';

// ─── Copy từ _shared.ts (không import trực tiếp vì ESM path) ─────────────────
const LayerSchema = z.object({
  x:              z.number().default(0),
  y:              z.number().default(0),
  scale:          z.number().default(1),
  rotate:         z.number().default(0),
  opacity:        z.number().min(0).max(100).default(100),
  fromFrame:      z.number().default(0),
  durationFrames: z.number().default(9999),
  blur:           z.number().min(0).max(20).default(0),
  brightness:     z.number().min(0).max(200).default(100),
  entranceEffect:   z.string().default('fade'),
  backgroundEffect: z.string().default('none'),
  effectDuration:   z.number().min(0).max(120).default(0),
  effectIntensity:  z.number().min(0).max(200).default(100),
});

const LayerTextStyleSchema = z.object({
  bold:          z.boolean().default(false),
  underline:     z.boolean().default(false),
  textTransform: z.enum(['none', 'uppercase', 'lowercase']).default('none'),
  color:         z.string().default('#C8E6C8'),
  textAlign:     z.enum(['left', 'center', 'right']).default('center'),
  strokeWidth:   z.number().min(0).max(10).default(0),
  strokeColor:   z.string().default('#00FF41'),
  maxWidth:      z.number().min(0).max(800).default(0),
});

const sanitizeZOrder = (zOrder, orderableKeys, defaultOrder) => {
  const valid = zOrder.filter((k) => orderableKeys.includes(k));
  return valid.length === 0 ? defaultOrder : valid;
};

// ─── Scene schemas ────────────────────────────────────────────────────────────
const ORDERABLE_KEYS = ['card', 'icon', 'text'];

const CardSchema = LayerSchema.extend({ cardBg: z.string().default('rgba(10, 11, 10, 0.4)') });
const IconSchema = LayerSchema;
const TextSchema = LayerSchema.merge(LayerTextStyleSchema).extend({
  content: z.string().default('first one: AI music method'),
});

const RawSchema = z.object({
  card:        CardSchema.optional(),
  icon:        IconSchema.optional(),
  text:        TextSchema.optional(),
  accentColor: z.string().optional(),
  zOrder:      z.array(z.string()).optional(),
});

const parseMotionSceneMeta = (metadata) => {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d   = raw.success ? raw.data : {};
  return {
    card:        CardSchema.parse(d.card ?? {}),
    icon:        IconSchema.parse(d.icon ?? {}),
    text:        TextSchema.parse(d.text ?? {}),
    accentColor: d.accentColor ?? '#00FF41',
    zOrder:      sanitizeZOrder(d.zOrder ?? [], ORDERABLE_KEYS, [...ORDERABLE_KEYS]),
  };
};

// ─── TESTS ───────────────────────────────────────────────────────────────────
let pass = 0; let fail = 0;

function check(label, condition) {
  if (condition) { console.log(`  ✅ ${label}`); pass++; }
  else           { console.error(`  ❌ ${label}`); fail++; }
}

console.log('\n── Test 1: Empty metadata → all defaults');
const t1 = parseMotionSceneMeta({});
check('card.opacity === 100',              t1.card.opacity === 100);
check('card.cardBg có giá trị',            typeof t1.card.cardBg === 'string');
check('icon.scale === 1',                  t1.icon.scale === 1);
check('text.content là default',           t1.text.content === 'first one: AI music method');
check('text.color là default (#C8E6C8)',   t1.text.color === '#C8E6C8');
check('text.textAlign === center',         t1.text.textAlign === 'center');
check('accentColor === #00FF41',           t1.accentColor === '#00FF41');
check('zOrder đúng 3 layers',             t1.zOrder.join(',') === 'card,icon,text');

console.log('\n── Test 2: Partial override');
const t2 = parseMotionSceneMeta({
  card:        { opacity: 80, cardBg: '#111' },
  text:        { content: 'Custom text', color: '#FF0000', bold: true },
  accentColor: '#FF00FF',
});
check('card.opacity === 80',               t2.card.opacity === 80);
check('card.cardBg === #111',              t2.card.cardBg === '#111');
check('card.scale === 1 (default giữ)',    t2.card.scale === 1);
check('text.content === Custom text',      t2.text.content === 'Custom text');
check('text.color === #FF0000',            t2.text.color === '#FF0000');
check('text.bold === true',               t2.text.bold === true);
check('text.textAlign giữ default',        t2.text.textAlign === 'center');
check('accentColor === #FF00FF',           t2.accentColor === '#FF00FF');

console.log('\n── Test 3: zOrder sanitize');
const t3 = parseMotionSceneMeta({ zOrder: ['text', 'card', 'icon'] });
check('zOrder reversed',                   t3.zOrder.join(',') === 'text,card,icon');

const t3b = parseMotionSceneMeta({ zOrder: ['unknown', 'fake'] });
check('zOrder invalid → reset default',    t3b.zOrder.join(',') === 'card,icon,text');

console.log('\n── Test 4: null / undefined metadata');
check('null → không crash',               (() => { try { parseMotionSceneMeta(null); return true; } catch { return false; } })());
check('undefined → không crash',          (() => { try { parseMotionSceneMeta(undefined); return true; } catch { return false; } })());
check('string rác → không crash',         (() => { try { parseMotionSceneMeta('garbage'); return true; } catch { return false; } })());

console.log(`\n${'─'.repeat(40)}`);
console.log(`Kết quả: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
