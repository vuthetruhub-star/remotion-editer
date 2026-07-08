import React, { useEffect, useRef, useState } from "react";
import useStore from "./store/use-store";
import {
  IAudio,
  ICaption,
  IImage,
  ITrackItem,
  ITrackItemAndDetails,
  IVideo
} from "@designcombo/types";
import useLayoutStore from "./store/use-layout-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { Icons } from "@/components/shared/icons";
import BasicText from "./control-item/basic-text";
import BasicCaption from "./control-item/basic-caption";
import BasicImage from "./control-item/basic-image";
import BasicVideo from "./control-item/basic-video";
import BasicAudio from "./control-item/basic-audio";
import { motion, PanInfo, useAnimation } from "framer-motion";
import ColorPicker from "@/components/color-picker";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { Label } from "@/components/ui/label";

const ActiveControlItem = ({
  trackItem,
  handleMenuItemClick
}: {
  trackItem?: ITrackItemAndDetails;
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => {
  return (
    <>
      {
        {
          text: <ItemText handleMenuItemClick={handleMenuItemClick} />,
          caption: <ItemCaption handleMenuItemClick={handleMenuItemClick} />,
          image: <ItemImage handleMenuItemClick={handleMenuItemClick} />,
          video: <ItemVideo handleMenuItemClick={handleMenuItemClick} />,
          audio: <ItemAudio handleMenuItemClick={handleMenuItemClick} />
        }[trackItem?.type as "text"]
      }
    </>
  );
};

// 1 component tham số hoá field, thay cho 8 bản *ColorPickerControl gần như
// giống hệt nhau (chỉ khác field nào trong `details` được đọc/ghi + label).
const GenericColorPickerControl = ({
  trackItem,
  label,
  defaultValue = "#ffffff",
  getValue,
  buildPayload
}: {
  trackItem?: ITrackItemAndDetails;
  label: string;
  defaultValue?: string;
  getValue: (details: any) => string | undefined;
  buildPayload: (color: string) => Record<string, any>;
}) => {
  const [localValue, setLocalValue] = useState<string>(defaultValue);

  useEffect(() => {
    setLocalValue(getValue(trackItem?.details) || defaultValue);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: buildPayload(color)
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">{label}</Label>
      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const ControlItem = ({
  trackItem,
  feature
}: {
  trackItem?: ITrackItemAndDetails;
  feature: string;
}) => {
  // First check if it's a custom feature (like strokeColor, color, shadowColor, backgroundColor, caption colors)
  if (feature === "color") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Color"
        getValue={(d) =>
          trackItem?.type === "text"
            ? d?.color
            : trackItem?.type === "caption"
              ? d?.appearedColor
              : d?.background
        }
        buildPayload={(color) =>
          trackItem?.type === "text"
            ? { color }
            : trackItem?.type === "caption"
              ? { appearedColor: color }
              : { background: color }
        }
      />
    );
  }

  if (feature === "strokeColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Stroke Color"
        defaultValue="#000000"
        getValue={(d) => d?.borderColor}
        buildPayload={(color) => ({ borderColor: color })}
      />
    );
  }

  if (feature === "shadowColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Shadow Color"
        defaultValue="#000000"
        getValue={(d) => d?.boxShadow?.color}
        buildPayload={(color) => ({
          boxShadow: { ...trackItem?.details?.boxShadow, color }
        })}
      />
    );
  }

  if (feature === "backgroundColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Background Color"
        getValue={(d) => d?.background}
        buildPayload={(color) => ({ background: color })}
      />
    );
  }

  if (feature === "appearedColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Appeared Color"
        getValue={(d) => d?.appearedColor}
        buildPayload={(color) => ({ appearedColor: color })}
      />
    );
  }

  if (feature === "activeColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Active Color"
        getValue={(d) => d?.activeColor}
        buildPayload={(color) => ({ activeColor: color })}
      />
    );
  }

  if (feature === "activeFillColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Active Fill Color"
        getValue={(d) => d?.activeFillColor}
        buildPayload={(color) => ({ activeFillColor: color })}
      />
    );
  }

  if (feature === "emphasizeColor") {
    return (
      <GenericColorPickerControl
        trackItem={trackItem}
        label="Emphasize Color"
        getValue={(d) => d?.isKeywordColor}
        buildPayload={(color) => ({ isKeywordColor: color })}
      />
    );
  }

  // Then check track item type for standard features
  return (
    <>
      {
        {
          text: (
            <BasicText
              trackItem={trackItem as ITrackItem & any}
              type={feature}
            />
          ),
          caption: (
            <BasicCaption
              trackItem={trackItem as ITrackItem & ICaption}
              type={feature}
            />
          ),
          image: (
            <BasicImage
              trackItem={trackItem as ITrackItem & IImage}
              type={feature}
            />
          ),
          video: (
            <BasicVideo
              trackItem={trackItem as ITrackItem & IVideo}
              type={feature}
            />
          ),
          audio: (
            <BasicAudio
              trackItem={trackItem as ITrackItem & IAudio}
              type={feature}
            />
          )
        }[trackItem?.type as "text"]
      }
    </>
  );
};

export default function ControlItemHorizontal() {
  const { activeIds, trackItemsMap, transitionsMap } = useStore();
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
  const { setTrackItem: setLayoutTrackItem } = useLayoutStore();
  const isLargeScreen = useIsLargeScreen();
  const {
    setTypeControlItem,
    typeControlItem,
    setControItemDrawerOpen,
    controItemDrawerOpen,
    setLabelControlItem
  } = useLayoutStore();

  // Framer Motion controls
  const controls = useAnimation();

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItem = trackItemsMap[id];
      if (trackItem) {
        setTrackItem(trackItem);
        setLayoutTrackItem(trackItem);
      } else {
        // id thuộc transitionsMap (không phải track item thường, vd transition
        // được chọn trên timeline) — không có panel tương ứng, phải reset để
        // tránh panel của item được chọn trước đó bị "dính" lại trên màn hình.
        setTrackItem(null);
        setLayoutTrackItem(null);
      }
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap, transitionsMap]);
  const handleMenuItemClick = (menuItem: string, label: string) => {
    if (!isLargeScreen) {
      setControItemDrawerOpen(true);
      setTypeControlItem(menuItem);
      setLabelControlItem(label);
    }
  };
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedOutsideDrawer =
        drawerRef.current && !drawerRef.current.contains(target);
      const clickedOutsideScrollArea =
        scrollAreaRef.current && !scrollAreaRef.current.contains(target);

      if (clickedOutsideDrawer && clickedOutsideScrollArea) {
        setControItemDrawerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle drag end with Framer Motion
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // Close drawer if dragged down more than 50px or with sufficient velocity
    if (offset.y > 50 || velocity.y > 500) {
      setControItemDrawerOpen(false);
    } else {
      // Animate back to original position
      controls.start({
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 300 }
      });
    }
  };

  // Animation variants
  const drawerVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: {
      y: "100%",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.2
      }
    }
  };

  return (
    <>
      <div className="flex h-12 items-center border-t">
        <ScrollArea className="w-full px-2" ref={scrollAreaRef}>
          {trackItem && (
            <ActiveControlItem
              trackItem={trackItem as ITrackItem & any}
              handleMenuItemClick={handleMenuItemClick}
            />
          )}
        </ScrollArea>
      </div>
      {!isLargeScreen && controItemDrawerOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end pointer-events-none"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={drawerVariants}
        >
          <motion.div
            ref={drawerRef}
            className="bg-background mb-12 w-full max-h-[80vh] min-h-[340px] rounded-t-lg border-t shadow-lg pointer-events-auto"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileDrag={{ scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              <motion.div
                className="flex items-center justify-center p-4 cursor-grab active:cursor-grabbing touch-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="h-1 w-24 bg-zinc-700 rounded-full" />
              </motion.div>
              <div className="flex-1 overflow-auto">
                <ControlItem
                  trackItem={trackItem as ITrackItem & any}
                  feature={typeControlItem}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
type Item = {
  icon: React.ComponentType<{ width: number }>;
  label: string;
  id: string;
};

const ItemGroup = ({
  items,
  handleMenuItemClick
}: {
  items: Item[];
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => {
  const { typeControlItem } = useLayoutStore();
  return (
    <div className="flex items-center justify-center space-x-4 min-w-max px-4">
      {items.map(({ label, id }, index) => {
        const isActive = typeControlItem === id;
        return (
          <Button
            key={index}
            onClick={() => handleMenuItemClick(id, label)}
            variant={isActive ? "default" : "ghost"}
            size={"sm"}
            className="text-muted-foreground"
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

const ItemText = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.preset, label: "Preset", id: "textPreset" },
      { icon: Icons.style, label: "Styles", id: "textControls" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.fontStroke, label: "Stroke", id: "fontStroke" },
      { icon: Icons.fontShadow, label: "Shadow", id: "fontShadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemCaption = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.preset, label: "Preset", id: "captionPreset" },
      { icon: Icons.type, label: "Words", id: "captionWords" },
      { icon: Icons.style, label: "Styles", id: "textControls" },
      { icon: Icons.animation, label: "Colors", id: "captionColors" },
      { icon: Icons.fontStroke, label: "Stroke", id: "fontStroke" },
      { icon: Icons.fontShadow, label: "Shadow", id: "fontShadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemImage = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.crop, label: "Crop", id: "crop" },
      { icon: Icons.basic, label: "Basic", id: "basic" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.outline, label: "Outline", id: "outline" },
      { icon: Icons.shadow, label: "Shadow", id: "shadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemVideo = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.crop, label: "Crop", id: "crop" },
      { icon: Icons.basic, label: "Basic", id: "basic" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.outline, label: "Outline", id: "outline" },
      { icon: Icons.shadow, label: "Shadow", id: "shadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemAudio = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.audio, label: "Replace", id: "replace" },
      { icon: Icons.speed, label: "Speed", id: "speed" },
      { icon: Icons.volume, label: "Volume", id: "volume" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);
