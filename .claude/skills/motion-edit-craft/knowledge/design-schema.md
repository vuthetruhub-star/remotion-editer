# Design Schema — shape của `design.json` mà editor nạp được

> Đây là artifact PHA 2 xuất ra: một JSON = vừa kế hoạch vừa bản thực thi. User bấm **Import design JSON**
> (nút mũi tên lên trên navbar) → editor `dispatch(DESIGN_LOAD)` → hiện lên timeline để chỉnh/duyệt/export.
> Mọi thời gian trên TIMELINE tính bằng **mili-giây** (`display.from/to`). `appearSec` trong metadata của
> một beat tính bằng **giây, tương đối so với đầu beat đó** (không phải thời gian tuyệt đối của video).

## Khung ngoài
```jsonc
{
  "id": "string",
  "fps": 30,
  "size": { "width": 1080, "height": 1920 },
  "tracks": [
    { "id": "track-1", "type": "video", "name": "Main",
      "accepts": ["text","image","video","audio","composition","caption","template","motionScene"],
      "items": ["<id>", "..."], "magnetic": false, "static": false }
  ],
  "trackItemIds": ["<id>", "..."],   // mọi item id, theo thứ tự
  "transitionsMap": {},
  "trackItemsMap": { "<id>": { /* track item */ } }
}
```
- Nhiều track được (đặt trên nhiều dòng timeline): thường 1 track cho video nguồn, 1 track cho motion overlay,
  1 cho caption, 1 cho audio/SFX. Mỗi track `items` liệt kê id theo thứ tự; `trackItemIds` gộp tất cả.

## Track item — field chung
```jsonc
{
  "id": "b1", "name": "Hook", "type": "motionScene",   // hoặc video | caption | audio | text | image
  "display": { "from": 0, "to": 3000 },  // MS trên timeline
  "duration": 3000,                       // = to - from
  "details": { /* tuỳ type */ },
  "animations": {},
  "metadata": { /* chỉ motionScene */ }
}
```
`details` chuẩn cho motionScene (copy nguyên): `{ "width":1080,"height":1920,"top":0,"left":0,"opacity":100,
"transform":"none","rotate":"0deg","blur":0,"brightness":100,"flipX":false,"flipY":false,
"visibility":"visible","borderRadius":0,"borderWidth":0,"borderColor":"transparent",
"boxShadow":{"color":"transparent","x":0,"y":0,"blur":0} }`

## motionScene — metadata theo `kind` (54 kind đã dựng)

> Kind lạ / thiếu → editor render `default`. `bgColor:"transparent"` = keyable (mặc định). Style layer
> (kicker/title/value…) dùng field của TextLayer: `color, x, y, scale, bold, italic, textAlign,
> textTransform, lineHeight, maxWidth`.
>
> **Toàn bộ 54 kind khả dụng** (mô tả + khi nào dùng: xem [scene-catalog.md](scene-catalog.md)):
> - Opener: `hook_title` `cinematic_title` `title_card`
> - Text: `word_pop` `kinetic_statement` `callout` `quote_pull` `headline_card`
> - Số/data: `stat_punch` `metric_reveal` `stat_grid` `bar_chart` `bar_overlay` `inline_chart` `dashboard_card`
> - Sequence: `vertical_timeline` `horizontal_timeline` `progress_steps` `ticker_feed` `bulleted_list` `bullet_burst` `list` `calendar_months` `command_deck`
> - Diagram: `concept_build` `flow_diagram` `network_diagram` `org_diagram` `layer_stack` `network_spread` `annotated_screenshot`
> - People/logo: `portrait_burst` `tool_logo_burst` `agent_avatar_burst` `ratio_dots`
> - Image/media: `image_card` `ai_image_on_grid` `split_reveal`
> - Misc: `chat_message` `subscribe` `comparison_grid`
> - Explainer scaffold (đa-màu theo vai trò, học từ reference): `structure_scaffold` `open_loop_stack` `antithesis_split` `floating_stats` `doodle_scribble`
> - ⚠️ Tránh trên Short (card/landscape): `vs_split` `lower_third` `chapter_bar` `keyword_chips` `side_panel` `corner_stat` `notification_toast`
> - Base (native item type, KHÔNG phải motionScene): ảnh = `type:"image"`, video = `type:"video"`, icon = `type:"image"`.
>
> **Field metadata chính xác của MỖI kind** = đọc `defaultMeta` trong file module
> `src/features/editor/player/items/motion-scenes/<kind>.tsx` (dấu gạch nối, vd `stat-punch.tsx`) — nó liệt
> kê đúng field + kiểu. Quy ước chung: content/scalar để top-level; nhóm item lặp là `item1..N` / `step1..N` /
> `bar1..N` / `node1..N` (mỗi cái một object con). `appearSec` = giây tương đối đầu beat.

**hook_title** (mở đầu, title NGẮN ≤16 ký tự):
```jsonc
{ "kind":"hook_title", "bgColor":"transparent",
  "kicker":"TWO PEOPLE · WITH AI", "title":"$400,000,000",
  "kickerStyle":{"color":"#00FF41"}, "titleStyle":{"color":"#FFFFFF"} }
```
**stat_punch** (một số hero + caption):
```jsonc
{ "kind":"stat_punch", "bgColor":"transparent",
  "value":"10×", "caption":"FASTER SHIPPING",
  "valueStyle":{"color":"#FFFFFF"}, "captionStyle":{"color":"#00FF41"} }
```
**word_pop** (chữ pop cardless, tối đa 4 item; `appearSec` giây từ đầu beat; `accent` = lime):
```jsonc
{ "kind":"word_pop", "bgColor":"transparent", "vertical":0.72,
  "item1":{"text":"ChatGPT","appearSec":0.2},
  "item2":{"text":"Claude","appearSec":1.1,"accent":true},
  "item3":{"text":"Grok","appearSec":2.0} }
```
**vertical_timeline** (rail + tối đa 4 step; `appearSec` giây từ đầu beat):
```jsonc
{ "kind":"vertical_timeline", "bgColor":"#0A0B0A",
  "step1":{"heading":"Model routing","appearSec":0.3},
  "step2":{"heading":"/compact at 60%","appearSec":1.3},
  "step3":{"heading":"CLAUDE.md < 1k tokens","appearSec":2.3} }
```
**default** (scene chữ cũ):
```jsonc
{ "kind":"default", "background":{"color":"#0A0B0A"}, "headline":{"color":"#00FF41"}, "icon":{} }
```

## video item (video nguồn + ZOOM theo thời gian)
```jsonc
{ "id":"vid","type":"video","display":{"from":0,"to":95000},"duration":95000,
  "details":{ "src":"<url hoặc /public path>", "width":1080,"height":1920,"top":0,"left":0,"volume":100,
              "zoom":{"from":1.0,"to":1.08} },   // Ken Burns/punch-in; bỏ zoom = không phóng
  "trim":{"from":0,"to":95000}, "playbackRate":1, "animations":{} }
```
- `zoom.from→to` là scale, nội suy ease-in-out suốt độ dài item; container overflow-hidden nên >1 = punch-in.
- Muốn punch-in NHẤN một đoạn ngắn → cắt video thành item riêng cho đoạn đó với `zoom` mạnh hơn.

## caption item (dùng hệ caption sẵn có)
```jsonc
{ "id":"cap1","type":"caption","display":{"from":0,"to":3000},"duration":3000,
  "details":{ "words":[{"word":"Hello","start":0,"end":600},{"word":"world","start":600,"end":1200}],
              "fontFamily":"Geist","fontSize":64,"color":"#DADADA",
              "appearedColor":"#FFFFFF","activeColor":"#00FF41" },
  "animations":{} }
```
- `words[].start/end` là MS **tương đối so với `display.from` của caption item**. Cadence/preset: xem
  [caption-rules.md](caption-rules.md).
- ⚠️ **Caption type KHÔNG đáng tin khi render** (nhồi cả transcript vào 1 item → đổ hết cùng lúc; set field
  windowing → không hiện gì). Để BAKE caption word-by-word, DÙNG kind **`caption_word`** (motionScene, kiểm
  soát hoàn toàn): mỗi cụm (~2–3 từ) = 1 item `{"kind":"caption_word","text":"...","vertical":0.58,"size":56,
  "accent":true/false}`, `display`=[start,end] cụm. **TẮT caption dưới beat chữ nhiều** (word_pop/hook_title/
  vertical_timeline/open_loop_stack) — bỏ cụm rơi vào các khoảng đó (caption-rules §5). Xem generator mẫu
  `~/edit-taste-analysis/0605/build.mjs`.

## audio item (SFX / nhạc bed)
```jsonc
{ "id":"sfx1","type":"audio","display":{"from":3000,"to":3400},"duration":400,
  "details":{ "src":"/public/sfx/whoosh.wav", "volume":60 }, "animations":{} }
```
- Canh `display.from` khớp sự kiện motion (xem [sfx-rules.md](sfx-rules.md)). Nhạc bed = một audio item dài,
  volume thấp, duck thủ công ở đoạn có giọng.

## Đầu ra render
- `node scripts/render-design.mjs <design.json>` → **MP4 đục** (mặc định). `--scale` phải cho ra kích thước
  NGUYÊN (vd 1080×1920×1.3333=2559.9 → LỖI; dùng `--scale 1` rồi phóng ở ffmpeg).
- ⚠️ **`--transparent` (WebM/vp9-alpha) hiện HỎNG** — ra alpha ĐỤC (nền đen đặc), không key được. Đừng dựa vào nó.

**CÁCH XUẤT VIDEO HOÀN CHỈNH đã kiểm chứng (overlay + video nguồn, giữ tiếng):**
```bash
# 1) render overlay (design chỉ-overlay, nền đen mặc định) ở scale nguyên
node scripts/render-design.mjs design.json overlay-black.mp4 --scale 1
# 2) key nền đen + phóng khớp video + ghép lên video gốc (giữ audio gốc)
ffmpeg -i source.mp4 -i overlay-black.mp4 -filter_complex \
 "[1:v]scale=<W>:<H>,colorkey=0x000000:0.01:0.0[ov];[0:v][ov]overlay=format=auto:eof_action=pass[v]" \
 -map "[v]" -map 0:a? -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac final.mp4
```
- `colorkey` tolerance **0.01** (chặt) → chỉ key đen tuyệt đối, GIỮ viền tối của chữ (WebkitTextStroke) làm tương phản trên nền sáng.
- Pill nền đục (floating_stats rgba ~#121) KHÔNG bị key → thành nền chip có chủ ý (đọc rõ).
- Đây là luồng chính hiện tại thay cho `--transparent`. Ví dụ đầy đủ: `~/edit-taste-analysis/0605/`.

## Quy tắc khi AI ghi design.json
- `display.from/to` (MS) = vị trí beat trên timeline; `appearSec` (giây) = trong beat.
- Overlay motion và video nguồn nên ở **track riêng** để chồng lên nhau (motion phủ lên video).
- Chroma-safe + nền trong suốt cho overlay keyable (xem [repo-constraints.md](repo-constraints.md)).
- Sau khi ghi, validate nhanh: mỗi id trong `trackItemIds` có trong `trackItemsMap`; mỗi track `items` trỏ id hợp lệ.
