import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { HolidayDocumentPreviewModal } from "../components/holidays/HolidayDocumentPreviewModal";
import { UploadHolidayDocumentModal } from "../components/holidays/UploadHolidayDocumentModal";
import { ViewHolidaysButton } from "../components/holidays/ViewHolidaysButton";
import { Button } from "../components/ui/button";
import { useLatestHolidayDocument } from "../hooks/useHolidays";
import { usePermissions } from "../hooks/usePermissions";
import { HolidayDocument } from "../types/holiday";

export function HolidaysPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<HolidayDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const permissions = usePermissions();
  const latestDocumentQuery = useLatestHolidayDocument(false);

  async function handleViewHolidays() {
    try {
      const result = await latestDocumentQuery.refetch();
      if (!result.data) {
        toast.info("No holiday document is available.");
        return;
      }
      setPreviewDocument(result.data);
      setIsPreviewOpen(true);
    } catch {
      toast.info("No holiday document is available.");
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
        <div className="flex flex-wrap gap-3">
          <ViewHolidaysButton
            isLoading={latestDocumentQuery.isFetching}
            onClick={handleViewHolidays}
          />
          {permissions.canUpload ? (
            <Button onClick={() => setIsUploadModalOpen(true)} type="button">
              <Upload className="h-4 w-4" />
              Upload Holidays
            </Button>
          ) : null}
        </div>
      </div>

      <UploadHolidayDocumentModal
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={(document) => {
          setPreviewDocument(document);
          setIsPreviewOpen(true);
        }}
        open={isUploadModalOpen}
      />
      <HolidayDocumentPreviewModal
        document={previewDocument}
        onClose={() => setIsPreviewOpen(false)}
        open={isPreviewOpen}
      />
    </section>
  );
}
