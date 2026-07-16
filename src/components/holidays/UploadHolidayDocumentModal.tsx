import { toast } from "sonner";
import { useState } from "react";

import { getApiErrorMessage } from "../../contexts/AuthContext";
import { useUploadHolidayDocument } from "../../hooks/useHolidays";
import { HolidayDocument } from "../../types/holiday";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { HolidayFileDropzone } from "./HolidayFileDropzone";

type UploadHolidayDocumentModalProps = {
  open: boolean;
  onClose: () => void;
  onUploaded: (document: HolidayDocument) => void;
};

export function UploadHolidayDocumentModal({
  onUploaded,
  open,
  onClose,
}: UploadHolidayDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadHolidayDocument();

  function resetAndClose() {
    if (uploadMutation.isPending) {
      return;
    }
    setFile(null);
    onClose();
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Select a file first");
      return;
    }

    try {
      const document = await uploadMutation.mutateAsync(file);
      toast.success("Holiday document uploaded successfully");
      setFile(null);
      onClose();
      onUploaded(document);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog
      description="Upload one company holiday document. The original file format will be preserved."
      onClose={resetAndClose}
      open={open}
      title="Upload Holidays"
    >
      <div className="mt-6 space-y-6">
        <HolidayFileDropzone
          disabled={uploadMutation.isPending}
          file={file}
          onError={(message) => toast.error(message)}
          onFileChange={setFile}
        />

        <div className="flex justify-end gap-3">
          <Button
            disabled={uploadMutation.isPending}
            onClick={resetAndClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!file || uploadMutation.isPending}
            onClick={handleUpload}
            type="button"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
