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

## K. STRUCTURE / EXPLAINER (học từ reference — ĐA-MÀU theo vai trò)

> 🎨 **Ngoại lệ luật "1 lime/frame":** với nội dung **explainer / dạy cấu trúc**, cho phép **mã màu theo VAI
> TRÒ** (mỗi vai trò một hue cố định) thay vì 1 accent. Vẫn chroma-safe (màu ĐẶC, không blur/glow). Học từ 6 IG
> reel cùng 1 creator dạy short-form (2026-07-18). Ngoài explainer vẫn giữ 1 lime `#00FF41`.
>
> **MẪU 12 mục — mỗi kind PHẢI đủ để (a) tái tạo bằng số, (b) biết khi nào/khi không dùng, (c) có ví dụ chạy được:**
> `① Trạng thái · ② DÙNG KHI · ③ KHÔNG DÙNG KHI · ④ Bố cục(định lượng) · ⑤ Động(ms/easing) · ⑥ Zoom gợi ý ·
> ⑦ SFX · ⑧ Caption đi kèm · ⑨ Fields · ⑩ Ví dụ · ⑪ Chroma/9:16 · ⑫ Học từ`. Toạ độ = %khung 1080×1920 (góc
> trái-trên); size = px @1080; thời gian = giây so đầu beat, entrance = ms. Số là **ước lượng**, chốt khi test.

### `structure_scaffold` 🟢▲ — "mục lục" cấu trúc build dần + thanh progress đáy
- **①** ✅ đã dựng.
- **②** Video DẠY một khung có tên các phần (Hook→Lead→Body→CTA; "3 loại X"); muốn overlay "mục lục" build dần theo lời + thanh tiến trình thường trực báo đang ở đâu.
- **③** Nội dung không có cấu trúc-đặt-tên (kể chuyện tự do); chỉ 1–2 mục → `word_pop`. Không đặt đè mặt.
- **④** Cột phải, top 6%, rộng 52%; hàng = nhãn 30px/700 (viền 1px) + thanh cao 12px (spinner Ø34, viền 4px); gap dọc 20px. Track đáy: left6–right6%, bottom 16%, seg cao 6px/gap10, label 18px. Màu vai trò: Hook `#FF3B30` · Lead `#FFCC00` · Body `#34AADC/#3B5BDB` · CTA `#34C759`.
- **⑤** Hàng fade+rise(14px) 350ms tại `appearSec`; thanh scaleX 0→1 trong 100–600ms sau appear; spinner xoay 360°/s; track fill = round(progress×segs). Hàng GIỮ tới hết.
- **⑥ Zoom:** static hold (bỏ `zoom`) — overlay nặng, để đồ hoạ đọc.
- **⑦ SFX:** tick nhẹ mỗi hàng xuất hiện; whoosh khi track tiến 1 seg.
- **⑧ Caption:** có (word-punch giữa màn) — nhưng cột ở PHẢI nên không đè.
- **⑨ Fields:** `content{bgColor, side(right|left), track, trackColor}` · `row1..8{label, color, spinner, len(0..1), appearSec}`.
- **⑩ Ví dụ:** `{"kind":"structure_scaffold","side":"right","track":"Hook,Lead,Body,CTA","row1":{"label":"Hook:","color":"#FF3B30","appearSec":0},"row2":{"label":"Lead:","color":"#FFCC00","appearSec":0.5},"row3":{"label":"Open loop:","color":"#5E5CE6","spinner":true,"appearSec":1.2}}`
- **⑪** Màu đặc, viền chữ đặc, spinner arc đặc; `bgColor:"transparent"` khi overlay.
- **⑫** `DambEp1igDW`, `Daq-5E0jrYw`.

### `open_loop_stack` 🟢▲ — dòng "nhử" tích luỹ trong khung bo góc
- **①** ✅ đã dựng.
- **②** Tạo tò mò dồn nén — 2–4 câu teaser CHƯA giải quyết chồng lên nhau, đặt giữa Body để giữ chân trước khi trả lời.
- **③** Câu trả lời ngay (không teaser); >4 dòng; không cho CTA.
- **④** Khung bo góc left6–right6%, top=`vertical`(8%), padding 26/28, viền 2px rgba(255,255,255,.5), radius 22; dòng 40px/600, gap 16, kết mỗi dòng "…".
- **⑤** Mỗi dòng fade+rise(12px) 400ms tại `appearSec` (tích luỹ, giữ); khung fade-in 400ms theo dòng đầu.
- **⑥ Zoom:** static hoặc drift rất chậm 1.0→1.03.
- **⑦ SFX:** "type/tick" mỗi dòng land; riser trầm dồn tension.
- **⑧ Caption:** có — dòng teaser Ở TRÊN, caption giữa, không đè.
- **⑨ Fields:** `content{bgColor, vertical, boxed, color}` · `line1..4{text, appearSec}`.
- **⑩ Ví dụ:** `{"kind":"open_loop_stack","vertical":0.08,"line1":{"text":"Yet that's not the craziest part…","appearSec":0.2},"line2":{"text":"And in 1893 Richard Feynman…","appearSec":1.6},"line3":{"text":"We couldn't have expected this…","appearSec":3.0}}`
- **⑪** Viền + text đặc; flat-alpha nội vi OK.
- **⑫** `DambEp1igDW`.

### `antithesis_split` 🟢▲ — 2 vế đối lập quanh gạch đứt dọc
- **①** ✅ đã dựng.
- **②** Đối lập 2 vế ngắn ("A không phải X, mà là Y"; "hại sức khoẻ | mài dao") — antithesis/tension. Đặt nửa dưới.
- **③** >2 vế → `comparison_grid`; nhiều tiêu chí → bảng.
- **④** Gạch đứt dọc x=50%, cao 14% quanh `vertical`(0.78); 2 khối chữ mỗi bên ~40% rộng, 34px/600 trắng viền; tuỳ chọn 2 vòng tròn (đặc trái/rỗng phải) Ø120.
- **⑤** Vế trái fade+rise 300ms → vế phải +0.3s; divider vẽ scaleY 300ms; vòng tròn pop 150ms.
- **⑥ Zoom:** static, hoặc punch rất nhẹ vào lúc pivot ("mà là").
- **⑦ SFX:** 2 nốt đối (trầm→cao) cho 2 vế, hoặc 1 "hit" khi divider vẽ xong.
- **⑧ Caption:** tránh y72–86% (nhường split) → caption cao hơn hoặc tắt đoạn này.
- **⑨ Fields:** `content{bgColor, dividerColor(#FFD400), dashed, vertical(0.78), showCircles}` · `left{text,appearSec}` · `right{text,appearSec}`.
- **⑩ Ví dụ:** `{"kind":"antithesis_split","showCircles":true,"left":{"text":"terrible for your health","appearSec":0.2},"right":{"text":"sharpening your knives","appearSec":0.5}}`
- **⑪** Divider màu đặc gạch đứt; text viền đặc; vẽ bằng scaleY.
- **⑫** `Daei0qakSON`.

### `floating_stats` 🟢▲ — badge số bay rải quanh subject
- **①** ✅ đã dựng.
- **②** Nhiều con số "sống" rải ra (views đang chạy, giá, chỉ số) — cảm giác dồn dập.
- **③** 1 số hero → `stat_punch`; số cần trục so sánh → `bar/stat_grid`. Không đè mặt.
- **④** 4–6 badge deterministic (index→ (12,58)(78,60)(20,74)(70,78)(38,88)(86,40)%), tránh mặt. Badge = pill nền `rgba(18,20,18,.88)` bo 14, số 30px/700 trắng, glyph accent (`eye`◉/`chart`↗/`dollar`$).
- **⑤** Mỗi badge pop scale .8→1 120ms tại `appearSec`, stagger 0.15–0.3s; float drift ±6px (sin theo f); giữ 2–3s.
- **⑥ Zoom:** static hold (nhiều badge quanh mặt).
- **⑦ SFX:** "blip/pop" nhỏ mỗi badge (theo stagger).
- **⑧ Caption:** có ở giữa; badge đã né vùng mặt & caption.
- **⑨ Fields:** `content{bgColor, accent}` · `stat1..6{value, glyph(eye|chart|dollar|none), appearSec}`.
- **⑩ Ví dụ:** `{"kind":"floating_stats","glyph":"eye","stat1":{"value":"9000","appearSec":0.1},"stat2":{"value":"2200","appearSec":0.3},"stat3":{"value":"11.5K","appearSec":0.5}}`
- **⑪** Pill nền đục, số viền đặc; drift bằng transform.
- **⑫** `Daq-5E0jrYw`.

### `doodle_scribble` 🟢▲ — nét vẽ tay (squiggle/circle/arrow/underline)
- **①** ✅ đã dựng.
- **②** Nhấn cảm xúc/năng lượng/rối, khoanh vùng, hoặc mũi tên chỉ — đè lên ảnh/từ/subject.
- **③** Cần nghiêm túc/chính xác (số liệu). Tối đa 1 doodle/beat.
- **④** SVG path tại `x,y`(fraction), `scale`; stroke 7px màu `#FFD400`; `variant`: squiggle/circle/arrow/underline. Khung vẽ ~260×scale px.
- **⑤** Vẽ draw-on bằng `strokeDashoffset` tính THEO FRAME (không CSS transition) trong `drawSec` (300–500ms); giữ.
- **⑥ Zoom:** thường trên shot có punch nhẹ; doodle không cần zoom riêng.
- **⑦ SFX:** "marker/scribble" khi vẽ.
- **⑧ Caption:** có; doodle chỉ khoanh/nhấn, không thay caption.
- **⑨ Fields:** `content{color, variant, x, y, scale, drawSec}`.
- **⑩ Ví dụ:** `{"kind":"doodle_scribble","variant":"circle","x":0.5,"y":0.4,"scale":1.5,"drawSec":0.4}`
- **⑪** Stroke màu đặc; draw-on qua dashoffset theo frame (pathLength=1).
- **⑫** `Daf3iwtk7Wi`.

> `loading_spinner` = biến thể hàng `spinner:true` trong `structure_scaffold` (arc viền đặc xoay), KHÔNG kind rời.

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
