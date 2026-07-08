import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS, EDIT_OBJECT, LAYER_DELETE } from "@designcombo/state";
import { ITrackItem, ITrackItemsMap } from "@designcombo/types";
import { CircleOff } from "lucide-react";
import useStore from "../../store/use-store";
import { useEffect, useState } from "react";
import { groupBy } from "lodash";
import { loadFonts } from "../../utils/fonts";
import { transformCaptions } from "../common/caption-words";
import { generateId } from "@designcombo/timeline";
import { PresetPicker } from "../common/preset-picker";
import { getTextShadow, type IBoxShadow } from "../common/text-shadow";
import FloatingPanel from "./floating-panel";
export interface ICaptionsControlProps {
  type?: "word" | "lines";
  appearedColor: string;
  activeColor: string;
  activeFillColor: string;
  color: string;
  isKeywordColor?: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  boxShadow?: IBoxShadow;
  animation?: string;
  fontFamily?: string;
  fontUrl?: string;
  textTransform?: string;
  previewUrlDynamic?: string;
  previewUrlStatic?: string;
  textAlign?: string;
  preservedColorKeyWord?: boolean;
}

export const NONE_PRESET: ICaptionsControlProps = {
  appearedColor: "#000000",
  activeColor: "#000000",
  activeFillColor: "transparent",
  color: "#000000",
  backgroundColor: "transparent",
  borderColor: "transparent",
  borderWidth: 0,
  boxShadow: { color: "#000000", x: 15, y: 15, blur: 60 }
};
export { STYLE_CAPTION_PRESETS } from "../../data/caption-presets";

export const applyPreset = async (
  preset: any,
  captionItemIds: string[],
  captionsData: any[]
) => {
  if (preset.boxShadow === undefined) {
    preset.boxShadow = { color: "transparent", x: 0, y: 0, blur: 0 };
  }
  if (preset.animation === undefined) {
    preset.animation = "";
  }
  if (preset.fontFamily === undefined) {
    preset.fontFamily = "Bangers-Regular";
  }
  if (preset.fontUrl === undefined) {
    preset.fontUrl =
      "https://fonts.gstatic.com/s/bangers/v13/FeVQS0BTqb0h60ACL5la2bxii28.ttf";
  }
  if (preset.textTransform === undefined) {
    preset.textTransform = "none";
  }
  if (preset.textAlign === undefined) {
    preset.textAlign = "center";
  }
  if (preset.isKeywordColor === undefined) {
    preset.isKeywordColor = "transparent";
  }

  if (preset.preservedColorKeyWord === undefined) {
    preset.preservedColorKeyWord = false;
  }

  let newData = transformCaptions(
    captionsData,
    preset.type === "word" ? "singleWord" : "time"
  );

  await loadFonts([
    {
      name: preset.fontFamily,
      url: preset.fontUrl
    }
  ]);

  const { previewUrlDynamic, previewUrlStatic, type, ...sanitizedPreset } =
    preset;
  dispatch(LAYER_DELETE, {
    payload: {
      trackItemIds: captionsData.map((item) => item.id)
    }
  });

  dispatch(ADD_ITEMS, {
    payload: {
      trackItems: newData.map((item) => ({
        ...item,
        details: {
          ...item.details,
          ...sanitizedPreset
        }
      })),
      tracks: [
        {
          id: generateId(),
          items: newData.map((item) => item.id),
          type: "caption"
        }
      ]
    }
  });
};

export const groupCaptionItems = (trackItemsMap: ITrackItemsMap) => {
  const captionTrackItems = Object.values(trackItemsMap).filter(
    ({ type }: ITrackItem) => type === "caption"
  );
  return groupBy(captionTrackItems, "metadata.sourceUrl");
};
export default function CaptionPresetPicker({
  trackItem
}: {
  trackItem: ITrackItem & any;
}) {
  const { trackItemsMap } = useStore();
  const [captionItemIds, setCaptionItemIds] = useState<string[]>([]);
  const [captionsData, setCaptionsData] = useState<any[]>([]);

  useEffect(() => {
    const groupedCaptions = groupCaptionItems(trackItemsMap);

    const currentGroupItems = groupedCaptions[trackItem.metadata.sourceUrl];
    const captionItemIds = currentGroupItems?.map((item) => item.id);
    setCaptionItemIds(captionItemIds);
    setCaptionsData(currentGroupItems);
  }, [trackItemsMap, trackItem]);

  return (
    <FloatingPanel title="Presets">
      <PresetPicker
        captionItemIds={captionItemIds}
        captionsData={captionsData}
        onPresetClick={applyPreset}
      />
    </FloatingPanel>
  );
}
