// RENAME: Replace ids and type keys with your project name.
// Type key "motionScene" must match the key in sequence-item.tsx, timeline.tsx, and control-item.tsx.
import { TEXT_DEFAULTS } from "./motion-config";

export const design = {
  id: "motion-scene-default",
  fps: 30,
  tracks: [
    {
      id: "track-motion-main",
      type: "video",
      name: "MotionScene",
      accepts: [
        "text",
        "image",
        "video",
        "audio",
        "composition",
        "caption",
        "template",
        "motionScene",
      ],
      items: ["motion-scene-item-1"],
      magnetic: false,
      static: false,
    },
  ],
  size: {
    width: 1080,
    height: 1920,
  },
  trackItemIds: ["motion-scene-item-1"],
  transitionsMap: {},
  trackItemsMap: {
    "motion-scene-item-1": {
      id: "motion-scene-item-1",
      name: "Motion Scene 1",
      type: "motionScene",
      display: {
        from: 0,
        to: 5000,
      },
      duration: 5000,
      details: {
        width: 1080,
        height: 1920,
        top: 0,
        left: 0,
        opacity: 100,
        transform: "none",
        rotate: "0deg",
        blur: 0,
        brightness: 100,
        flipX: false,
        flipY: false,
        visibility: "visible",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "transparent",
        boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
      },
      animations: {},
      metadata: { ...TEXT_DEFAULTS },
    },
  },
};
