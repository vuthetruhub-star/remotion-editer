# Caption Rules — luật caption biên tập (dùng hệ caption sẵn có của repo)

> Repo bạn ĐÃ có transcription (Whisper qua `/api/transcribe`) + `generateCaptions()` + caption presets.
> File này KHÔNG viết plumbing mới — nó quyết **cadence, chọn preset/animation, khi nào bật/tắt caption**
> để caption có "taste", không cãi nhau với overlay.

**Data model của repo (để tham chiếu):**
- `Word { start, end, word }` — ms (API trả giây, `generateCaptions()` ×1000). `interfaces/captions.ts`.
- Caption item `details`: `text`, `words[]`, `color` (chưa nói), `appearedColor` (đã qua), `activeColor`
  (đang nói), `activeFillColor` (nền highlight từ đang nói), `fontFamily`, `textAlign`, `animation`,
  `showObject` ("page"|"line"|"word"), `wordsPerLine`, `linesPerCaption`. `data/caption-presets.ts`.
- Animation per-word: `caption-animations.ts` + `caption-word-animations.ts` (typewriter, scale, fade…).

---

## 1. Cadence — word-punch, ≤3 từ/dòng cho short

- Short 9:16: **≤3 từ mỗi dòng caption** → nhịp word-punch nhanh. Set qua `linesPerCaption`/`wordsPerLine`
  (dùng `wordsPerLine: "singleWord"` hoặc gom 2–3 từ) để đạt cadence này. `generateCaptions()` lo grouping.
- Landscape/longform: có thể 4–6 từ/dòng (người xem đọc trên màn to hơn).

## 2. Current-word highlight — teleprompter follow

- Từ đang nói sáng lên `activeColor = #00FF41` (accent brand), hơi scale + lift; từ đã qua về `appearedColor`
  (trắng); từ chưa tới `color` mờ. Đây là hành vi có sẵn của `caption-word.tsx` — chỉ cần chọn preset có
  `activeColor` = accent của bạn, `activeFillColor` transparent (short cardless) hoặc màu nền nếu muốn khối.
- **Short: cardless.** Chọn preset `backgroundColor: transparent`, `borderWidth` mảnh + shadow nặng thay vì
  hộp nền. Caption ở đáy khung (`bottomOffset` ~0.11). Card nền = "sticker" như overlay card (taste-rules §10).

## 3. Entrance — cinematic, không bounce

- Caption vào bằng **fade + rise nhỏ + blur tan** (defocus→focus), KHÔNG scale-bounce/pulse. Nếu preset có
  `animation`, ưu tiên `typewriterEffect` hoặc fade nhẹ; tránh animation "nảy" lòe loẹt.

## 4. Emphasis — đánh dấu cụm quan trọng, đừng carpet-bomb

- Chỉ đánh dấu emphasis cho những cụm ĐÁNG: **intro** hook/promise/CTA (2–3 cụm); **longform** ~1 cụm/phút —
  đúng câu LÀ cả section. Đừng rải khắp.
- Emphasis = cụm bật to hơn/pop-to-center/underline-wipe (tuỳ preset animation). Mỗi cụm emphasis có thể kèm
  một SFX write-stroke (tick gõ chữ) — xem [sfx-rules.md](sfx-rules.md).
- **Closer im lặng:** cụm emphasis CUỐI cùng (thường là CTA đóng) TẮT SFX write-stroke — im lặng đọc tốt hơn
  "thêm tiếng gõ". Animation underline vẫn chạy, chỉ cắt audio.

## 5. LUẬT LỚN NHẤT — caption và overlay text loại trừ nhau ở cùng thời điểm

Khi trên màn hình đã có text của một beat (takeover, `word_pop`, `hook_title`, quote…), **tắt caption** trong
khoảng đó — text/visual của beat gánh khoảnh khắc, caption bị suppress. Caption là **mô liên kết GIỮA các
beat**, không phải lớp phủ lên chúng.

- Suppress caption trong toàn bộ `[start, end]` của mỗi beat text-heavy, + pad 0.8s mỗi phía **nhưng chỉ drop
  khi từ caption TRÙNG NGHĨA với text của beat** (lọc stopword). Tránh "cùng một từ hiện hai lớp cách nhau
  100ms" (một nhỏ trắng, một to giữa) — đọc rối, không biết từ nào là thật.
- **Ngoại lệ — caption VẪN chạy** dưới overlay PARTIAL không cạnh tranh (visual ở giữa khung, caption ở đáy):
  `bar_overlay`, `subscribe`, `portrait_burst`, `tool_logo_burst`, `agent_avatar_burst`, `ratio_dots`,
  `image_card`, `icon`, `static`. Người xem tắt tiếng vẫn cần caption ở những beat này.
- **Suppress caption** dưới takeover full/text-heavy: `hook_title`, `word_pop`, `bullet_burst`, `headline_card`,
  `vertical_timeline`, `cinematic_title`, `stat_punch`, `quote_pull`, `org_diagram`, `code_terminal`,
  `dashboard_card`, `inline_chart`.
- Thêm kind mới → xếp vào một trong hai nhóm trên.

## 6. On-screen text phải khớp lời NÓI, không phải script paraphrase

- Chữ trên hook/word_pop phải dùng **đúng từ người nói** (grep transcript), không phải cách diễn đạt khác của
  kịch bản. Nếu script viết "theater" mà người nói "fake" → hook là "FAKE". Tránh hook và caption hiện hai từ
  khác nhau cho cùng một ý, lệch ~30ms — rối.
- Ngược lại, **brand name** thì theo script/nguồn thật (Whisper hay nghe nhầm tên riêng) — sửa tên riêng theo
  sự thật, còn từ thường theo audio.

## 7. Self-check caption

- [ ] Short: ≤3 từ/dòng, cardless, current-word = accent `#00FF41`.
- [ ] Entrance fade+blur, không bounce.
- [ ] Emphasis chỉ ở cụm đáng (~1/phút longform); closer tắt SFX.
- [ ] Caption↔overlay không chồng cùng lúc (suppress trong beat text-heavy, giữ dưới overlay partial nhẹ).
- [ ] Chữ overlay khớp từ NÓI; brand name theo sự thật.
