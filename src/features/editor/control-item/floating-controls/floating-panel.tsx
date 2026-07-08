"use client";
// FloatingPanel — wrapper dùng chung cho mọi panel nổi bên phải control-item
// (preset picker, font picker, animation picker...). Trước đây mỗi panel tự
// viết lại y hệt: ref + useClickOutside + header "handle" (title + nút đóng)
// + khung bo viền. Gộp về đây để chỉ còn 1 nơi giữ layout/style header.
import { useRef } from "react";
import { XIcon } from "lucide-react";
import useClickOutside from "../../hooks/useClickOutside";
import useLayoutStore from "../../store/use-layout-store";

export default function FloatingPanel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { setFloatingControl } = useLayoutStore();
  const floatingRef = useRef<HTMLDivElement>(null);
  useClickOutside(floatingRef as React.RefObject<HTMLElement>, () =>
    setFloatingControl("")
  );

  return (
    <div
      ref={floatingRef}
      className="absolute left-full top-2 z-200 ml-2 w-56 bg-card p-0 border"
    >
      <div className="handle flex cursor-grab items-center justify-between px-4 py-3">
        <p className="text-sm font-bold">{title}</p>
        <div className="h-4 w-4" onClick={() => setFloatingControl("")}>
          <XIcon className="h-3 w-3 cursor-pointer font-extrabold text-muted-foreground" />
        </div>
      </div>
      {children}
    </div>
  );
}
