import type { LibraryData, WatchHistoryItem } from "@/types/library";

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

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function ratioOrZero(value: unknown): number {
  const ratio = numberOrZero(value);
  return Math.min(1, ratio);
}

function sanitizeString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function sanitizeWatchHistory(entries: unknown[]): WatchHistoryItem[] {
  return entries.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const e = entry as Record<string, unknown>;
    if (typeof e.ytId !== "string" || !e.ytId) return [];
    const lastWatchedAt = numberOrZero(e.lastWatchedAt);
    if (lastWatchedAt === 0) return [];

    const source = e.source && typeof e.source === "object"
      ? e.source as Record<string, unknown>
      : null;
    const sourceType = source?.type;
    const validSourceType =
      sourceType === "library" ||
      sourceType === "channel" ||
      sourceType === "history" ||
      sourceType === "unknown";

    return [{
      ytId: e.ytId,
      title: sanitizeString(e.title, 300),
      channelName: sanitizeString(e.channelName, 160),
      thumbnail: sanitizeThumbnail(e.thumbnail),
      lastPosition: Math.floor(numberOrZero(e.lastPosition)),
      lastWatchedRatio: ratioOrZero(e.lastWatchedRatio),
      firstWatchedAt: numberOrZero(e.firstWatchedAt) || lastWatchedAt,
      lastWatchedAt,
      source: validSourceType
        ? {
            type: sourceType,
            ...(typeof source?.channelId === "string" && source.channelId
              ? { channelId: source.channelId }
              : {}),
          }
        : undefined,
    }];
  });
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
          items.flatMap((item: unknown) => {
            if (!item || typeof item !== "object") return [];
            const i = item as Record<string, unknown>;
            if (i.type === "video") {
              if (typeof i.ytId !== "string" || !i.ytId) return [];
            } else if (i.type === "playlist-channel") {
              if (typeof i.ytPlaylistId !== "string" || !i.ytPlaylistId) return [];
            } else if (i.type === "channel") {
              if (typeof i.channelId !== "string" || !i.channelId) return [];
            } else {
              return [];
            }
            return [{
              ...i,
              tags: Array.isArray(i.tags) ? i.tags : [],
              thumbnail: sanitizeThumbnail(i.thumbnail),
            }];
          });
        const rawTags = Array.isArray(parsed.customTags) ? parsed.customTags : [];
        const sanitizedTags = rawTags
          .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
          .map((t: string) => t.trim().toLowerCase().slice(0, 32));
        const data: LibraryData = {
          items: sanitizeItems(parsed.items ?? []) as LibraryData["items"],
          archivedItems: sanitizeItems(Array.isArray(parsed.archivedItems) ? parsed.archivedItems : []) as LibraryData["archivedItems"],
          watchHistory: sanitizeWatchHistory(Array.isArray(parsed.watchHistory) ? parsed.watchHistory : []),
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
