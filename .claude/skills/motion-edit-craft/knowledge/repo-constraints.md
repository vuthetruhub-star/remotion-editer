# Repo Constraints — ràng buộc CỨNG của repo (ĐỌC TRƯỚC KHI VIẾT STYLE)

> Skill này chắt lọc từ một pipeline gốc có **bối cảnh output khác**: video full-frame nền tối ghép lên
> talking-head. Repo của bạn xuất **motion-graphic overlay keyable trên nền chroma/trong suốt**. File này
> là lớp **repo GHI ĐÈ kiến thức nguồn** — khi mâu thuẫn, file này thắng.

---

## 1. Bối cảnh output: KEYABLE, nền TRONG SUỐT (không phải nền tối full-frame)

- `motion-config.ts` mặc định `CONFIG.background: 'transparent'` — composition render trên nền chroma để
  user **key ra ở app ngoài (CapCut...)**. Đây KHÔNG phải video nền tối phủ kín.
- **Hệ quả — điều chỉnh kiến thức nguồn:**
  - "Hero render trên nền tối `#0A0B0A`/dark grid" (scene-catalog/taste-rules) chỉ đúng khi user muốn một
    scene **BAKED** (không key). Mặc định overlay keyable → **nền trong suốt**, KHÔNG đổ nền tối full-frame.
    Không chắc user muốn baked hay keyable → **HỎI**.
  - Các cơ chế giả định "có lớp speaker video bên dưới" KHÔNG áp dụng cho scene motion-graphic độc lập:
    **coverage underlay** (không có speaker để che), **follow-cam / speaker zoom**, **ColorGrade phủ cả
    comp** (vignette/duotone là lớp alpha phủ toàn khung → phá nền trong suốt). Chỉ dùng khi bạn thực sự
    dựng trên một video track.
  - **caption↔speaker positioning** (lower-third dưới cằm) chỉ có nghĩa khi có talking head. Scene thuần
    đồ hoạ → đặt text theo bố cục scene, không theo "mặt người".

## 2. 🔴 CHROMA-KEY-SAFE (bắt buộc — trích motion-scene.tsx)

Vì nền là chroma để key: **bất kỳ blur/bán trong suốt nào vẽ RA NGOÀI cạnh phần tử NGOÀI CÙNG của comp sẽ
dính màu chroma khi key.** Luật:

- ✅ Glow/shadow có blur CHỈ an toàn khi nằm **hoàn toàn bên trong** một phần tử cha có nền **đục 100%**
  (không chạm tới nền chroma ngoài cùng).
- ✅ Cạnh ngoài cùng của cả comp: chỉ dùng `box-shadow` **KHÔNG blur** (`0 0 0 Npx color`), hoặc không gì.
- ❌ KHÔNG đặt `box-shadow` blur-radius > 0, `filter: blur/drop-shadow`, hay gradient alpha < 1 trên phần
  tử ngoài cùng bao trọn scene.

**Điều chỉnh các hiệu ứng của skill:**
| Hiệu ứng nguồn | Vấn đề chroma | Cách làm an toàn |
|---|---|---|
| `image_card` frosted glass (`backdropFilter: blur`) | blur ra nền chroma | Chỉ dùng blur bên trong một card nền đục 100%, card không chạm cạnh comp; hoặc bỏ blur, dùng viền đặc |
| Entrance "blur tan dần" (`filter: blur(8px)→0`) | filter blur trên phần tử ngoài | Thay bằng **opacity + translate settle** (fade+rise); nếu cần blur, giữ TRONG container đục |
| Glow lime quanh element | drop-shadow blur ra ngoài | `box-shadow: 0 0 0 Npx rgba(0,255,65,..)` (viền không blur), hoặc glow trong card đục |
| ColorGrade vignette/duotone toàn comp | lớp alpha phủ cả khung | **BỎ** cho output keyable |

## 3. Content ngoài 3 layer schema → khai vào RawSchema

3 schema chuẩn (`TextLayerSchema`/`AssetLayerSchema`/`BackgroundSchema`) chỉ là **style + vị trí**. Nội dung
thật (chuỗi `value`/`caption`, mảng `items[]`, `appear_sec`, số `target`...) KHÔNG có trong đó — phải **khai
thêm field riêng vào `RawSchema`** trong motion-scene.tsx. Xem [worked-example.md](worked-example.md) cho
khuôn cụ thể. `WidgetSpec` hỗ trợ `text`/`number`/`select`... nên field content hiện được trên panel.

## 4. Ràng buộc pattern (nhắc lại, từ CLAUDE.md + EDITOR-integration.md)

- Chỉ **2 file** sửa: `motion-config.ts` + `player/items/motion-scene.tsx` (+ `mock.ts` cho data). Schema
  nhúng trong motion-scene.tsx, KHÔNG tạo file schema/panel riêng.
- Beat component nhận `{ f, data }`; `useCurrentFrame()` CHỈ ở `SceneContent`. Chỉ animate `transform`+`opacity`.
  KHÔNG CSS transition/animation, KHÔNG `interpolate()` Remotion. Easing từ motion-config (`s4ei/s4eo/s4vis/s4eb`).
- Canvas **1080×1920**. Mỗi lần chỉ **một** motion scene (thay 2 file, không cộng dồn). 5 điểm đăng ký editor
  đã cố định — KHÔNG sửa.
- Mọi màu/size/spacing từ `src/brand.ts` hoặc reference — không hardcode trong JSX.

## 5. Kiểm trước khi xong (bắt buộc)

```bash
node src/scripts/test-motion-schema.mjs      # 0 FAIL
```
- [ ] `mock.ts` metadata khớp CHÍNH XÁC schema (field names + defaults).
- [ ] `npx tsc --noEmit` 0 error trong `src/`.
- [ ] Không blur/drop-shadow/alpha-gradient trên phần tử ngoài cùng (chroma-safe).
- [ ] Nền: trong suốt nếu keyable; chỉ đổ nền đục khi user muốn baked.
- [ ] Content fields đã khai trong RawSchema (không giả định có sẵn trong 3 layer schema).
