---
name: edit-video-taste
description: "Bộ skill dựng video Short 9:16 cho repo remotion-editer, gồm 2 phần. (1) CÁCH LÀM = motion-edit-craft: nền tảng craft đã cụ thể hoá — 49 kind overlay (stat_punch, word_pop, vertical_timeline, hook_title, bar_overlay, ratio_dots, concept_build...), luật chọn visual/hook/mật độ, concept-viz, caption cadence, SFX theo sự kiện, chroma-safe, design.json, render. (2) HỌC GU = edit-taste: vòng lặp tự học gu biên tập của user — gửi video → bóc tách thông số (timing, khoảng cách, hold, zoom, SFX, caption, cắt cảnh) → user duyệt → ghi vào taste-profile → càng nhiều video càng tự cập nhật, dựa trên nền motion-edit-craft; kỹ thuật nào chưa có trong motion-edit-craft thì ĐỊNH NGHĨA rồi cập nhật ngược lại motion-edit-craft. TRIGGER khi làm trong repo remotion-editer, hoặc user nói: 'dựng scene X', 'làm motion cho câu này', 'chọn visual', 'thêm caption/SFX', 'làm hook', 'nâng taste', 'bóc tách video này', 'học gu edit', 'phân tích cách họ dựng', 'cập nhật taste', 'áp gu của tôi vào', 'test lại taste'. KHÔNG dùng cho render/setup cơ bản."
---

# Edit Video Taste — 1 bộ, 2 phần

Bộ skill dựng Short 9:16 cho repo `remotion-editer`, gồm **2 phần rạch ròi** (mở đúng phần khi cần):

```
edit-video-taste/                         ← BẠN ĐANG Ở ĐÂY (bộ điều phối)
├── motion-edit-craft/  → craft.md        ← ① CÁCH LÀM (nền tảng, ground truth)
└── edit-taste/         → learn.md        ← ② HỌC GU (vòng lặp tự học của bạn)
```

| Phần | File mở | Trả lời câu hỏi | Tính chất |
|---|---|---|---|
| **① motion-edit-craft** | [`motion-edit-craft/craft.md`](motion-edit-craft/craft.md) | "Dựng cái đó *bằng gì, code sao*?" (49 kind, chroma-safe, schema, render) | **Nền tảng** — kiến thức gốc đã cụ thể hoá. Ổn định, chỉ mở rộng có chủ đích. |
| **② edit-taste** | [`edit-taste/learn.md`](edit-taste/learn.md) | "Thế nào mới *giống gu của tôi*?" (nhịp, thông số ưa dùng, playbook) | **Lớp học** — tài liệu SỐNG, lớn dần qua mỗi video. |

> Quan hệ 2 lớp: **edit-taste HỌC GU và diễn đạt gu đó bằng vốn của motion-edit-craft.** motion-edit-craft
> là chân lý về *cách dựng*; edit-taste là *bạn muốn nó cảm giác thế nào*.
>
> **Khi SẢN XUẤT (sau vòng học): `motion-edit-craft` là BỘ NÃO CHÍNH.** ⚠️ Nó **KHÔNG viết nội dung/kịch bản
> nói** — bạn đã cấp sẵn **video thô đã cắt + text (lời) của video đó**. Việc của bộ não là làm **KỊCH BẢN
> DỰNG** (lớp motion đắp LÊN video có sẵn): chọn overlay/kind cho từng đoạn, canh timing/zoom/SFX + *khớp code*
> (ghi `design.json`) — **đọc `edit-taste/taste-profile` làm gu để canh mọi lựa chọn**. edit-taste không tự
> dựng — nó *nuôi gu* cho bộ não đó.

---

## LUỒNG LÀM VIỆC (khi bạn gửi 1 video)

```
gửi video ──▶ ① CÙNG PHÂN TÍCH (bóc tách) ──▶ ② ỔN? user duyệt ──▶ ③ ĐÚT VÀO edit-taste
                                                                          │
   ⑤ càng nhiều lần → edit-taste TỰ CẬP NHẬT chính nó ◀──────────────────┘
        │
        └─▶ ④ Kỹ thuật này motion-edit-craft CHƯA CÓ?
                 ├─ Có sẵn  → chỉ ghi thông số gu vào edit-taste
                 └─ Chưa có → ĐỊNH NGHĨA nó (kind/luật mới) → CÙNG CẬP NHẬT motion-edit-craft (nền tảng)
                              rồi mới ghi gu vào edit-taste
```

1. **Cùng phân tích** — mở `edit-taste/learn.md` (bước BÓC TÁCH) + `edit-taste/knowledge/analysis-method.md`:
   trích frame + transcript, lập **bảng thông số** từng nước đi, chốt "chữ ký". Trình cho bạn xem.
2. **Ổn thì duyệt** — bạn xác nhận cái nào đúng gu.
3. **Đút vào edit-taste** — merge thông số đã duyệt vào `edit-taste/knowledge/taste-profile.md`
   (mục Bảng tình huống→treatment + Nhật ký học, tăng `version`).
4. **Kiểm nền tảng** — mỗi treatment thử diễn đạt bằng 49 kind của motion-edit-craft:
   - **Đã có** → chỉ ghi thông số gu (bước 3).
   - **CHƯA có** → dừng lại, **định nghĩa kỹ thuật mới** (kind/luật), **cập nhật ngược `motion-edit-craft`**
     (thêm recipe vào `knowledge/scene-catalog.md` + nếu cần thì thêm module kind trong repo theo
     `motion-edit-craft/knowledge/design-schema.md`), *rồi* mới ghi gu vào edit-taste.
5. **Tự cập nhật dần** — qua nhiều video, các ô `[CHỜ HỌC]` trong taste-profile đầy dần; thông số mâu thuẫn
   giữa các video → giữ khoảng min–max hoặc "tùy loại nội dung", không ghi đè mù.

**Khi SẢN XUẤT video thật** (motion-edit-craft cầm trịch — KHÔNG viết nội dung):
```
BẠN CẤP:  video thô đã cắt (9:16)  +  text/lời của video đó
   └─▶ motion-edit-craft (BỘ NÃO):  đọc taste-profile (gu)
        ├─ ALIGN     → transcribe + khớp text ↔ video (mỗi câu/đoạn ở giây nào)
        ├─ KỊCH BẢN DỰNG (motion plan) → đoạn nào đắp overlay/kind gì, canh timing/zoom/SFX theo gu
        └─ KHỚP CODE → ghi design.json (overlay CHỒNG lên video thô, chroma-safe 9:16)
              └─▶ node scripts/render-design.mjs (repo) ─▶ cùng xem ─▶ tinh chỉnh thông số trong taste-profile
```
> "Kịch bản" ở đây = **kịch bản DỰNG** (edit/motion plan) đắp lên footage có sẵn, **không phải** kịch bản nội dung.

---

## Nguyên tắc chung (cả 2 phần)
- **9:16 (1080×1920)** cứng. Chroma-safe + nền trong suốt/keyable khi overlay (xem `motion-edit-craft/knowledge/repo-constraints.md`).
- **Nền tảng chỉ mở rộng có chủ đích:** không tự ý sửa motion-edit-craft trừ bước ④ (định nghĩa kỹ thuật mới, có bạn duyệt).
- Thông số học được là **ước lượng**, tinh qua vòng test — không giả vờ chính xác ms.
- Bản dựng của **chính bạn** đáng tin hơn video người lạ cho việc học gu *của bạn* (nhãn `[của tôi]`).

## Ghi chú triển khai
- Đây là **1 mục menu** (`edit-video-taste`). Hai phần bên trong là tài liệu con (`craft.md`, `learn.md`),
  không phải 2 skill riêng → không lẫn lộn.
- Bản `motion-edit-craft` trong **repo** (`.claude/skills/motion-edit-craft/`) vẫn giữ nguyên để repo tự đủ.
  Khi muốn đồng bộ cấu trúc mới này vào repo, nói một tiếng.
