import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDownloadState } from "./store/use-download-state";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, CircleCheckIcon, XIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { download } from "@/utils/download";
import { useState } from "react";

const DownloadProgressModal = () => {
  const { progress, displayProgressModal, output, error, actions } =
    useDownloadState();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const isCompleted = progress === 100 && !!output?.url;
  const hasError = !!error;

  const handleDownload = async () => {
    if (!output?.url) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      // Blob URLs (local render) can be downloaded directly without fetch.
      if (output.url.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = output.url;
        link.setAttribute("download", "export.mp4");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        await download(output.url, "untitled");
      }
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Download failed. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = () => {
    actions.cancelExport();
    actions.setDisplayProgressModal(false);
  };

  const handleRetry = () => {
    actions.startExport();
  };

  return (
    <Dialog
      open={displayProgressModal}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent className="flex h-[627px] flex-col gap-0 bg-background p-0 sm:max-w-[844px]">
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />
        <XIcon
          onClick={handleCancel}
          className="absolute right-4 top-5 h-5 w-5 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
        />
        <div className="flex h-16 items-center border-b px-4 font-medium">
          Download
        </div>

        {/* ── Error state ── */}
        {hasError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <AlertCircleIcon className="h-10 w-10 text-red-400" />
            <div className="text-center">
              <div className="font-bold text-red-400">Export failed</div>
              <div className="mt-1 max-w-sm text-sm text-zinc-500">{error}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry}>Try again</Button>
              <Button variant="outline" onClick={handleCancel}>Close</Button>
            </div>
          </div>

        /* ── Completed state ── */
        ) : isCompleted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 space-y-4">
            <div className="flex flex-col items-center space-y-1 text-center">
              <CircleCheckIcon className="h-8 w-8 text-green-400" />
              <div className="font-bold">Exported</div>
              <div className="text-muted-foreground">
                Your video is ready to download.
              </div>
            </div>
            {downloadError && (
              <div className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                {downloadError}
              </div>
            )}
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? "Downloading…" : "Download"}
            </Button>
          </div>

        /* ── Exporting / progress state ── */
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-5xl font-semibold tabular-nums">
              {Math.floor(progress)}%
            </div>
            <div className="font-bold">Exporting…</div>
            <div className="text-center text-zinc-500 text-sm">
              <div>Rendering locally — this may take a few minutes.</div>
              <div>Do not close this tab.</div>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadProgressModal;
