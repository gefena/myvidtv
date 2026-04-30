import { sanitizeLibraryData } from "@/lib/importSanitizer";
import type { LibraryData } from "@/types/library";

export function exportLibrary(data: LibraryData): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `myvidtv-library-${date}.json`;
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function importLibrary(file: File): Promise<LibraryData> {
  if (file.size > 5 * 1024 * 1024) {
    return Promise.reject(
      new Error("File is too large. MyVidTV exports are typically under 1 MB.")
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== "string") {
          reject(new Error("Could not read file."));
          return;
        }
        resolve(sanitizeLibraryData(JSON.parse(raw)));
      } catch {
        reject(new Error("File is not valid JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
