import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ITrackItem, ITransition } from "@designcombo/types";
import { ISize } from "@designcombo/types";
import { SequenceItem } from "../features/editor/player/sequence-item";
import { groupTrackItems } from "../features/editor/utils/track-items";
import { TransitionSeries, Transitions } from "@designcombo/transitions";

export interface RenderCompositionProps {
  trackItemIds: string[];
  trackItemsMap: Record<string, ITrackItem>;
  transitionsMap: Record<string, ITransition>;
  fps: number;
  size: ISize;
  background: { type: "color" | "image"; value: string };
  duration: number;
}

export const RenderComposition = ({
  trackItemIds,
  trackItemsMap,
  transitionsMap,
  fps,
  size,
  background,
}: RenderCompositionProps) => {
  const frame = useCurrentFrame();

  const groupedItems = groupTrackItems({
    trackItemIds,
    transitionsMap,
    trackItemsMap,
  });

  return (
    <AbsoluteFill
      style={{ background: background?.value || "transparent" }}
    >
      {groupedItems.map((group, index) => {
        if (group.length === 1) {
          const item = trackItemsMap[(group[0] as ITrackItem).id];
          if (!item || !SequenceItem[item.type]) return null;
          return SequenceItem[item.type](item, {
            fps,
            handleTextChange: () => {},
            onTextBlur: () => {},
            editableTextId: null,
            frame,
            size,
            isTransition: false,
          });
        }
        const firstItem = trackItemsMap[(group[0] as ITrackItem).id];
        if (!firstItem) return null;
        const from = (firstItem.display.from / 1000) * fps;
        return (
          <TransitionSeries from={from} key={index}>
            {group.map((groupEl) => {
              const t = groupEl as ITransition;
              if (t.fromId !== undefined) {
                const durationInFrames = (t.duration / 1000) * fps;
                return Transitions[t.kind]?.({
                  durationInFrames,
                  ...size,
                  id: t.id,
                  direction: t.direction,
                });
              }
              const item = trackItemsMap[(groupEl as ITrackItem).id];
              if (!item || !SequenceItem[item.type]) return null;
              return SequenceItem[item.type](item, {
                fps,
                handleTextChange: () => {},
                editableTextId: null,
                isTransition: true,
                size,
              });
            })}
          </TransitionSeries>
        );
      })}
    </AbsoluteFill>
  );
};
