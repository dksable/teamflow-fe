import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import { fetchHolidayDocumentFile } from "../../services/holidayService";
import { HolidayDocument } from "../../types/holiday";
import { Button } from "../ui/button";
import { EmptyState, LoadingState } from "../ui/state";

type HolidayDocumentViewerProps = {
  document: HolidayDocument | null;
  isError: boolean;
  isLoading: boolean;
  onDownload: (document: HolidayDocument) => void;
};

const previewableImageTypes = new Set(["png", "jpg", "jpeg", "webp"]);

export function HolidayDocumentViewer({
  document,
  isError: isDocumentError,
  isLoading: isDocumentLoading,
  onDownload,
}: HolidayDocumentViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const extension = document?.file_extension.toLowerCase() ?? "";
  const previewKind = useMemo(() => {
    if (extension === "pdf") {
      return "pdf";
    }
    if (previewableImageTypes.has(extension)) {
      return "image";
    }
    return "unsupported";
  }, [extension]);

  useEffect(() => {
    if (!document || previewKind === "unsupported") {
      setPreviewUrl(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let objectUrl: string | null = null;
    let isCurrent = true;

    setIsLoading(true);
    setIsError(false);
    setPreviewUrl(null);

    fetchHolidayDocumentFile(document.id, "view")
      .then(({ blob }) => {
        if (!isCurrent) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (isCurrent) {
          setIsError(true);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document, previewKind]);

  if (!document) {
    if (isDocumentLoading) {
      return <LoadingState title="Loading holiday document..." />;
    }

    return (
      <EmptyState
        description={
          isDocumentError
            ? "Please refresh the page or upload a new document."
            : "Upload a PDF or image document to preview it here."
        }
        title={isDocumentError ? "No holiday document is available yet." : "Upload a holiday document."}
      />
    );
  }

  return (
    <section className="mt-6 rounded-md border bg-card">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            {document.original_file_name}
          </h3>
          <p className="mt-1 text-sm uppercase text-muted-foreground">
            {document.file_extension}
          </p>
        </div>
        <Button onClick={() => onDownload(document)} type="button" variant="outline">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {previewKind === "unsupported" ? (
        <div className="grid min-h-[420px] place-items-center bg-muted p-8">
          <EmptyState
            className="m-0 min-h-0 border-0 bg-transparent"
            description="Download the original file to view it locally."
            title="Preview is not available for this document format."
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-[520px] place-items-center bg-muted p-6">
          <LoadingState className="m-0 min-h-0 border-0 bg-transparent" title="Loading preview..." />
        </div>
      ) : null}

      {isError ? (
        <div className="grid min-h-[420px] place-items-center bg-muted p-6">
          <EmptyState
            className="m-0 min-h-0 border-0 bg-transparent"
            description="Download the original file instead."
            title="Unable to load preview."
          />
        </div>
      ) : null}

      {!isLoading && !isError && previewUrl && previewKind === "pdf" ? (
        <iframe
          className="h-[72vh] min-h-[520px] w-full"
          src={previewUrl}
          title={document.original_file_name}
        />
      ) : null}

      {!isLoading && !isError && previewUrl && previewKind === "image" ? (
        <div className="grid max-h-[72vh] min-h-[520px] place-items-center overflow-auto bg-muted p-4">
          <img
            alt={document.original_file_name}
            className="max-h-full max-w-full object-contain"
            src={previewUrl}
          />
        </div>
      ) : null}
    </section>
  );
}
