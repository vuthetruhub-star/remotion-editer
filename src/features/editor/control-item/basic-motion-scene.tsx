"use client";
// basic-motion-scene.tsx — panel CỐ ĐỊNH, dùng chung mãi mãi cho mọi motion.
//
// KHÔNG viết panel riêng theo từng ý tưởng motion nữa. File này tự đọc
// PANEL_SECTIONS (export từ player/items/motion-scene.tsx) và dùng AutoPanel
// để vẽ — khi đổi nội dung motion, chỉ cần cập nhật PANEL_SECTIONS trong
// motion-scene.tsx, KHÔNG sửa file này.

import { useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import { Label } from "@/components/ui/label";
import { AutoPanel, type PanelSection } from "./auto-panel";
import { PANEL_SECTIONS } from "../player/items/motion-scene";

const dispatchTopLevel = (trackItem: ITrackItem, patch: Record<string, unknown>) =>
  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: {
        metadata: { ...(trackItem.metadata ?? {}), ...patch },
      },
    },
  });

const dispatchNested = (trackItem: ITrackItem, key: string, patch: Record<string, unknown>) => {
  const meta = (trackItem.metadata ?? {}) as Record<string, unknown>;
  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: {
        metadata: { ...meta, [key]: { ...((meta[key] as Record<string, unknown>) ?? {}), ...patch } },
      },
    },
  });
};

function SectionRenderer({ section, meta, trackItem }: {
  section: PanelSection;
  meta: Record<string, unknown>;
  trackItem: ITrackItem;
}) {
  const [activeTab, setActiveTab] = useState<string | undefined>(section.tabs?.[0]);

  if (section.tabs) {
    const active = activeTab ?? section.tabs[0];
    return (
      <div className="flex flex-col gap-2">
        <Label className="font-sans text-xs font-semibold">{section.title}</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {section.tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                active === tab
                  ? "border-ring bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>
        <AutoPanel
          schema={section.schema}
          widgets={section.widgets}
          data={(meta[active] as Record<string, unknown>) ?? {}}
          onChange={(patch) => dispatchNested(trackItem, active, patch)}
        />
      </div>
    );
  }

  return (
    <AutoPanel
      title={section.title}
      schema={section.schema}
      widgets={section.widgets}
      data={meta}
      onChange={(patch) => dispatchTopLevel(trackItem, patch)}
    />
  );
}

export default function BasicMotionScene({ trackItem }: { trackItem: ITrackItem }) {
  const meta = (trackItem.metadata ?? {}) as Record<string, unknown>;

  return (
    <div className="flex lg:h-[calc(100vh-84px)] flex-1 flex-col overflow-hidden min-h-[340px]">
      <div className="flex flex-col gap-4 px-4 py-4">
        <Label className="font-sans text-xs font-semibold">Motion Scene</Label>
        {PANEL_SECTIONS.map((section, i) => (
          <SectionRenderer key={i} section={section} meta={meta} trackItem={trackItem} />
        ))}
      </div>
    </div>
  );
}
