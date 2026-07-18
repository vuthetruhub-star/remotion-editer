# Image Style — kỷ luật ảnh AI (khi asset thật không tồn tại)

> Chỉ dùng ảnh AI cho **abstraction/ẩn dụ không có referent thật** (taste-rules §5: asset thật > stock > AI).
> Khi buộc phải tạo, tuân thủ MỘT style khoá cho cả video — trộn style = "stock-asset stew".
> Palette đã dịch sang brand bạn: nền `#0A0B0A` (`colors.background`), accent `#00FF41` (`colors.primary`).

---

## 1. Style khoá (mọi ảnh trong một video dùng CHÍNH XÁC style này)

Style thắng qua bake-off 5 ứng viên: **soft 3D matte / claymation** (chunky, matte plastic, rim light) —
đọc premium, "sống trên grid" thay vì dán đè. (Các style bị loại: line-illustration mảnh/lạnh; flat
geometric không premium; product-photo quá thật cạnh tranh mặt người; risograph quá indie.)

**Prompt template (chỉ đổi phần SUBJECT):**

```
Add a single <SUBJECT> at the center of the frame, rendered as a chunky matte plastic / claymation form
with soft shadows. Match the existing background's deep near-black color (#0A0B0A) and subtle grid pattern
exactly — the subject should look like it lives ON the grid, not pasted over it. Neon green (#00FF41) rim
light along one edge of the subject. Clear silhouette, premium magazine aesthetic. No text.
```

- Lưu template đã chốt vào `<project>/style.txt` và **tái dùng nguyên văn** cho mọi beat generated trong
  video đó. Nếu một lần gen lệch style (flat/2D/line-art) → **gen lại nguyên văn**, đừng chấp nhận "nhìn ổn".
- Tỉ lệ: khớp nơi ảnh sẽ dùng. Trên short, ảnh vào `image_card` (card nửa dưới) → xin **1:1**. Nếu ảnh THỰC
  SỰ là full takeover 16:9 (`ai_image_on_grid` cho landscape) → khớp **16:9**.
- Nếu dùng grid brand làm nền chung: render nền một lần (Remotion still) rồi truyền làm init-image cho mọi
  gen → nền đồng nhất tuyệt đối. Nếu không, prompt tự tả nền như trên.

---

## 2. Subject — cụ thể, một mình, qua "four-word test"

- **Một subject mỗi frame.** KHÔNG "X cạnh Y" — AI chia đôi sự chú ý, mất silhouette.
- Subject phải nhận ra trong <0.5s khi tắt tiếng. Tốt: "một cái khoá", "một tủ rack server", "biểu đồ đi lên",
  "một đồng hồ bấm giờ", "một cái lịch". Tệ: "một app icon lẻ loi bị nuốt bởi landscape hệ thống", "một cỗ máy
  nứt vỡ" — cầu kỳ = trang trí.
- **Bảng thay thế cho khái niệm khó vẽ:** "guardrails" → ổ khoá/khiên · "funnel" → đồng hồ cát · "machine" →
  bánh răng · "system" → các hộp nối nhau. Ưu tiên subject qua "emoji test" (tồn tại trong mọi bộ emoji:
  🔑 🔒 🔍 ⏳ 📊 ⚙️ 🛡️). Tránh "device/panel/card" chung chung — quá trừu tượng để model vẽ đặc trưng.
- **Prompt lint per-beat:** nếu `SUBJECT` có >1 mệnh đề ngăn bởi dấu phẩy, hoặc >12 từ, hoặc chứa
  "vast/dwarfed/abstract/metaphor/suggesting" → viết lại ngắn, cụ thể.

---

## 3. Một lime accent mỗi frame

- Rim light `#00FF41` là accent duy nhất trên ảnh. Không thêm nguồn lime thứ hai trong cùng frame — hai accent
  tranh nhau. (Trùng luật "1 accent/frame" toàn skill.)

---

## 4. Tải asset thật trước (nhắc lại — AI là fallback)

- Người/tool/brand thật → `assets/fetch_logo.py "Stripe" "Notion"` (Wikipedia, không cần key) hoặc WebSearch +
  `curl`. Chân dung người thật → ảnh infobox Wikipedia (lấy bản `500px-` cho nét).
- Khái niệm "đời thực" chung → `assets/fetch_stock.py "<query>" <out_dir>` (Pexels, cần `PEXELS_API_KEY`).
- Chỉ rơi xuống ảnh AI khi KHÔNG có referent thật. Verify file tải về là ảnh thật (không phải HTML lỗi):
  kiểm magic-byte / mở thử.

---

## 5. Self-check ảnh

- [ ] Đã thử asset thật/stock trước; AI chỉ cho abstraction không referent.
- [ ] Mọi ảnh trong video cùng MỘT style khoá (prompt lưu ở `style.txt`, tái dùng nguyên văn).
- [ ] Một subject/frame, qua four-word test; prompt ≤12 từ, không từ mơ hồ.
- [ ] Palette: nền `#0A0B0A`, rim `#00FF41`, một accent/frame.
- [ ] Tỉ lệ khớp nơi dùng (1:1 cho image_card, 16:9 cho full takeover).
