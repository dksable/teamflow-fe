import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchHolidayDocumentFile,
  fetchLatestHolidayDocument,
  uploadHolidayDocument,
} from "../services/holidayService";
import { HolidayDocument } from "../types/holiday";

export const latestHolidayDocumentQueryKey = ["holiday-documents", "latest"];

export function useLatestHolidayDocument(enabled = true) {
  return useQuery({
    queryKey: latestHolidayDocumentQueryKey,
    queryFn: fetchLatestHolidayDocument,
    enabled,
    retry: false,
  });
}

export function useHolidayDocumentPreview(document: HolidayDocument | null, open: boolean) {
  return useQuery({
    queryKey: ["holiday-documents", document?.id, "preview"],
    queryFn: () => fetchHolidayDocumentFile(document!.id, "view"),
    enabled: open && Boolean(document),
    retry: false,
  });
}

export function useDownloadHolidayDocument() {
  return useMutation({
    mutationFn: (document: HolidayDocument) => fetchHolidayDocumentFile(document.id, "download"),
  });
}

export function useUploadHolidayDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadHolidayDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: latestHolidayDocumentQueryKey });
    },
  });
}
