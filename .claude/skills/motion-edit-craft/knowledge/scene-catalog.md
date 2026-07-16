# Scene Catalog — 50 loại overlay, dựng lại theo pattern repo bạn

> Đây là **menu ý tưởng scene + recipe**, KHÔNG phải code có sẵn. Mỗi "kind" là một thiết kế overlay từ
> pipeline gốc; recipe dưới đây map nó sang pattern 2-file của repo (`motion-config.ts` TIMING beats +
> `motion-scene.tsx` với `TextLayerSchema`/`AssetLayerSchema`/`BackgroundSchema`).
>
> **Cách đọc mỗi recipe:**
> - **Shape** — thuộc nhóm nào (để map từ taste-rules §3).
> - **Khi nào** — beat nội dung nào gọi nó.
> - **Layers** — dựng bằng schema layer nào + field nội dung cần (nội dung là data, không phải style hardcode).
> - **TIMING** — gợi ý cấu trúc beat (giây).
> - **Taste** — cảnh báo/mẹo để không rơi vào bản "template rẻ tiền".
>
> **Brand áp cho tất cả:** accent `#00FF41` (`colors.primary`), font Geist, canvas 1080×1920. Easing
> `s4ei/s4eo/s4vis/s4eb`. **1 accent lime mỗi frame.** Giá trị cụ thể → `brand.ts` hoặc reference (trục A);
> recipe chỉ định *cấu trúc & cách thể hiện* (trục B).
>
> ⚠️ **Nền tối / glass-blur / vignette trong các recipe dưới chỉ đúng khi output là scene BAKED.** Repo mặc
> định xuất **overlay keyable nền TRONG SUỐT** — đọc [repo-constraints.md](repo-constraints.md) trước khi
> áp nền tối hay bất kỳ blur/glow nào (luật chroma-key-safe). Khi mâu thuẫn, repo-constraints thắng.
>
> **Ký hiệu:** ⛔ = tránh dùng (xem taste-rules §10) · 🟢 = cardless, OK trên short · 🟡 = có card nền, chỉ
> landscape/longform · 🎬 = full takeover · ▲ = partial overlay (speaker/nền vẫn thấy).

---

## A. HOOK / OPENER

### `hook_title` 🎬 — cold-open lockup (BẮT BUỘC mở video)
- **Shape:** opener. **Khi nào:** frame 0, câu hook/lời hứa/con số lớn nhất.
- **Layers:** 1 TextLayer `kicker` (nhỏ, letter-spaced, accent) + 1 TextLayer `title` (hero, lớn). Optional
  AssetLayer `logo` (tile bo góc) nếu hook nêu brand thật.
- **TIMING:** `intro`(0→~0.5) kicker settle → rule vẽ → hero un-blur; `hold`; `outro` fade. Tổng ~3–4s.
- **Taste:** `title` NGẮN (≤16 ký tự, ≤2 dòng) — stat/chi tiết để ở `kicker`. Mở bằng zoom-IN nhẹ→settle,
  KHÔNG pulse. Nếu hook nêu công ty thật → show logo từ frame 0. Đây là "premium treatment", khác `word_pop`.

### `cinematic_title` 🎬 — chương lớn (longform)
- **Shape:** section opener. **Khi nào:** chuyển chương ở video 5+ phút (cap ~4 lần/15 phút).
- **Layers:** TextLayer `kicker` + `chapter` (số lớn) + `title` + `subtitle`. Background tối + divider lime vẽ.
- **TIMING:** curtain wipe → kicker → số slam-in → divider draw → title slide → subtitle. ~3–4.5s.
- **Taste:** chỉ cho landscape/longform, không cho short (quá nặng cho 30s).

### `title_card` 🎬 — mở mục nhẹ
- **Shape:** section opener (nhẹ hơn cinematic_title). **Khi nào:** đầu một mục.
- **Layers:** TextLayer `number` (lime lớn) + `title` (hộp đen chữ trắng, offset shadow lime) + `subtitle`.
- **TIMING:** ~2.5–4s. **Taste:** cô lập khối offset lime vào hộp title, không tràn sang cột số.

---

## B. HERO TAKEOVER — TEXT / TUYÊN BỐ

### `word_pop` 🟢🎬/▲ — chữ pop cardless (workhorse của short)
- **Shape:** emphasis/enumeration. **Khi nào:** phản ứng counter-claim, liệt kê nhanh 3-4 từ, câu CTA.
- **Layers:** mảng items, mỗi item 1 TextLayer `text` + `appear_sec`. Không card, không nền — chữ đè trực tiếp.
- **TIMING:** mỗi item fade-in 7 frame + scale 0.92→1.0, cross-fade sang item sau.
- **Taste:** `vertical` mặc định 0.72 (lower-third, dưới cằm). Mixed-font: bọc `{...}` để phần đó thành script
  (handwritten, tự lime) — "FUTURE OF {solo business}". Đừng bọc CẢ item. `accent:true` để phần block thành lime.
  Đây là loại text-overlay DUY NHẤT được phép trên short (cardless).

### `kinetic_statement` 🟢🎬/▲ — chữ động từng-từ khớp giọng
- **Shape:** emphasis. **Khi nào:** câu tuyên bố mạnh muốn hiện từng từ theo lời.
- **Layers:** mảng `words[]` mỗi từ `text`+`appear_sec`(+`emphasis`). Có mode `overlay` (lower-third 1 hàng).
- **TIMING:** mỗi từ mask-rise + motion-blur settle. **Taste:** overlay mode auto-shrink để 1 hàng không wrap.

### `callout` 🎬/▲ — câu + một cụm highlight
- **Shape:** punchline/claim. **Khi nào:** một câu chốt với đúng một cụm cần bật.
- **Layers:** TextLayer `callout_prefix` + `callout_highlight` (khối lime) + `callout_suffix`.
- **Taste:** overlay mode auto-shrink 1 hàng. Trên short, dùng như takeover full — mode có khối lime là chấp nhận
  khi full-screen, không phải sticker.

### `quote_pull` 🎬 — trích dẫn typewriter (câu takeaway)
- **Shape:** takeaway. **Khi nào:** một câu chốt/quote đáng để đứng một mình.
- **Layers:** TextLayer `quote_text` (gõ ra) + `attribution`.
- **TIMING:** tốc độ gõ (`chars_per_second`) canh để gõ xong đúng lúc người nói xong. **Dwell ≥2.0s sau khi
  gõ xong** để đọc kịp — đây là toàn bộ ý nghĩa của quote pull.

### `headline_card` 🟡▲ — mẩu tin thật (bottom-half glass)
- **Shape:** bằng chứng thật. **Khi nào:** "đây là chuyện có thật đang xảy ra" (thị trường, sự kiện, số liệu).
- **Layers:** TextLayer `source` (masthead lime) + `headline` (hỗ trợ `\n` + 1 span `{lime}`) + `dek` (mờ).
- **Taste:** điền số/tiêu đề THẬT từ WebSearch — stat thật = bằng chứng. Đừng dùng ẩn dụ AI cho việc có tin thật.

---

## C. HERO TAKEOVER — SỐ / DỮ LIỆU

### `stat_punch` 🎬 — một con số hero
- **Shape:** magnitude. **Khi nào:** một con số duy nhất cần cảm nhận ("$400M", "6 THÁNG").
- **Layers:** TextLayer `preLabel` + `value` (khổng lồ) + `caption`.
- **Taste:** auto-shrink theo TỪ DÀI NHẤT trong `value` để fit 88% khung. Token ngắn ("10×" hơn "TEN TIMES").
  Bắt buộc có cả `value` VÀ `caption` — số trần không context = vô nghĩa.

### `metric_reveal` 🎬 — số đếm lên (count-up)
- **Shape:** magnitude/growth. **Khi nào:** con số "kiếm được"/tăng trưởng — giàu hơn stat_punch.
- **Layers:** TextLayer `pre_label` + prefix/`target`/suffix + `caption`. `duration_sec`, `decimals`.
- **Taste:** đếm 0→target bằng spring. Khoá số thập phân từ frame 1 để không reflow layout.

### `stat_grid` 🎬 — lưới 2–6 mini-stat
- **Shape:** magnitude (nhiều). **Khi nào:** vài con số cùng thuộc một bức tranh.
- **Layers:** mảng `stats[]` mỗi ô TextLayer `value`+`label`(+`delta`,`appear_sec`). Auto layout 2×2/1×3/2×3.
- **Taste:** value tĩnh (không count-up — cần đếm thì dùng metric_reveal). Tối đa 6.

### `bar_chart` 🎬 — biểu đồ cột full-screen
- **Shape:** so sánh magnitude (rời rạc). **Khi nào:** so nhiều giá trị, cần cả khung.
- **Layers:** mảng `bars[]` mỗi cột `label`+`value`(+`display`,`highlight`,`appear_sec`). `orientation`, `max`.
- **Taste:** tối đa 6 cột, chỉ MỘT cột `highlight` (1 accent/frame). Cột mọc bằng eased tick-up.

### `bar_overlay` 🟢▲ — biểu đồ cột lower-third (speaker vẫn thấy)
- **Shape:** so sánh magnitude nhẹ. **Khi nào:** "cắt chi phí", "10× doanh thu" — chart nhỏ không takeover.
- **Layers:** mảng `bars[]` (`label`,`value`,`display?`,`highlight?`,`appear_sec?`), `vertical`.
- **Taste:** layout HỘP CỨNG (top+height cố định từng vùng) để spring không tràn. Value label NẰM TRONG cột.
  2-cột có `display` số thật → tự hiện chip delta ("−84%"); KHÔNG có display = không chip (đừng bịa %).
  Cột đếm/enumerate cần `appear_sec` per-bar để không pop hết cùng lúc.

### `inline_chart` 🟢▲ — line-graph xu hướng liên tục
- **Shape:** trend/distribution. **Khi nào:** "tăng tuyến tính", "tụt/tanked", phân bố.
- **Layers:** `data[]` (số) + `labels?` + `draw_duration`, `vertical`. Card glass lower-mid.
- **Taste:** line vẽ trái→phải, dot lime dẫn đầu. Data giảm dần cho "tanked/crashed". Canh `draw_duration` khớp
  độ dài lời giải thích. Khác bar_overlay (rời rạc) — cái này là đường liền.

### `dashboard_card` 🟢▲ — mock dashboard SaaS
- **Shape:** "metrics/monitoring/mọi thứ đều xanh". **Khi nào:** nhắc dashboard/KPI/"nhìn ấn tượng trên giấy".
- **Layers:** `title` + `stats[]` (2×2, `label`+`value`+`trend`) + `sparkline?`. Khung cửa sổ Mac + chấm "LIVE".
- **Taste:** số integer tự count-up bằng spring. Sparkline deterministic theo index.

---

## D. HERO TAKEOVER — SƠ ĐỒ / CONCEPT

### `concept_build` 🎬 — canvas explainer tự do (FLAGSHIP)
- **Shape:** structure/metaphor/annotation — thứ không vừa layout cứng. **Khi nào:** dựng cấu trúc, ẩn dụ, "X
  nằm trong Y". Là vũ khí chính cho taste-rules §4 (metaphor canvas, progressive build).
- **Layers:** `elements[]` (mỗi cái `label`,`glyph?`/`sublabel?`, vị trí `x`,`y` 0–1, `variant`:
  box|chip|tile|frame|note, `emphasis?`, `appear_sec`) + `connectors[]` (`from`,`to`,`label?`,`flowing?`,
  `appear_sec`). `variant:"frame"` = khung bao quanh thứ khác.
- **TIMING:** LUÔN so le `appear_sec` theo lời — cả điểm là dựng sống. Connector *vẽ*, không "hiện".
- **Taste:** nền tối, element enter bằng blur-settle, canvas có living-hold drift, exit dissolve. Nếu trông như
  SmartArt PowerPoint = sai.

### `flow_diagram` 🎬 — pipeline A→B→C ngang
- **Shape:** sequence. **Khi nào:** quy trình tuyến tính có thứ tự.
- **Layers:** `nodes[]` (`label`,`description?`,`glyph?`,`highlight?`,`appear_sec`). Mũi tên vẽ nối.
- **Taste:** ≤5 node. Mũi tên vào node vẽ NGAY TRƯỚC khi node đó lands; hoá lime nếu dẫn vào node highlight.

### `network_diagram` 🎬 — topology node/edge
- **Shape:** network. **Khi nào:** các thứ "nói chuyện/kết nối", thứ tự không quan trọng.
- **Layers:** `nodes[]` (`id`,`label`,`glyph?`,`x?`,`y?`,`highlight?`,`appear_sec`) + `edges[]`
  (`from`,`to`,`label?`,`flowing?`,`appear_sec`). `flowing:true` = marching-ants gói data chạy.
- **Taste:** ≤8 node. Bỏ x/y → auto layout hàng ngang; có x/y → tôn trọng vị trí tay (fraction).

### `org_diagram` 🎬 — org chart 12 hộp + cull
- **Shape:** structure + reveal. **Khi nào:** "N hộp, phần lớn là theater/bị loại".
- **Layers:** `parent_label` + `nodes[]` (`label`,`appear_sec`,`dim_at?`,`kept?`). Grid 4×3, bezier nối.
- **Taste:** hộp con jolt/shake khi `dim_at` (mờ + X đỏ); `kept:true` = sống sót lime. Dùng hiếm, cho đúng
  khoảnh khắc mô tả một cái diagram.

### `layer_stack` 🎬 — "under the hood" stack tầng
- **Shape:** structure/composition. **Khi nào:** kiến trúc tầng, build từ đáy lên khi từng tầng được nêu.
- **Layers:** `layers[]` (ordered foundation-first: `label`,`glyph?`,`sub?`,`accent?`).
- **Taste:** `layers[0]` render ở ĐÁY (thứ tự build ngược với thứ tự mảng). Tầng đỉnh lands lime.

### `network_spread` 🎬 — hub-and-spoke network effect
- **Shape:** metaphor "hiệu ứng mạng". **Khi nào:** tâm phát ra vòng dot, token $ chạy theo cạnh.
- **Layers:** `centerLabel`+`centerGlyph?` + `nodes[]` (≤8) + `flow`("in"/"out"/"none"), `flowGlyph`.
- **Taste:** render trên nền sáng (chủ ý tương phản) — ngoại lệ nền tối. Hay dùng làm "closer" cặp với command_deck mở đầu.

### `annotated_screenshot` 🎬 — screenshot + bracket lime
- **Shape:** point-at. **Khi nào:** cần chỉ vào vùng UI cụ thể trên ảnh thật.
- **Layers:** AssetLayer `image_path` + `highlights[]` (`x`,`y`,`w`,`h`,`label?`,`appear_sec`), `zoom_to_highlights?`.
- **Taste:** ≤4 highlight, bracket lime vẽ vào; giả định ảnh ~ tỉ lệ khung.

---

## E. HERO TAKEOVER — SEQUENCE / DANH SÁCH ĐA-ITEM

### `vertical_timeline` 🎬 — rail dọc, dot pop khi rail chạm
- **Shape:** sequence có mô tả. **Khi nào:** liệt kê 3–6 bước, mỗi bước có heading + description.
- **Layers:** `items[]` (`heading`,`description?`,`appear_sec`), `title?`.
- **Taste:** RAIL DẪN dot — line vẽ xuống, dot pop ĐÚNG frame `appear_sec`. Mỗi bước PHẢI có `appear_sec`
  riêng khớp lúc người nói gọi tên; `end` phủ hết cả enumeration + ~0.5s tail. Không dump cả cụm.

### `horizontal_timeline` 🎬 — rail ngang (landscape/roadmap)
- **Shape:** sequence. **Khi nào:** roadmap intro, hoặc landscape.
- **Layers:** `steps[]` (`heading`,`description?`,`appear_sec`), `title?`. Card fit full-width, KHÔNG pan camera.
- **Taste:** card reveal tuần tự rồi khoá; heading clamp 2 dòng, không hyphenate.

### `progress_steps` 🎬 — chuỗi bước đánh số, fill lime
- **Shape:** sequence không mô tả. **Khi nào:** các bước ngắn, "reaches" từng cái.
- **Layers:** `steps[]` (`label`,`appear_sec?`,`active_sec?`). ≤6.
- **Taste:** fill lime wipe trái→phải khi tới bước; bước active có settle-zoom thở nhẹ.

### `ticker_feed` 🎬 — feed activity log cuộn
- **Shape:** sequence/sự kiện theo thời gian. **Khi nào:** dòng sự kiện lands ở top đẩy cũ xuống.
- **Layers:** `items[]` (`text`,`glyph?`,`time?`,`label?`,`appear_sec`). ≤8 nhưng chỉ 5 hiện cùng lúc.
- **Taste:** hành vi cuộn thật (cái cũ fade sau 5 slot) — khác các template freeze sau entrance.

### `bulleted_list` 🎬 — checklist dọc có glyph
- **Shape:** enumeration. **Khi nào:** danh sách có ✓/✗/•/→/⚠ ngữ nghĩa.
- **Layers:** `items[]` (`text`,`glyph?`,`appear_sec`), `title?`. ≤6.
- **Taste:** chip glyph là phần lime duy nhất, chữ giữ tông trung tính.

### `bullet_burst` 🟢▲ — bullet scrapbook tích luỹ (short)
- **Shape:** enumeration nhanh. **Khi nào:** người nói bắn liên tiếp 3–5 cụm ngắn (≤8s).
- **Layers:** `items[]` (`text`,`appear_sec`,`accent?`) — cardless, vị trí/rotation deterministic theo index.
- **Taste:** item TÍCH LUỸ (không thay thế), pop bằng spring + xoay nhẹ. Item cuối `accent` cho punchline lime.
  Không phải thay thế cho word_pop hero đơn.

### `calendar_months` 🎬 — lưới lịch N tháng, fill lime
- **Shape:** thời gian/tần suất. **Khi nào:** "N tháng gần đây", nhịp theo tháng.
- **Layers:** `count?`(mặc định 9), `title?`, `caption?`. Hình học lịch THẬT (Date math).
- **Taste:** ngày là thật, không trang trí — ô ngày wipe-fill lime tuần tự.

### `command_deck` 🎬 — control panel "AI OS" boot (HOOK visual)
- **Shape:** structure/hook. **Khi nào:** "hệ điều hành AI", grid phòng ban boot lên tuần tự.
- **Layers:** `title?`, `brand?`, `tiles[]` (`label`,`glyph?`,`appear_sec`). 2/3 cột tuỳ số tile.
- **Taste:** mỗi tile có scan-sweep đúng lúc boot ("booting…"→"● ACTIVE"). Tốt làm hook mở.

---

## F. PARTIAL OVERLAY — CÓ CARD NỀN (🟡 chỉ landscape/longform, KHÔNG short)

> Cả nhóm này bị coi là "sticker từ video người khác" trên short 9:16. Chỉ dùng khi speaker không phải toàn
> bộ show (landscape/longform). Trên short, thay bằng `word_pop`/`bullet_burst` (cardless).

### `lower_third` 🟡▲ — banner chyron TV
- **Khi nào:** "đây là category"/nhãn. **Layers:** `callout_prefix?`+`callout_highlight`+`callout_suffix?`+`kicker?`.
- **Taste:** wipe từ trái, khối lime highlight; speaker vẫn thấy trên nó.

### `chapter_bar` 🟡▲ — thanh chương đáy
- **Khi nào:** break cấu trúc ("Đây là twist…"). **Layers:** `chapter_number`+`chapter_title`. Nền trong suốt.

### `keyword_chips` 🎬/🟡 — chip pill từ khoá
- **Khi nào:** 4–8 token tên ngắn. **Layers:** `chips[]` (`text`,`appear_sec?`,`active?`). Một chip `active` lime.
- **Taste:** trên short → thay bằng `word_pop`/`tool_logo_burst` (chip có nền = template feel).

### `side_panel` 🟡▲ — panel bullet dọc ~40% khung
- **Khi nào:** enumeration mà giữ speaker cạnh bên. **Layers:** `items[]` (`glyph?`,`text`,`appear_sec`), `anchor`. ≤5.

### `corner_stat` 🟡▲ — HUD số nhỏ ở góc
- **Khi nào:** số context nền không đáng takeover. **Layers:** `pre_label?`+`value`+`caption?`+`delta?`+`anchor`.

### `notification_toast` 🟡▲ — thẻ push notification
- **Khi nào:** "tôi nhận được Slack nói X"/news framing. **Layers:** `app_name`+`app_icon?`+`title`+`body`+`time?`+`anchor`.
- **Taste:** body clamp 2 dòng, title 1 dòng.

---

## G. PEOPLE / LOGO / BURST (🟢 partial, OK short — không phải card sticker)

### `portrait_burst` 🟢▲ — chân dung tròn người thật
- **Khi nào:** người nói nhắc người thật (CEO, founder). **Layers:** `items[]` (`image_path`,`label?`,`appear_sec`).
- **Taste:** crop tròn + vòng hairline lime, slot scatter deterministic. 1–2 chân dung/beat; 3+ chật. Chỉ đặt
  ĐÚNG khi speaker đang nói về CHÍNH những người đó (taste-rules §logic).

### `tool_logo_burst` 🟢▲ — logo brand/tool tile
- **Khi nào:** nêu sản phẩm/công ty thật. **Layers:** `items[]` (`image_path?`,`label?`,`appear_sec`,`accent?`).
- **Taste:** tile bo góc, nền trắng cho logo rõ. KHÔNG có logo → bỏ `image_path`, chỉ `label` (tile chữ) — để
  enumeration đủ mọi brand, đừng để lỗ hổng. Tải logo: `assets/fetch_logo.py "Stripe" "Notion"`.

### `agent_avatar_burst` 🟢▲ — avatar robot cho "AI agent" bị cull
- **Khi nào:** N agent/routine mà phần lớn bị kill. **Layers:** `items[]` (`label?`,`appear_sec`,`dim_at?`,`kept?`).
- **Taste:** SVG robot inline (không cần asset). `dim_at` = mờ + X; `kept` = sống sót lime. Dành riêng cho khi
  nói về AI agent như nhân vật; đếm trừu tượng khác → dùng `ratio_dots`.

### `ratio_dots` 🟢▲ — "X trên Y"
- **Khi nào:** mọi tỉ lệ "X of Y"/"X out of Y"/"N%". **Layers:** `total`,`marked`,`polarity`,`mark_at`,`caption`.
- **Taste:** `polarity:"negative"` = dot bắt đầu LIME, subset marked mờ+X (X là con số XẤU: "9/12 bị kill").
  `polarity:"positive"` = dot xám, subset sáng lime (X là con số TỐT: "3/12 còn chạy"). Sạch hơn robot cho đếm trừu tượng.

---

## H. IMAGE / MEDIA

### `image_card` 🟢▲ — ảnh trong card glass nửa dưới (mặc định cho ảnh trên short)
- **Khi nào:** ảnh b-roll trên short — speaker vẫn thấy phía trên. **Layers:** AssetLayer `src` + `caption?`.
- **Taste:** ảnh `object-fit:cover` nên nguồn tỉ lệ nào cũng fill; Ken Burns chậm để card không đơ. DÙNG cái
  này thay full-takeover ảnh trên short.

### `ai_image_on_grid` 🎬 — ảnh AI full-bleed trên grid brand (landscape/16:9)
- **Khi nào:** ảnh THỰC SỰ là cả khoảnh khắc (intro/longform 16:9). **Layers:** AssetLayer `src` + `caption?`.
- **Taste:** ảnh phải được tạo VỚI grid brand làm init (xem image-style.md), không phải full-bleed generic.
  Trên short → dùng `image_card` thay vì cái này.

### `split_reveal` 🎬 — before/after wipe
- **Khi nào:** bằng chứng thay đổi trực quan trên màn hình thật. **Layers:** `before_image`+`after_image`+labels+`wipe_start_sec`,`wipe_duration_sec`.
- **Taste:** hai ảnh cùng tỉ lệ/crop (wipe overlay 1:1, không tự align).

### `static` (base) 🎬 — ảnh takeover full-screen (Ken Burns)
- **Khi nào:** ảnh chiếm cả khung. **Layers:** AssetLayer `image_path`, `inset?` (card mode: ảnh ở fraction khung
  trên grid tối). `fit` mặc định `contain`, `cover` chỉ khi ảnh đúng tỉ lệ nguồn.
- **Taste:** `inset:0.10` cho screenshot pixel-critical (dashboard/IDE) — không tràn, không crop mất 70%.

### `video` (base) 🎬/▲ — clip MP4
- **Khi nào:** clip là cả khoảnh khắc (full), hoặc `overlay:true` = thẻ điện thoại nổi (speaker vẫn thấy).
- **Taste:** clip ví dụ/exhibit → LUÔN `overlay:true` (card portrait, muted, dimmed) — đẹp & sạch hơn full.
  Mute click-pop của clip hoặc ≤10% dưới giọng.

### `icon` (base) 🟢▲ — card/icon nhỏ nổi
- **Khi nào:** flash logo/brand rất ngắn (≤1.5s). **Layers:** AssetLayer `image_path`, `anchor`/x,y, `bare?`, `aspect`.
- **Taste:** `bare:true` = không card trắng, bo góc + shadow thẳng trên ảnh (logo tự có nền). Mặc định `anchor:center`.

---

## I. CAPTION / CTA / MISC

### `chat_message` 🎬 — bong bóng chat iMessage
- **Khi nào:** hội thoại/tin nhắn. **Layers:** `messages[]` (`role`,`name?`,`text`,`appear_sec`). role: user (phải,
  raisin) / agent (trái, lime) / other (trái, steel).
- **Taste:** slot bong bóng cấp phát trước (không xáo lại khi cái mới lands); body clamp 5 dòng.

### `subscribe` ▲ — nút CTA subscribe animated (channel-specific → generic CTA)
- **Khi nào:** dòng CTA/đóng, hoặc pattern-interrupt giữa video. **Layers:** `vertical?` (self-contained).
- **Taste:** pill pop → cursor click → morph "SUBSCRIBED" + bell wiggle. ~2.5–3s. *Đây là asset thương hiệu
  kênh gốc — với repo bạn, tái dựng thành nút CTA của brand D1A nếu cần, hoặc bỏ.*

### `list` (base) 🎬/🟡 — list đánh số programmatic
- **Khi nào:** người nói enumerate ("ba lý do", "first… second…"). **Layers:** `title` + `items[]` (`text`,`appear_sec`).
- **Taste:** mỗi item hiện ĐÚNG lúc người nói nói nó (object form với `appear_sec`), không spoiler. Item cuối
  dwell ≥1.5s. Trên short, list có card nền → cân nhắc `bullet_burst`/`word_pop` (cardless) thay thế.

### ⛔ `vs_split` 🎬 — panel tương phản trên/dưới
- **Layers:** `top_label`+`top_items[]`+`bottom_label`+`bottom_items[]`+`winner?`. ≤5 item/bên.
- **Taste:** ⛔ **TRÁNH DÙNG MỚI** — đọc như slide template generic, giết cảm giác premium (taste-rules §10). Cho
  tương phản: `comparison_grid` (3+ cột), hai `image_card`, hoặc `word_pop` framing pivot. Giữ trong catalog
  chỉ vì tương thích.

### `comparison_grid` 🎬 — bảng so sánh nhiều cột (thay vs_split)
- **Khi nào:** 3+ lựa chọn × tiêu chí. **Layers:** `columns[]` (`label`,`winner?`,`appear_sec`) + `rows[]`
  (`feature`,`values[]`,`appear_sec`). ≤4 cột × 6 hàng, boolean → ✓/✗.
- **Taste:** cột winner header lime. Đây là cách ĐÚNG cho tương phản nhiều bên (vs_split bị cấm).

---

## J. HỆ THỐNG NỀN (không phải "kind" — áp global, tái dựng 1 lần)

- **Backgrounds (grid nền):** grid "cloudy" — mask radial blob layered để grid rõ từng mảng, mờ dần giữa các
  mảng, đọc như texture trôi chứ không phải giấy kẻ ô. Nền tối `#0A0B0A`, line grid mờ. Mọi hero takeover
  render trên nền này.
- **ColorGrade (grade màu toàn phim):** một lớp grade nhẹ phủ TẤT CẢ (speaker + b-roll) để cutaway không "dán
  lên": contrast ~1.07 / saturate ~1.10 / brightness ~1.01 + duotone soft-light (highlight ấm, shadow lạnh) +
  vignette nhẹ. Tinh chỉnh để "cảm nhận không nhìn thấy" — chỉ ra được "cái filter" là quá tay.
- **motion.ts (thư viện hook):** repo bạn đã có tương đương (`s4ei/s4eo/s4vis/s4eb`). Các nguyên thủy kinetic
  (word-reveal blur-settle, living-hold drift, choreographed-exit dissolve) → tái dựng bằng easing của bạn khi
  cần cho concept_build/hero.

---

## Ghi chú map schema (tóm tắt cho mọi recipe)

- **TextLayerSchema** (chữ): `x,y,scale,rotate,bold,underline,italic,textTransform,color,lineHeight,maxWidth,textAlign`.
- **AssetLayerSchema** (hình/icon/card): `x,y,rotate,color,scale,effectDuration`.
- **BackgroundSchema**: `color`.
- **Nội dung động** (text hiển thị, `appear_sec`, items[], value…) không nằm trong 3 schema layer — khai báo
  thêm trong schema nhúng của scene (RawSchema) như enum/field riêng, theo EDITOR-integration.md. Nhưng **style**
  (màu/size/align) thì DÙNG field của layer schema, đừng tạo lại.
- **appear_sec luôn là giây TUYỆT ĐỐI của video** — component tự trừ `beat_start_sec` để ra offset trong Sequence.
