import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchLatestHolidayDocument,
  uploadHolidayDocument,
} from "../services/holidayService";

export const latestHolidayDocumentQueryKey = ["holiday-documents", "latest"];

export function useLatestHolidayDocument() {
  return useQuery({
    queryKey: latestHolidayDocumentQueryKey,
    queryFn: fetchLatestHolidayDocument,
    retry: false,
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
