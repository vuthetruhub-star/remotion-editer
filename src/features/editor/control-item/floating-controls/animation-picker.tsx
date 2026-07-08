import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADD_ANIMATION } from "@designcombo/state";
import { dispatch } from "@designcombo/events";
import useStore from "../../store/use-store";
import { Animation, presets } from "../../player/animated";
import React from "react";
import { Easing } from "remotion";
import { PresetName } from "../../player/animated/presets";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimationDuration } from "../common/animation-duration";
import FloatingPanel from "./floating-panel";

// Clears the animation for a given slot (in/out/loop) by writing an empty
// composition — the render side treats an empty composition as "no animation",
// same contract as every real preset in player/animated/presets.ts.
export const clearAnimation = (type: "in" | "out" | "loop", activeIds: string[]) => {
  if (!activeIds.length) {
    console.warn("No active ID to clear the animation on.");
    return;
  }
  dispatch(ADD_ANIMATION, {
    payload: {
      id: activeIds[0],
      animations: {
        [type]: { name: "None", composition: [] }
      }
    }
  });
};

export const NoneButton = ({
  type,
  activeIds,
  trackItemsMap
}: {
  type: "in" | "out" | "loop";
  activeIds: string[];
  trackItemsMap: any;
}) => {
  const currentItem = trackItemsMap?.[activeIds[0]];
  const isSelected = currentItem?.animations?.[type]?.name === "None";

  return (
    <div
      className={`flex cursor-pointer flex-col gap-2 text-center text-xs text-muted-foreground items-center justify-center border ${
        isSelected ? "border-[#006239]" : ""
      }`}
      onClick={() => clearAnimation(type, activeIds)}
    >
      <div
        style={{ width: "60px", height: "60px", borderRadius: "8px" }}
        className="flex items-center justify-center bg-muted"
      >
        <span className="text-[10px] text-muted-foreground">None</span>
      </div>
      <div>None</div>
    </div>
  );
};

export const createPresetButtons = (
  filter: (key: string) => boolean,
  type: "in" | "out" | "loop",
  activeIds: string[],
  animationType: "text" | "media",
  trackItemsMap: any
) =>
  Object.keys(presets)
    .filter(filter)
    .map((presetKey) => {
      const preset = presets[presetKey as "scaleIn"];

      const style = React.useMemo(
        () => ({
          backgroundImage: `url(${preset.previewUrl})`,
          backgroundSize: "cover",
          width: "60px",
          height: "60px",
          borderRadius: "8px"
        }),
        [preset.previewUrl]
      );
      if (
        animationType === "media" &&
        preset.property?.toLowerCase().includes("text")
      )
        return;
      let borderColor = "";
      if (trackItemsMap) {
        const currentItem = trackItemsMap[activeIds[0]];
        const animations = currentItem?.animations;

        const isSelected = ["in", "out", "loop"].some(
          (type) => animations?.[type]?.name === presetKey
        );

        if (isSelected) {
          borderColor = "border-[#006239]";
        }
      }

      return (
        <div
          key={presetKey}
          className={`flex cursor-pointer flex-col gap-2 text-center text-xs text-muted-foreground items-center justify-center border ${borderColor}`}
          onClick={() =>
            applyAnimation(
              presetKey as PresetName,
              type,
              activeIds,
              trackItemsMap
            )
          }
        >
          <div style={style} draggable={false} />
          <div>{preset.name}</div>
        </div>
      );
    });

const applyAnimation = (
  presetName: PresetName,
  type: "in" | "out" | "loop",
  activeIds: string[],
  trackItemsMap: any
) => {
  if (!activeIds.length) {
    console.warn("No active ID to apply the animation to.");
    return;
  }
  const presetAnimation: any = presets[presetName];
  const composition: Animation[] = [presetAnimation];
  if (presetName.includes("rotate") && presetName.includes("In"))
    composition.push(presets.scaleIn);
  else if (presetName.includes("shake") && presetName.includes("In")) {
    const shakeMovX = trackItemsMap[activeIds[0]].details.width / 6;
    const shakeMovY = trackItemsMap[activeIds[0]].details.height / 6;
    composition[0].from = presetName.includes("Horizontal")
      ? shakeMovX
      : shakeMovY;
    composition[0].to = presetName.includes("Horizontal")
      ? -shakeMovX
      : -shakeMovY;
    composition.push({
      property: "scale",
      from: 2,
      to: 1,
      durationInFrames: 30,
      ease: Easing.ease,
      previewUrl: "https://cdn.designcombo.dev/animations/ScaleIn.webp",
      name: "Scale"
    });
  } else if (presetName.includes("shake") && presetName.includes("Out")) {
    const shakeMovX = trackItemsMap[activeIds[0]].details.width / 6;
    const shakeMovY = trackItemsMap[activeIds[0]].details.height / 6;
    composition[0].from = presetName.includes("Horizontal")
      ? -shakeMovX
      : -shakeMovY;
    composition[0].to = presetName.includes("Horizontal")
      ? shakeMovX
      : shakeMovY;
    composition.push({
      property: "scale",
      from: 1,
      to: 2,
      durationInFrames: 30,
      ease: Easing.ease,
      previewUrl: "https://cdn.designcombo.dev/animations/ScaleOut.webp",
      name: "Scale"
    });
  }
  dispatch(ADD_ANIMATION, {
    payload: {
      id: activeIds[0],
      animations: {
        [type]: {
          name: presetName,
          composition
        }
      }
    }
  });
};
export default function AnimationPicker({
  animationType = "media"
}: {
  animationType?: "text" | "media";
}) {
  const { activeIds, trackItemsMap } = useStore();

  const presetInButtons = createPresetButtons(
    (key) => key.includes("In"),
    "in",
    activeIds,
    animationType,
    trackItemsMap
  );
  const presetOutButtons = createPresetButtons(
    (key) => key.includes("Out"),
    "out",
    activeIds,
    animationType,
    trackItemsMap
  );
  const presetLoopButtons = createPresetButtons(
    (key) => key.includes("Loop"),
    "loop",
    activeIds,
    animationType,
    trackItemsMap
  );
  return (
    <FloatingPanel title="Animations">
      <Tabs defaultValue="in" className="w-full px-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in">In</TabsTrigger>
          <TabsTrigger value="loop">Loop</TabsTrigger>
          <TabsTrigger value="out">Out</TabsTrigger>
        </TabsList>

        <TabsContent value="in">
          <ScrollArea className="h-[400px] w-full py-2">
            <div className="grid grid-cols-3 gap-2 py-4">
              <NoneButton type="in" activeIds={activeIds} trackItemsMap={trackItemsMap} />
              {presetInButtons}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="loop">
          <ScrollArea className="h-[400px] w-full py-2">
            <div className="grid grid-cols-3 gap-2 py-4">
              <NoneButton type="loop" activeIds={activeIds} trackItemsMap={trackItemsMap} />
              {presetLoopButtons}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="out">
          <ScrollArea className="h-[400px] w-full py-2">
            <div className="grid grid-cols-3 gap-2 py-4">
              <NoneButton type="out" activeIds={activeIds} trackItemsMap={trackItemsMap} />
              {presetOutButtons}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <AnimationDuration />
    </FloatingPanel>
  );
}
