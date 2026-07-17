# Workflow — script + video → design.json (pha 1–2)

> Đầu vào: **kịch bản text-thuần** + **video 1–2p đã cắt CapCut**. Đầu ra: `design.json` (xem
> [design-schema.md](design-schema.md)) để Import vào editor hoặc render thẳng. Pha 3 (editor tự ráp) đã
> sẵn: nút Import design JSON + dispatcher kind.

## Quy trình 7 bước

1. **Trích frame** — `python assets/extract_frames.py <video> <out_dir> [--fps 1]` → ~1 ảnh/giây. AI ĐỌC các
   frame (Read tool đọc ảnh) để biết trên màn đang có gì: mặt người / screenshot / khoảng trống → quyết định
   chỗ đặt overlay & lúc nào zoom (mặt người tĩnh → punch-in; có screenshot → đừng đè overlay).
2. **Transcript (offline, tự đủ)** — `python assets/transcribe.py <video>` → `words.json` (word-level
   timestamps) bằng faster-whisper cục bộ (`pip install faster-whisper` một lần, sau đó offline). Không
   dùng dịch vụ ngoài. (Repo cũng có `/api/transcribe` nhưng đó là cloud designcombo — tránh nếu muốn tự đủ.)
3. **Align script ↔ transcript** — AI ghép kịch bản text-thuần vào transcript (video ngắn, làm trong context):
   mỗi đoạn/câu kịch bản → `[start,end]` thật (giây). Sửa tên riêng theo kịch bản (Whisper hay nghe nhầm).
4. **Lên beat plan** — với mỗi đoạn nội dung, áp [taste-rules.md](taste-rules.md) + [scene-catalog.md](scene-catalog.md):
   beat này DẠY gì? chọn kind nào (hook_title/stat_punch/word_pop/vertical_timeline/…), hay chỉ zoom video,
   hay caption. Gate: "muted viewer hiểu thêm gì?" Mật độ ≤4 beat/12s. Hook ở ~0.5s đầu.
5. **Ghi design.json** — chuyển beat plan thành JSON theo [design-schema.md](design-schema.md): video nguồn 1
   track (kèm `zoom` ở đoạn cần nhấn), overlay motion 1 track (mỗi beat 1 item motionScene với `kind`+content,
   `display.from/to` MS, `appearSec` giây-trong-beat), caption 1 track, SFX/audio 1 track ([sfx-rules.md](sfx-rules.md)).
   Chroma-safe + nền trong suốt cho overlay ([repo-constraints.md](repo-constraints.md)).
6. **User duyệt + reference** — trình beat plan cho user: dùng motion nào ở đâu, gợi ý cắt cảnh dài (chỉ tư
   vấn — user tự sửa CapCut), zoom, SFX. User chỉnh + gắn reference motion (nếu có) → cập nhật design.json.
7. **Đầu ra** — Import design.json vào editor (chỉnh tiếp rồi export), hoặc render thẳng (script render-design).

## Nguyên tắc
- **Reference-first cho asset** (trục A), **skill dẫn cách thể hiện** (trục B) — [SKILL.md](../SKILL.md) §1.
- "Cắt cảnh dài" = **tư vấn**, không cắt lại video final. Video nguồn giữ nguyên; chỉ chồng overlay/zoom/caption.
- Zoom video và motion overlay là 2 lớp khác nhau — ghi rõ beat nào thuộc lớp nào.
- Kiểm design.json trước khi giao: id khớp giữa `trackItemIds`/`trackItemsMap`/track.items; timing MS hợp lệ.

## Trạng thái công cụ (repo)
- ✅ Dispatcher + 5 kind (hook_title, stat_punch, word_pop, vertical_timeline, default) — thêm kind: tạo
  `player/items/motion-scenes/<kind>.tsx` + 1 dòng registry.
- ✅ Import design JSON (navbar) → nạp vào editor.
- ✅ Zoom video theo thời gian (`details.zoom`).
- ✅ `samples/demo-design.json` — mẫu 5 kind để tham chiếu format.
