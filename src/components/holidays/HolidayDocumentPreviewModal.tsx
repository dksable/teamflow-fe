import { Download, FileText } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { useDownloadHolidayDocument, useHolidayDocumentPreview } from "../../hooks/useHolidays";
import { getApiErrorMessage } from "../../lib/api";
import { HolidayDocument } from "../../types/holiday";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "../ui/state";

const previewableImageTypes = new Set(["png", "jpg", "jpeg", "webp"]);

export function HolidayDocumentPreviewModal({
  document,
  onClose,
  open,
}: {
  document: HolidayDocument | null;
  onClose: () => void;
  open: boolean;
}) {
  const previewKind = getPreviewKind(document?.file_extension ?? "");
  const previewQuery = useHolidayDocumentPreview(previewKind === "unsupported" ? null : document, open);
  const downloadMutation = useDownloadHolidayDocument();
  const blobUrl = useMemo(() => {
    if (!previewQuery.data?.blob || previewKind === "unsupported") {
      return null;
    }
    return URL.createObjectURL(previewQuery.data.blob);
  }, [previewKind, previewQuery.data?.blob]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  async function handleDownload() {
    if (!document) {
      return;
    }
    try {
      const file = await downloadMutation.mutateAsync(document);
      const url = URL.createObjectURL(file.blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = file.fileName || document.original_file_name;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Unable to download the holiday document.");
    }
  }

  return (
    <Dialog
      className="h-[90vh] max-w-[90vw]"
      description={document ? `${document.original_file_name} · ${formatFileSize(document.file_size)}` : undefined}
      onClose={onClose}
      open={open}
      title="Holiday Document"
    >
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {document?.uploaded_at ? `Uploaded ${formatDateTime(document.uploaded_at)}` : ""}
        </p>
        <div className="flex justify-end gap-3">
          <Button disabled={!document || downloadMutation.isPending} onClick={handleDownload} type="button">
            <Download className="h-4 w-4" />
            {downloadMutation.isPending ? "Downloading..." : "Download"}
          </Button>
          <Button onClick={onClose} type="button" variant="outline">Close</Button>
        </div>
      </div>

      <div className="mt-4 min-h-[60vh] overflow-hidden rounded-md border bg-muted">
        {previewKind !== "unsupported" && previewQuery.isLoading ? (
          <LoadingState className="m-0 min-h-[60vh] border-0 bg-transparent" title="Loading holiday document..." />
        ) : null}

        {previewKind !== "unsupported" && previewQuery.isError ? (
          <ErrorState
            className="m-0 min-h-[60vh] border-0 bg-transparent"
            description="Unable to load the holiday document."
            onRetry={() => previewQuery.refetch()}
            title="Unable to load the holiday document."
          />
        ) : null}

        {previewKind === "unsupported" && document ? (
          <EmptyState
            className="m-0 min-h-[60vh] border-0 bg-transparent"
            description="Preview is not available for this file type. Download the document to view it."
            title={`${document.original_file_name} (${document.file_extension.toUpperCase()}, ${formatFileSize(document.file_size)})`}
          />
        ) : null}

        {!previewQuery.isLoading && !previewQuery.isError && blobUrl && previewKind === "pdf" ? (
          <object className="h-[68vh] w-full" data={blobUrl} type="application/pdf">
            <div className="grid h-full min-h-[60vh] place-items-center p-6 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Your browser cannot preview this PDF.</p>
              <p className="mt-1 text-sm text-muted-foreground">Download the document to view it.</p>
            </div>
          </object>
        ) : null}

        {!previewQuery.isLoading && !previewQuery.isError && blobUrl && previewKind === "image" ? (
          <div className="grid max-h-[68vh] min-h-[60vh] place-items-center overflow-auto p-4">
            <img
              alt={document?.original_file_name ?? "Holiday document"}
              className="max-h-full max-w-full object-contain"
              src={blobUrl}
            />
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}

function getPreviewKind(extension: string) {
  const normalized = extension.toLowerCase();
  if (normalized === "pdf") {
    return "pdf";
  }
  if (previewableImageTypes.has(normalized)) {
    return "image";
  }
  return "unsupported";
}

function formatFileSize(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
