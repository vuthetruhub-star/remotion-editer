"use client";
// auto-panel.tsx — panel chỉnh sửa TỰ SINH từ Zod schema + widget map.
//
// Đây là phần lõi của giải pháp "no-code": thay vì viết tay từng ô input cho
// mỗi field, truyền vào 1 schema phẳng
// (TextLayerSchema / AssetLayerSchema / BackgroundSchema, hoặc bất kỳ
// z.object() phẳng nào) + widget map tương ứng (từ schemas/_shared.ts hoặc tự
// định nghĩa) — AutoPanel tự vẽ đúng loại ô nhập (slider/color/checkbox/select)
// cho từng field, và gọi onChange({ [field]: value }) khi user chỉnh.
//
// Field mới thêm vào schema + widget map → panel TỰ CÓ THÊM ô chỉnh, không
// cần sửa file panel nào cả.

import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { WidgetSpec } from "../player/items/schemas/_shared";

// Nhãn hiển thị đẹp hơn tên field kỹ thuật (vd "effectDuration" → "Effect Duration").
function labelize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

// Section chuẩn để mô tả panel của cả 1 motion — motion-scene.tsx export mảng
// PanelSection[] này (PANEL_SECTIONS), panel chung (basic-motion-scene.tsx) tự
// đọc và vẽ — không cần viết file panel riêng cho từng motion nữa.
export interface PanelSection {
  title: string;
  schema: z.ZodObject<z.ZodRawShape>;
  widgets: Record<string, WidgetSpec>;
  // Có tabs → field này là 1 NHÓM lặp lại theo tên (vd 7 icon): mỗi tab dùng
  // chung schema/widgets, đọc/ghi vào data[tab đang chọn]. Không có tabs →
  // field áp thẳng lên object cấp cao nhất (accentColor, background...).
  tabs?: string[];
}

export interface AutoPanelProps<T extends Record<string, unknown>> {
  schema: z.ZodObject<z.ZodRawShape>;
  widgets: Record<string, WidgetSpec>;
  data: Partial<T>;
  onChange: (patch: Partial<T>) => void;
  title?: string;
}

export function AutoPanel<T extends Record<string, unknown>>({
  schema,
  widgets,
  data,
  onChange,
  title,
}: AutoPanelProps<T>) {
  const keys = Object.keys(schema.shape);

  return (
    <div className="flex flex-col gap-3">
      {title && <Label className="font-sans text-xs font-semibold">{title}</Label>}
      {keys.map((key) => {
        const widget = widgets[key] ?? { type: "text" };
        // Khi data chưa có field này (object rỗng {}) — lấy default THẬT từ
        // chính schema, không hardcode 0/"" — nếu không slider sẽ hiện sai
        // (vd scale mặc định 1 nhưng hiện 0).
        const fieldDefault = schema.shape[key]?.safeParse(undefined);
        const fallback = fieldDefault?.success ? fieldDefault.data : undefined;
        const value = data[key as keyof T] ?? fallback;
        const commit = (v: unknown) => onChange({ [key]: v } as Partial<T>);

        if (widget.type === "checkbox") {
          return (
            <label key={key} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              {labelize(key)}
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => commit(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
            </label>
          );
        }

        if (widget.type === "select") {
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{labelize(key)}</label>
              <select
                value={String(value ?? widget.options[0])}
                onChange={(e) => commit(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {widget.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        if (widget.type === "color") {
          const hex = /^#/.test(String(value ?? "")) ? String(value) : "#FFFFFF";
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{labelize(key)}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => commit(e.target.value)}
                  className="h-7 w-12 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5"
                />
                <input
                  type="text"
                  defaultValue={String(value ?? "")}
                  placeholder="để trống = mặc định gốc"
                  onBlur={(e) => commit(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          );
        }

        if (widget.type === "slider") {
          const num = typeof value === "number" ? value : 0;
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">{labelize(key)}</label>
                <span className="text-xs tabular-nums text-muted-foreground">{num}</span>
              </div>
              <Slider
                value={[num]}
                min={widget.min}
                max={widget.max}
                step={widget.step ?? 1}
                onValueChange={([v]) => commit(v)}
              />
            </div>
          );
        }

        if (widget.type === "number") {
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{labelize(key)}</label>
              <input
                type="number"
                defaultValue={typeof value === "number" ? value : 0}
                onBlur={(e) => commit(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          );
        }

        // fallback: text
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{labelize(key)}</label>
            <input
              type="text"
              defaultValue={String(value ?? "")}
              onBlur={(e) => commit(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        );
      })}
    </div>
  );
}

export default AutoPanel;
