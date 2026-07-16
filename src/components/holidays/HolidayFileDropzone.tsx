import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";

import { Button } from "../ui/button";

const maxFileSize = 10 * 1024 * 1024;
const acceptedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

type HolidayFileDropzoneProps = {
  disabled: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError: (message: string) => void;
};

export function HolidayFileDropzone({
  disabled,
  file,
  onFileChange,
  onError,
}: HolidayFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    if (files.length > 1) {
      onError("Only one file can be uploaded at a time.");
      return;
    }

    const nextFile = files[0];
    const error = validateFile(nextFile);
    if (error) {
      onError(error);
      return;
    }

    onFileChange(nextFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(event.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-md border border-dashed p-6 text-center ${
          isDragging ? "border-primary bg-muted" : "border-border"
        }`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Drop one holiday file here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOC, DOCX, XLS, XLSX, CSV, PNG, JPG, JPEG, WEBP up to 10 MB
        </p>
        <Button
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          Browse File
        </Button>
        <input
          accept={acceptedExtensions.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
          ref={inputRef}
          type="file"
        />
      </div>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted p-3 text-sm">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} • {file.type || "Unknown type"}
            </p>
          </div>
          <button
            aria-label="Remove file"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-background"
            disabled={disabled}
            onClick={() => onFileChange(null)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function validateFile(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!acceptedExtensions.includes(extension)) {
    return "Unsupported file type.";
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  if (file.size > maxFileSize) {
    return "File must be 10 MB or smaller.";
  }
  return null;
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
