import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { HolidayDocumentViewer } from "../components/holidays/HolidayDocumentViewer";
import { UploadHolidayDocumentModal } from "../components/holidays/UploadHolidayDocumentModal";
import { Button } from "../components/ui/button";
import { useLatestHolidayDocument } from "../hooks/useHolidays";
import { usePermissions } from "../hooks/usePermissions";
import { getApiErrorMessage } from "../lib/api";
import { fetchHolidayDocumentFile } from "../services/holidayService";
import { HolidayDocument } from "../types/holiday";

export function HolidaysPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<HolidayDocument | null>(null);
  const permissions = usePermissions();
  const latestDocumentQuery = useLatestHolidayDocument();
  const selectedDocument = previewDocument ?? latestDocumentQuery.data ?? null;

  async function handleDownload(document: HolidayDocument) {
    try {
      const file = await fetchHolidayDocumentFile(document.id, "download");
      const url = URL.createObjectURL(file.blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = file.fileName || document.original_file_name;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Holidays</h2>
          <p className="mt-2 text-muted-foreground">
            View and download company holiday documents.
          </p>
        </div>
        {permissions.canUpload ? (
          <Button onClick={() => setIsUploadModalOpen(true)} type="button">
            <Upload className="h-4 w-4" />
            Upload Holidays
          </Button>
        ) : null}
      </div>

      <HolidayDocumentViewer
        document={selectedDocument}
        isError={latestDocumentQuery.isError && !selectedDocument}
        isLoading={latestDocumentQuery.isLoading && !selectedDocument}
        onDownload={handleDownload}
      />

      <UploadHolidayDocumentModal
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={setPreviewDocument}
        open={isUploadModalOpen}
      />
    </section>
  );
}
