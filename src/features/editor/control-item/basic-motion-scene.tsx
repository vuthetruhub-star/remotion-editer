"use client";
// basic-motion-scene.tsx — panel CỐ ĐỊNH, dùng chung cho mọi motion.
//
// KHÔNG viết panel riêng theo từng kind. File này đọc `panelSections` của kind hiện
// tại (registry: player/items/motion-scenes) và dùng AutoPanel để vẽ. Thêm/đổi field
// của một kind → cập nhật panelSections trong file kind đó, KHÔNG sửa file này.
import { useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import { Label } from "@/components/ui/label";
import { AutoPanel, type PanelSection } from "./auto-panel";
import {
  MOTION_SCENE_COMPONENTS,
  MOTION_SCENE_KINDS,
  getMotionSceneModule,
} from "../player/items/motion-scenes";

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
  const kind = typeof meta.kind === "string" && MOTION_SCENE_COMPONENTS[meta.kind] ? meta.kind : "default";
  const sections = getMotionSceneModule(kind).panelSections;

  const onKindChange = (newKind: string) => {
    // đổi kind → nạp defaultMeta của kind mới (giữ id/kind), field cũ dư bị bỏ qua khi parse
    dispatchTopLevel(trackItem, { kind: newKind, ...getMotionSceneModule(newKind).defaultMeta });
  };

  return (
    <div className="flex lg:h-[calc(100vh-84px)] flex-1 flex-col overflow-hidden min-h-[340px]">
      <div className="flex flex-col gap-4 px-4 py-4">
        <Label className="font-sans text-xs font-semibold">Motion Scene</Label>

        <div className="flex flex-col gap-1.5">
          <Label className="font-sans text-xs font-semibold">Kind</Label>
          <select
            value={kind}
            onChange={(e) => onKindChange(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          >
            {MOTION_SCENE_KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {sections.map((section, i) => (
          <SectionRenderer key={`${kind}-${i}`} section={section} meta={meta} trackItem={trackItem} />
        ))}
      </div>
    </div>
  );
}
