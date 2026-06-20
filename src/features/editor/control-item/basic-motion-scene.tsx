"use client";
import React, { useState, useEffect } from "react";
import { IBoxShadow, ITrackItem } from "@designcombo/types";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import Opacity from "./common/opacity";
import Blur from "./common/blur";
import Brightness from "./common/brightness";
import Shadow from "./common/shadow";
import Outline from "./common/outline";
import { Animations } from "./common/animations";
import type { MotionSceneMeta, CardMeta, IconMeta, LabelMeta, TitleMeta } from "../player/items/motion-scene";

type LayerTab = "scene" | "card" | "icon" | "label" | "title";

const TABS: { key: LayerTab; label: string }[] = [
  { key: "scene", label: "Scene" },
  { key: "card",  label: "Card"  },
  { key: "icon",  label: "Icon"  },
  { key: "label", label: "Label" },
  { key: "title", label: "Title" },
];

const dispatchMeta = (trackItem: ITrackItem, patch: Partial<MotionSceneMeta>) =>
  dispatch(EDIT_OBJECT, {
    payload: { id: trackItem.id, metadata: { ...(trackItem.metadata ?? {}), ...patch } },
  });

const dispatchLayer = (
  trackItem: ITrackItem,
  layer: "card" | "icon" | "label" | "title",
  patch: Record<string, unknown>,
) => {
  const meta = (trackItem.metadata ?? {}) as MotionSceneMeta;
  dispatch(EDIT_OBJECT, {
    payload: {
      id: trackItem.id,
      metadata: { ...meta, [layer]: { ...((meta as Record<string, unknown>)[layer] ?? {}), ...patch } },
    },
  });
};

export default function BasicMotionScene({ trackItem }: { trackItem: ITrackItem }) {
  const [activeTab, setActiveTab] = useState<LayerTab>("scene");
  const [properties, setProperties] = useState(trackItem);

  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem.id, trackItem.metadata]);

  const meta  = (trackItem.metadata ?? {}) as MotionSceneMeta;
  const card  = (meta.card  ?? {}) as Partial<CardMeta>;
  const icon  = (meta.icon  ?? {}) as Partial<IconMeta>;
  const label = (meta.label ?? {}) as Partial<LabelMeta>;
  const title = (meta.title ?? {}) as Partial<TitleMeta>;

  const dispatchDetails = (patch: Record<string, unknown>) =>
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { details: patch } } });

  return (
    <div className="flex lg:h-[calc(100vh-84px)] flex-1 flex-col overflow-hidden min-h-[340px]">

      {/* Tab bar */}
      <div className="flex border-b border-border px-2 pt-2 gap-1 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
              activeTab === tab.key
                ? "bg-background border border-b-background border-border text-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 px-4 py-4">

          {/* ── SCENE TAB ── */}
          {activeTab === "scene" && (
            <>
              <div className="flex flex-col gap-3">
                <Label className="font-sans text-xs font-semibold">Scene</Label>
                <p className="text-xs text-muted-foreground">3s · 1080×1920 · 30fps</p>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Accent color</label>
                  <input
                    type="color"
                    defaultValue={meta.accentColor ?? "#00FF41"}
                    onBlur={(e) => dispatchMeta(trackItem, { accentColor: e.target.value })}
                    className="h-7 w-12 cursor-pointer rounded border border-border bg-background p-0.5"
                  />
                </div>
              </div>

              <Animations trackItem={trackItem} properties={properties} />

              <Outline
                label="Outline"
                onChageBorderWidth={(v) => { dispatchDetails({ borderWidth: v }); setProperties((p) => ({ ...p, details: { ...p.details, borderWidth: v } })); }}
                onChangeBorderColor={(v) => { dispatchDetails({ borderColor: v }); setProperties((p) => ({ ...p, details: { ...p.details, borderColor: v } })); }}
                valueBorderWidth={properties.details.borderWidth as number ?? 0}
                valueBorderColor={properties.details.borderColor as string ?? "transparent"}
              />

              <Shadow
                label="Shadow"
                onChange={(v: IBoxShadow) => { dispatchDetails({ boxShadow: v }); setProperties((p) => ({ ...p, details: { ...p.details, boxShadow: v } })); }}
                value={properties.details.boxShadow ?? { color: "transparent", x: 0, y: 0, blur: 0 }}
              />
            </>
          )}

          {/* ── CARD TAB ── */}
          {activeTab === "card" && (
            <div className="flex flex-col gap-3">
              <Label className="font-sans text-xs font-semibold">Card</Label>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Background</label>
                <input
                  type="text"
                  defaultValue={card.cardBg ?? "rgba(10, 11, 10, 0.4)"}
                  onBlur={(e) => dispatchLayer(trackItem, "card", { cardBg: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <Opacity
                onChange={(v) => dispatchLayer(trackItem, "card", { opacity: v })}
                value={card.opacity ?? 100}
              />
              <Blur
                onChange={(v) => dispatchLayer(trackItem, "card", { blur: v })}
                value={card.blur ?? 0}
              />
              <Brightness
                onChange={(v) => dispatchLayer(trackItem, "card", { brightness: v })}
                value={card.brightness ?? 100}
              />
            </div>
          )}

          {/* ── ICON TAB ── */}
          {activeTab === "icon" && (
            <div className="flex flex-col gap-3">
              <Label className="font-sans text-xs font-semibold">Icon</Label>

              <Opacity
                onChange={(v) => dispatchLayer(trackItem, "icon", { opacity: v })}
                value={icon.opacity ?? 100}
              />
              <Blur
                onChange={(v) => dispatchLayer(trackItem, "icon", { blur: v })}
                value={icon.blur ?? 0}
              />
              <Brightness
                onChange={(v) => dispatchLayer(trackItem, "icon", { brightness: v })}
                value={icon.brightness ?? 100}
              />
            </div>
          )}

          {/* ── LABEL TAB ── */}
          {activeTab === "label" && (
            <div className="flex flex-col gap-3">
              <Label className="font-sans text-xs font-semibold">Label (small)</Label>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Content</label>
                <input
                  type="text"
                  defaultValue={label.content ?? "first one"}
                  onBlur={(e) => dispatchLayer(trackItem, "label", { content: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <Opacity
                onChange={(v) => dispatchLayer(trackItem, "label", { opacity: v })}
                value={label.opacity ?? 100}
              />
              <Blur
                onChange={(v) => dispatchLayer(trackItem, "label", { blur: v })}
                value={label.blur ?? 0}
              />
            </div>
          )}

          {/* ── TITLE TAB ── */}
          {activeTab === "title" && (
            <div className="flex flex-col gap-3">
              <Label className="font-sans text-xs font-semibold">Title (large)</Label>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Content</label>
                <input
                  type="text"
                  defaultValue={title.content ?? "AI Music Method"}
                  onBlur={(e) => dispatchLayer(trackItem, "title", { content: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Color</label>
                <input
                  type="color"
                  defaultValue={title.color ?? "#FFFFFF"}
                  onBlur={(e) => dispatchLayer(trackItem, "title", { color: e.target.value })}
                  className="h-7 w-12 cursor-pointer rounded border border-border bg-background p-0.5"
                />
              </div>

              <Opacity
                onChange={(v) => dispatchLayer(trackItem, "title", { opacity: v })}
                value={title.opacity ?? 100}
              />
              <Blur
                onChange={(v) => dispatchLayer(trackItem, "title", { blur: v })}
                value={title.blur ?? 0}
              />
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
