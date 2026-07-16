import { apiClient, apiGet } from "../lib/api";
import { HolidayDocument, HolidayDocumentFile } from "../types/holiday";

export function fetchLatestHolidayDocument() {
  return apiGet<HolidayDocument>("/holiday-documents/latest");
}

export async function uploadHolidayDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<HolidayDocument>(
    "/holiday-documents",
    formData,
  );
  return response.data;
}

export async function fetchHolidayDocumentFile(
  documentId: string,
  mode: "view" | "download",
): Promise<HolidayDocumentFile> {
  const response = await apiClient.get<Blob>(
    `/holiday-documents/${documentId}/${mode}`,
    {
      responseType: "blob",
    },
  );

  return {
    blob: response.data,
    fileName: getFileNameFromDisposition(
      getStringHeader(response.headers["content-disposition"]),
    ),
    mimeType: getStringHeader(response.headers["content-type"]) ?? response.data.type,
  };
}

function getStringHeader(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getFileNameFromDisposition(disposition: string | undefined) {
  if (!disposition) {
    return "holiday-document";
  }

  const utf8Match = disposition.match(/filename\*=utf-8''([^;]+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? "holiday-document";
}
