export type HolidayDocument = {
  id: string;
  original_file_name: string;
  stored_file_name: string;
  file_extension: string;
  mime_type: string;
  file_size: number;
  storage_provider: string;
  storage_key: string;
  uploaded_by: number;
  uploaded_by_name: string | null;
  title: string | null;
  description: string | null;
  uploaded_at: string;
  updated_at: string;
};

export type HolidayDocumentFile = {
  blob: Blob;
  fileName: string;
  mimeType: string;
};
