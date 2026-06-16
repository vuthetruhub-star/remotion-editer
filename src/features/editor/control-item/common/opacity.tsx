import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Opacity = ({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [editing, setEditing] = useState<string | null>(null);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(Math.min(100, Math.max(0, n)));
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs text-muted-foreground">Opacity</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-16 shrink-0">
          <Input
            type="number"
            className="h-7 text-xs pr-5"
            value={editing ?? String(Math.round(value))}
            min={0}
            max={100}
            step={1}
            onChange={(e) => setEditing(e.target.value)}
            onFocus={() => setEditing(String(Math.round(value)))}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(editing ?? String(value)); }}
          />
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none select-none">%</span>
        </div>
        <input
          type="range"
          className="flex-1 h-1.5 accent-white cursor-pointer"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Opacity;
