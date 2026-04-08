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

const ALLOWED_THUMBNAIL_HOSTS = ["i.ytimg.com", "img.youtube.com"];

function sanitizeThumbnail(url: unknown): string {
  if (typeof url !== "string") return "";
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return "";
    if (!ALLOWED_THUMBNAIL_HOSTS.includes(hostname)) return "";
    return url;
  } catch {
    return "";
  }
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
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
          reject(new Error("Not a valid MyVidTV export — missing items array."));
          return;
        }
        const sanitizeItems = (items: unknown[]) =>
          items.map((item: unknown) => {
            if (!item || typeof item !== "object") return item;
            const i = item as Record<string, unknown>;
            return { ...i, thumbnail: sanitizeThumbnail(i.thumbnail) };
          });
        const rawTags = Array.isArray(parsed.customTags) ? parsed.customTags : [];
        const sanitizedTags = rawTags
          .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
          .map((t: string) => t.trim().toLowerCase().slice(0, 32));
        const data: LibraryData = {
          items: sanitizeItems(parsed.items ?? []) as LibraryData["items"],
          archivedItems: sanitizeItems(parsed.archivedItems ?? []) as LibraryData["archivedItems"],
          customTags: sanitizedTags,
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
