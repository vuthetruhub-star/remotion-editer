# Taste Rules — lõi biên tập (trục B)

> Đây là "cách thể hiện". Áp dụng LUÔN, kể cả khi có reference cho asset (trục A).
> Mọi giá trị visual cụ thể (màu/size) vẫn lấy từ `src/brand.ts` hoặc reference — file này quyết
> *chọn cái gì, đặt ở đâu trong thời gian, và vì sao*, không quyết mã màu.

---

## 1. Luật số 1 — mọi visual phải có nghĩa cụ thể

Trước khi thêm BẤT KỲ visual/overlay nào, viết được một câu: **"tại sao nó xuất hiện ĐÚNG ở khoảnh khắc
này, và người xem hiểu ra điều gì?"** Nếu câu trả lời là "cho có không khí" / "đang nói về phần mềm nên
show cái gì đó" → **ĐỪNG thêm**. Visual trang trí ngẫu nhiên tệ hơn không có visual.

Mỗi beat trong plan phải có một `reason` (dù chỉ trong đầu). Đây là cổng gác.

---

## 2. Luật cứng hơn — visual phải DẠY, không chỉ LẶP LỜI (chống text-forwardness)

Sai lầm chất lượng lớn nhất trong edit giáo dục/giải thích: nghe một câu → hiện lại đúng câu đó dưới dạng
card chữ đẹp. Nó thêm nhấn mạnh nhưng **dạy zero**.

**Gate bắt buộc cho mọi beat giải thích:**

> "Muted viewer (tắt tiếng) nhìn frame này HIỂU THÊM điều gì mà lời nói một mình chưa cho?"

- Trả lời chỉ lặp lại câu nói ("nó hiện chữ anh ấy đang nói") → đó là **text card**, không phải concept
  visual. OK cho một punchline; vô dụng để dạy.
- Trả lời "giờ họ thấy A dẫn tới B" / "thấy hai thứ cạnh nhau" / "thấy phần nằm trong tổng thể" / "thấy nó
  thay đổi" → đó là **concept visual**. Dựng nó.

**Rule of thumb:** trong mỗi ~60s nội dung giải thích, ít nhất 1 beat phải là concept visual thật, không
phải text card. Cả một đoạn toàn `callout`/text pop = edit "text-forward" = fail.

---

## 3. Nhận diện "explanation beat" & map sang shape

Đi qua nội dung/transcript. Explanation beat = đoạn người nói làm bạn HIỂU một *thứ*, không chỉ khẳng định
một *ý kiến*.

| Người nói đang… | Tell phrases | Shape → xem scene-catalog |
|---|---|---|
| Mô tả **process / flow** | "đầu tiên… rồi…", "cách nó chạy", "pipeline", "đi qua" | SEQUENCE → `flow_diagram` / `ticker_feed` / `progress_steps` / `vertical_timeline` |
| Mô tả **quan hệ / hệ thống** | "nói chuyện với", "kết nối", "nằm trên", "under the hood" | NETWORK → `network_diagram` (edge `flowing`) / `org_diagram` / `layer_stack` |
| Vẽ **tương phản** | "khác biệt là", "cách cũ vs", "thay vì X thì Y", "trước… giờ" | CONTRAST → `comparison_grid` (3+), `split_reveal` (before/after thật). *(vs_split: xem cảnh báo cuối file)* |
| Định nghĩa **cấu trúc / thành phần** | "có ba phần", "được tạo từ", "bên trong X là", "anatomy" | STRUCTURE → `concept_build` (frame variant), `layer_stack` |
| **Thay đổi theo thời gian / bằng chứng** | "từ… lên/xuống", "before… after", "tăng", "tụt" | MAGNITUDE/CHANGE → `metric_reveal`, `bar_chart`/`bar_overlay`, `inline_chart` |
| Chỉ vào **vùng UI cụ thể** | "chỗ này", "cái nút này" | POINT-AT → `annotated_screenshot` (highlights) |
| Nêu **ẩn dụ / abstraction** | "hình dung như", "kiểu như", "cơ bản là một" | METAPHOR → `concept_build` metaphor canvas, hoặc `ai_image_on_grid` nếu là 1 vật cụ thể |
| Chỉ **khẳng định ý kiến** | "tôi nghĩ", "thật ra", "sự thật là" | KHÔNG concept visual — để speaker, hoặc 1 text pop (`word_pop`/`callout`) |

**Bẫy:** explanation beat là chỗ editor DỄ BỊ cám dỗ nhất thả một text card, vì câu nói nghe "quotable".
Cưỡng lại. Câu quotable vẫn muốn concept visual — câu trích có thể chạy làm caption bên dưới.

---

## 4. "Hơn cả một cái sơ đồ" — 4 register giàu hơn

Concept visual nên sáng tạo, không phải box-and-arrow mỗi lần. Bốn register, tăng dần độ tham vọng:

1. **Progressive build** — ĐỪNG hiện sơ đồ hoàn chỉnh; *dựng* nó khớp lời nói. Mỗi node/label/connector
   xuất hiện đúng từ giới thiệu nó (`appear_sec` theo giây của voiceover). Hiểu biết của người xem lắp ráp
   CÙNG câu nói. Mọi template đa-item đều hỗ trợ `appear_sec` per-item — DÙNG NÓ, đừng dump cả sơ đồ ở `start`.
2. **Presenter + canvas** — giữ speaker trong khung (nếu có), concept dựng ở 2/3 còn lại như keynote. Dùng
   cho cơ chế quan trọng nhất của đoạn.
3. **Metaphor canvas** — visual hoá đúng *ẩn dụ* người nói dùng. "Context window như cái bàn chỉ chứa được
   ngần này" → cái bàn đầy giấy. `concept_build` là phương tiện: đặt shape/glyph + label, animate để diễn
   ẩn dụ. Đây là thứ tách một explainer $10k khỏi một slideshow.
4. **Annotated walkthrough** — trên screenshot/frame thật, *dần dần* kéo chú ý: bracket vùng 1 khi được
   nhắc → mờ đi → bracket vùng 2…

Throughline: **visual mở ra theo thời gian, khoá vào giọng nói.** Visual chỉ đứng-đó = slide. Visual *dựng
khi anh ấy nói* = editing.

---

## 5. Thứ bậc nguồn asset (khi cần hình minh hoạ) — trục A nhưng ảnh hưởng taste

Thử theo thứ tự, dừng ở nấc đầu tiên có được:

1. **Asset thật / screenshot UI thật** — nếu nhắc một tool/brand/người có thật ("Claude Code", "Stripe",
   một CEO). Dùng WebSearch + WebFetch tìm nguồn chính thức, `curl` tải về; hoặc `assets/fetch_logo.py`.
2. **Stock ảnh/video** — cho khái niệm chung ("một cuộc họp", "laptop bận rộn"). Pexels (`fetch_stock.py`)
   / Unsplash. Ảnh thật đọc tốt hơn nhiều so với minh hoạ AI cho khái niệm "đời thực".
3. **Ảnh AI tạo** — CHỈ khi là abstraction không có referent thật (ẩn dụ). Xem [image-style.md](image-style.md).

Nguyên tắc: **asset thật trước, AI là fallback**. Một screenshot thật của công cụ được nhắc = bằng chứng;
một minh hoạ AI = "stock". Nghiên cứu câu chuyện thật cũng grounding cho caption/label.

---

## 6. Hook — 0.5 giây đầu quyết định

- Frame đầu KHÔNG được là một talking-head trống hay một nền tĩnh. Trong ~0.5s đầu phải có **text hook**
  (một tuyên bố/lời hứa/con số) — dùng kind `hook_title` (xem catalog): kicker nhỏ + hero line lớn.
- Hook mở bằng zoom-IN nhẹ rồi settle (không pulse/bounce) — xem [motion-taste.md](motion-taste.md).
- `title` của hook phải NGẮN (≤16 ký tự, 1–2 dòng). Stat/chi tiết để ở `kicker`.
- Nhịp mở: beat 1 = text (hook) → beat 2 = một full-screen component mạnh (timeline/stat/cinematic).

---

## 7. Mật độ & thứ bậc — đừng carpet-bomb

- **Mật độ:** cho short 30–45s, ~7–9 beat tổng, trong đó 4–5 "hero" (takeover) với ≥3 loại kind KHÁC nhau,
  còn lại là overlay nhẹ. **Cap: ≤4 beat trong bất kỳ cửa sổ trượt 12 giây.** Trên ngưỡng = frantic, người
  xem chưa kịp hấp thụ beat này beat sau đã tới.
- **Khi over-dense, bỏ beat ưu tiên thấp nhất.** Thứ tự ưu tiên (cao→thấp): template ARGUE/land con số
  (`quote_pull`/`stat_punch`/comparison) → screenshot thật của tool được nêu → ảnh cho danh từ cụ thể →
  ảnh cho ẩn dụ trừu tượng. Template tái-khẳng định lý lẽ > visual thuần trang trí.
- **Đừng thêm beat chỉ để "đa dạng".** Đa dạng là tie-breaker khi beat đã xứng đáng có mặt, không phải mục tiêu.

**Test đặt beat:** "speaker đang gánh khoảnh khắc này, hay visual gánh?" Visual xứng đáng khi: câu là một
NAMED THING (số/sản phẩm/người/tool) · câu là PIVOT/CONTRAST · câu là TAKEAWAY/CTA. Nếu lời nói đang làm
việc rồi → để mặt người đọc, đừng thêm.

---

## 8. Timing khớp lời — visual phải trùng thứ đang được nói

- Mỗi beat neo vào **cụm từ chính xác** người nói khi visual nên trên màn hình (một `speech_anchor`). Không
  có voiceover thì neo theo TIMING tay.
- **Bẫy phổ biến:** visual hook ở 1.5–4s minh hoạ một cụm mà người nói mãi 8s mới nói → tới lúc câu lands
  thì visual đã biến mất. Trước khi khoá beat, kiểm: từ khoá visual minh hoạ có xuất hiện TRONG cửa sổ
  `[start,end]` của beat không?
- Beat phải **kết thúc trước khi người nói chuyển chủ đề**. `end_sec` rơi vào câu mới về khái niệm khác =
  visual cũ thành nhiễu ngữ nghĩa.

---

## 9. Subject cụ thể thắng ẩn dụ khôn lỏi

Muted viewer phải biết hình là gì trong <0.5s. Subject tốt qua "four-word test": "một cái lịch", "một tủ
rack server", "một cái khoá", "biểu đồ đi lên", "một đồng hồ bấm giờ". Subject tệ: "một app icon lẻ loi bị
nuốt bởi một landscape hệ thống liên kết", "một cỗ máy nứt vỡ". Ẩn dụ cầu kỳ đọc thành trang trí; vật cụ
thể đọc thành ý nghĩa. (Chi tiết prompt: [image-style.md](image-style.md).)

---

## 10. Cảnh báo & lệnh cấm (đúc kết từ feedback thật)

- **Chữ KHÔNG đè lên mặt/đầu người nói.** Mọi text overlay ở lower-third (nếu có talking head). Text ở
  `vertical ≥ 0.60` (0.66–0.74 là dải làm việc cho khung dọc 9:16).
- **Caption và overlay text loại trừ nhau** ở cùng thời điểm — xem [caption-rules.md](caption-rules.md).
- **Không hai ảnh takeover liền nhau** — chèn ≥1.5s speaker/nhịp thở giữa hai ảnh, nếu không đọc thành
  slideshow.
- **`vs_split` (panel trên/dưới) — TRÁNH.** Trong skill gốc nó bị loại vì đọc như "template slide generic",
  giết cảm giác premium. Cho tương phản: để speaker gánh, hoặc một `word_pop` framing cú pivot, hoặc show
  hai artifact thật (`comparison_grid` / hai `image_card`). Kind vẫn còn trong catalog cho tương thích,
  nhưng **đừng chọn mới** trừ khi user yêu cầu đích danh.
- **Ảnh AI luôn cùng MỘT style** trong cả video — xem image-style.md. Trộn style = "stock-asset stew".
- **Overlay trên short: chỉ dùng loại CARDLESS** (`word_pop`, `bullet_burst`...). Loại có card/pill/bar nền
  (`lower_third`, `chapter_bar`, `keyword_chips`, `side_panel`, `corner_stat`, `notification_toast`) đọc như
  "sticker từ video người khác" trên short — để dành cho landscape/longform. Xem ghi chú per-kind trong catalog.

---

## 11. Self-check biên tập trước khi xong

- [ ] Mỗi beat giải thích được phân loại theo *shape of idea* (§3), không theo speech act bề mặt.
- [ ] ≥1 concept visual thật (không phải text card) mỗi ~60s nội dung giải thích.
- [ ] Sơ đồ/đa-item DỰNG khớp lời (`appear_sec` so le), không dump cả cụm ở start.
- [ ] Mỗi visual qua gate §2: nó dạy điều lời nói chưa cho.
- [ ] Không vượt cap mật độ (≤4 beat / 12s). Không carpet-bomb một loại kind.
- [ ] Asset thật > AI cho mọi khái niệm có referent thật.
- [ ] Hook có mặt trong ~0.5s đầu; title hook ngắn.
- [ ] Không chữ đè mặt; caption↔overlay không chồng cùng lúc.
