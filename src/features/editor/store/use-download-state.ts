import { IDesign } from "@designcombo/types";
import { create } from "zustand";

interface Output {
  url: string;
  type: string;
}

interface DownloadState {
  projectId: string;
  exporting: boolean;
  exportType: "json" | "mp4";
  exportScale: number; // 1.0 = 1080p, 1.33 = 1440p/2K, 2.0 = 4K
  progress: number;
  error: string | null;
  output?: Output;
  payload?: IDesign;
  displayProgressModal: boolean;
  actions: {
    setProjectId: (projectId: string) => void;
    setExporting: (exporting: boolean) => void;
    setExportType: (exportType: "json" | "mp4") => void;
    setExportScale: (scale: number) => void;
    setProgress: (progress: number) => void;
    setState: (state: Partial<DownloadState>) => void;
    setOutput: (output: Output) => void;
    startExport: () => void;
    cancelExport: () => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
  };
}

// Module-level poll handle so cancelExport can clear it from outside React.
let _pollTimer: ReturnType<typeof setTimeout> | null = null;
let _cancelled = false;

const MAX_POLL_MS = 5 * 60 * 1000; // 5 minutes

export const useDownloadState = create<DownloadState>((set, get) => ({
  projectId: "",
  exporting: false,
  exportType: "mp4",
  exportScale: 1,
  progress: 0,
  error: null,
  displayProgressModal: false,
  actions: {
    setProjectId: (projectId) => set({ projectId }),
    setExporting:  (exporting)  => set({ exporting }),
    setExportType: (exportType) => set({ exportType }),
    setExportScale: (exportScale) => set({ exportScale }),
    setProgress:   (progress)   => set({ progress }),
    setState:      (state)      => set({ ...state }),
    setOutput:     (output)     => set({ output }),
    setDisplayProgressModal: (displayProgressModal) =>
      set({ displayProgressModal }),

    cancelExport: () => {
      _cancelled = true;
      if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
      set({ exporting: false, progress: 0, error: null });
    },

    startExport: async () => {
      _cancelled = false;
      if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
      set({ exporting: true, displayProgressModal: true, progress: 1, error: null, output: undefined });

      // Animate progress while rendering (local render has no real progress stream).
      let fakeProgress = 1;
      const tick = () => {
        if (_cancelled) return;
        fakeProgress = Math.min(fakeProgress + 1, 95);
        set({ progress: fakeProgress });
        _pollTimer = setTimeout(tick, 3000);
      };
      _pollTimer = setTimeout(tick, 3000);

      try {
        const { payload } = get();
        if (!payload) throw new Error("Payload is not defined");

        const { exportScale } = get();
        const response = await fetch("/api/render-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackItemIds: payload.trackItemIds,
            trackItemsMap: payload.trackItemsMap,
            transitionsMap: payload.transitionsMap,
            fps: payload.fps,
            size: payload.size,
            background: payload.background,
            duration: payload.duration,
            scale: exportScale,
          }),
        });

        if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
        if (_cancelled) return;

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.message || `Export failed (${response.status})`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        set({ exporting: false, progress: 100, output: { url, type: "mp4" } });
      } catch (error: unknown) {
        if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
        if (_cancelled) return;
        const msg = error instanceof Error ? error.message : "Unknown export error";
        set({ exporting: false, error: msg });
      }
    },
  },
}));
