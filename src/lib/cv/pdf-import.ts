export const MAX_IMPORT_PDF_BYTES = 6 * 1024 * 1024;
export const MIN_IMPORT_TEXT = 40;

export function isPdfUpload(file: { name: string; type: string }) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function uploadedFile(value: FormDataEntryValue | null): File | null {
  if (!value || typeof value === "string") return null;
  if (typeof value.arrayBuffer !== "function") return null;
  return value;
}
