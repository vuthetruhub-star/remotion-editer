import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import { CircleOff } from "lucide-react";
import { getTextShadow, type IBoxShadow } from "../common/text-shadow";
import FloatingPanel from "./floating-panel";

interface ITextPreset {
  backgroundColor: string;
  color: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow?: IBoxShadow;
}

export const NONE_PRESET: ITextPreset = {
  backgroundColor: "transparent",
  color: "#ffffff",
  borderRadius: 0,
  borderWidth: 0,
  borderColor: "transparent"
};

export const TEXT_PRESETS: ITextPreset[] = [
  {
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent"
  },
  {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent"
  },
  {
    borderWidth: 12,
    borderColor: "#000",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "#fff"
  },
  {
    borderWidth: 12,
    borderColor: "#fff",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "#000"
  },
  {
    backgroundColor: "#8120fd",
    color: "#fff",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent"
  },
  {
    backgroundColor: "#ffde00",
    color: "#000",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent"
  },
  {
    backgroundColor: "transparent",
    color: "#6eb5d6",
    borderRadius: 10,
    borderWidth: 12,
    borderColor: "#0f1fac",
    boxShadow: { color: "#0f1fac", x: -12, y: 12, blur: 0 }
  },
  {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: 10,
    borderWidth: 12,
    borderColor: "#000",
    boxShadow: { color: "#000", x: -12, y: 12, blur: 0 }
  },
  {
    backgroundColor: "#000",
    color: "#6af1af",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent"
  },
  {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: 10,
    borderWidth: 12,
    borderColor: "#dd4882",
    boxShadow: { color: "#dd4882", x: 0, y: 0, blur: 100 }
  },
  {
    backgroundColor: "transparent",
    color: "#000000",
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "transparent",
    boxShadow: { color: "#5ed869", x: 8, y: 8, blur: 0 }
  },
  {
    backgroundColor: "transparent",
    color: "#f5be36",
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "transparent",
    boxShadow: { color: "#b12019", x: 8, y: 8, blur: 0 }
  },
  {
    backgroundColor: "transparent",
    color: "#eed955",
    borderRadius: 10,
    borderWidth: 12,
    borderColor: "#000000"
  },
  {
    backgroundColor: "transparent",
    color: "#5ba2eb",
    borderRadius: 10,
    borderWidth: 12,
    borderColor: "#ffffff"
  }
];

export const applyPreset = (preset: any, trackItem: ITrackItem & any) => {
  const overrides: any = {};
  if (preset.boxShadow === undefined) {
    preset.boxShadow = { color: "transparent", x: 0, y: 0, blur: 0 };
  }

  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: {
        details: { ...preset, ...overrides }
      }
    }
  });
};
export default function TextPresetPicker({
  trackItem
}: {
  trackItem: ITrackItem & any;
}) {
  return (
    <FloatingPanel title="Presets">
      <ScrollArea className="h-[400px] w-full py-0">
        <div className="grid grid-cols-3 gap-2 px-4">
          <div
            onClick={() => applyPreset(NONE_PRESET, trackItem)}
            className="flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800"
          >
            <CircleOff />
          </div>

          {TEXT_PRESETS.map((preset, index) => (
            <div
              key={index}
              onClick={() => applyPreset(preset, trackItem)}
              className="text-md flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800"
            >
              <div
                style={{
                  backgroundColor: preset.backgroundColor,
                  color: preset.color,
                  borderRadius: `${preset.borderRadius}px`,
                  WebkitTextStroke: `2px ${preset.borderColor}`,
                  paintOrder: "stroke fill",
                  fontWeight: "bold",
                  textShadow: getTextShadow(preset.boxShadow)
                }}
                className="h-6 place-content-center px-2"
              >
                Text
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </FloatingPanel>
  );
}
