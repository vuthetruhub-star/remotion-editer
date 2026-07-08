"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import { SceneRef } from "./scene/scene.types";
import StateManager, { DESIGN_LOAD } from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { ControlItem } from "./control-item";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import { useSceneStore } from "@/store/use-scene-store";
import { dispatch } from "@designcombo/events";
import MenuListHorizontal from "./menu-list-horizontal";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { ITrackItem } from "@designcombo/types";
import useLayoutStore from "./store/use-layout-store";
import ControlItemHorizontal from "./control-item-horizontal";
import { design, DESIGN_SCHEMA_VERSION } from "./mock";
import { Separator } from "@/components/ui/separator";
import { IDesign } from "@designcombo/types";
import { loadSavedDesign, saveDesign } from "./utils/autosave";

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const SceneContainer = ({
  sceneRef,
  playerRef,
  stateManager,
  trackItem,
  loaded,
  isLargeScreen,
}: any) => {
  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <div className="flex-1 relative overflow-hidden w-full h-full">
        <div className="flex h-full flex-1">
          <div className="flex-1 relative overflow-hidden w-full h-full">
            <CropModal />
            <Scene ref={sceneRef} stateManager={stateManager} />
          </div>
        </div>
      </div>

      <div className="w-full">
        {playerRef && <Timeline stateManager={stateManager} />}
      </div>

      {!isLargeScreen && !trackItem && loaded && <MenuListHorizontal />}
      {!isLargeScreen && trackItem && <ControlItemHorizontal />}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="bg-card w-full flex flex-none border-r border-border/80 h-[calc(100vh-52px)]">
      <div className="flex flex-col w-full">
        <MenuList />
        <Separator orientation="horizontal" />
        <ControlItem />
      </div>
    </div>
  );
};

const Editor = ({ tempId, id }: { tempId?: string; id?: string }) => {
  const [projectName, setProjectName] = useState<string>("Untitled video");
  const { scene } = useSceneStore();
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const sceneRef = useRef<SceneRef>(null);
  const { timeline, playerRef } = useStore();
  const { activeIds, trackItemsMap, transitionsMap } = useStore();
  const [loaded, setLoaded] = useState(false);
  // Bumped every time a design is (re)loaded — used as a React key on the
  // scene/player tree so Remotion's <Player> fully remounts instead of
  // relying on hot-patching, which can silently keep stale composition state.
  const [designLoadKey, setDesignLoadKey] = useState(0);
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
  const {
    setTrackItem: setLayoutTrackItem,
    setFloatingControl,
    setLabelControlItem,
    setTypeControlItem,
  } = useLayoutStore();
  const isLargeScreen = useIsLargeScreen();

  useTimelineEvents();

  const { setCompactFonts, setFonts } = useDataState();

  // Load saved design from localStorage, fall back to mock. Any autosave from
  // a previous DESIGN_SCHEMA_VERSION is discarded automatically (see
  // utils/autosave.ts), so a schema change in mock.ts always wins over stale
  // browser data — no manual localStorage clearing ever required.
  useEffect(() => {
    const saved = loadSavedDesign(DESIGN_SCHEMA_VERSION);
    dispatch(DESIGN_LOAD, { payload: saved ?? design });
    // Force the scene/player tree to remount on this (and any future) load,
    // so Remotion's <Player> never keeps stale composition state around.
    setDesignLoadKey((k) => k + 1);
  }, []);

  // Auto-save: debounce-write to localStorage whenever store state changes.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useStore.subscribe((state) => {
      if (!state.trackItemIds.length) return; // don't save empty state
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const s = stateManager.getState();
        saveDesign(
          {
            id: "autosave",
            fps: s.fps,
            size: s.size,
            duration: s.duration,
            tracks: s.tracks,
            trackItemIds: s.trackItemIds,
            trackItemsMap: s.trackItemsMap,
            transitionIds: s.transitionIds,
            transitionsMap: s.transitionsMap,
            structure: s.structure,
            background: s.background,
          },
          DESIGN_SCHEMA_VERSION,
        );
      }, 1000);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  // Warn before accidental close/refresh when there are unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const s = useStore.getState();
      if (s.trackItemIds.length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );

    // Trigger zoom recalculation when timeline is resized
    setTimeout(() => {
      sceneRef.current?.recalculateZoom();
    }, 100);
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItem = trackItemsMap[id];
      if (trackItem) {
        setTrackItem(trackItem);
        setLayoutTrackItem(trackItem);
      } else console.log(transitionsMap[id]);
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap]);

  useEffect(() => {
    setFloatingControl("");
    setLabelControlItem("");
    setTypeControlItem("");
  }, [isLargeScreen]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        projectName={projectName}
        user={null}
        stateManager={stateManager}
        setProjectName={setProjectName}
      />

      <div className="flex flex-1">
        {isLargeScreen ? (
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel
              defaultSize={30}
              minSize={20}
              maxSize={40}
              className="max-w-7xl relative bg-card min-w-0 overflow-visible!"
            >
              <Sidebar />
              <FloatingControl />
            </ResizablePanel>

            <ResizableHandle className="bg-border/90" />

            <ResizablePanel
              defaultSize={70}
              minSize={60}
              className="min-w-0 min-h-0"
            >
              <SceneContainer
                key={designLoadKey}
                sceneRef={sceneRef}
                playerRef={playerRef}
                stateManager={stateManager}
                trackItem={trackItem}
                loaded={loaded}
                isLargeScreen={isLargeScreen}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <SceneContainer
            key={designLoadKey}
            sceneRef={sceneRef}
            playerRef={playerRef}
            stateManager={stateManager}
            trackItem={trackItem}
            loaded={loaded}
            isLargeScreen={isLargeScreen}
          />
        )}
      </div>
    </div>
  );
};

export default Editor;
