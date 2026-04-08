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
  URL.revokeObjectURL(url);
}

export function importLibrary(file: File): Promise<LibraryData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== "string") {
          reject(new Error("Could not read file."));
          return;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
          reject(new Error("Not a valid MyVidTV export — missing items array."));
          return;
        }
        const data: LibraryData = {
          items: parsed.items ?? [],
          archivedItems: parsed.archivedItems ?? [],
          customTags: parsed.customTags ?? [],
          settings: parsed.settings ?? {},
        };
        resolve(data);
      } catch {
        reject(new Error("File is not valid JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
