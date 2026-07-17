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

## motionScene — metadata theo `kind` (49 kind đã dựng)

> Kind lạ / thiếu → editor render `default`. `bgColor:"transparent"` = keyable (mặc định). Style layer
> (kicker/title/value…) dùng field của TextLayer: `color, x, y, scale, bold, italic, textAlign,
> textTransform, lineHeight, maxWidth`.
>
> **Toàn bộ 49 kind khả dụng** (mô tả + khi nào dùng: xem [scene-catalog.md](scene-catalog.md)):
> - Opener: `hook_title` `cinematic_title` `title_card`
> - Text: `word_pop` `kinetic_statement` `callout` `quote_pull` `headline_card`
> - Số/data: `stat_punch` `metric_reveal` `stat_grid` `bar_chart` `bar_overlay` `inline_chart` `dashboard_card`
> - Sequence: `vertical_timeline` `horizontal_timeline` `progress_steps` `ticker_feed` `bulleted_list` `bullet_burst` `list` `calendar_months` `command_deck`
> - Diagram: `concept_build` `flow_diagram` `network_diagram` `org_diagram` `layer_stack` `network_spread` `annotated_screenshot`
> - People/logo: `portrait_burst` `tool_logo_burst` `agent_avatar_burst` `ratio_dots`
> - Image/media: `image_card` `ai_image_on_grid` `split_reveal`
> - Misc: `chat_message` `subscribe` `comparison_grid`
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

## audio item (SFX / nhạc bed)
```jsonc
{ "id":"sfx1","type":"audio","display":{"from":3000,"to":3400},"duration":400,
  "details":{ "src":"/public/sfx/whoosh.wav", "volume":60 }, "animations":{} }
```
- Canh `display.from` khớp sự kiện motion (xem [sfx-rules.md](sfx-rules.md)). Nhạc bed = một audio item dài,
  volume thấp, duck thủ công ở đoạn có giọng.

## Đầu ra render
- `node scripts/render-design.mjs <design.json>` → **MP4 đục** (mặc định — video hoàn chỉnh: video nguồn +
  overlay baked). Đây là luồng chính.
- Thêm `--transparent` → **WebM/vp9-alpha** (overlay keyable để ghép ở CapCut/Resolve) — chỉ cho design
  chỉ-có-overlay, không có video nền.

## Quy tắc khi AI ghi design.json
- `display.from/to` (MS) = vị trí beat trên timeline; `appearSec` (giây) = trong beat.
- Overlay motion và video nguồn nên ở **track riêng** để chồng lên nhau (motion phủ lên video).
- Chroma-safe + nền trong suốt cho overlay keyable (xem [repo-constraints.md](repo-constraints.md)).
- Sau khi ghi, validate nhanh: mỗi id trong `trackItemIds` có trong `trackItemsMap`; mỗi track `items` trỏ id hợp lệ.
