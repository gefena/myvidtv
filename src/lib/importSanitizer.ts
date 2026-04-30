import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { LibraryData, WatchHistoryItem } from "@/types/library";

const ALLOWED_THUMBNAIL_HOSTS = ["i.ytimg.com", "img.youtube.com"];

export function sanitizeLibraryData(parsed: unknown): LibraryData {
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as Record<string, unknown>).items)) {
    throw new Error("Not a valid MyVidTV export — missing items array.");
  }

  const data = parsed as Record<string, unknown>;
  const rawTags = Array.isArray(data.customTags) ? data.customTags : [];
  const sanitizedTags = rawTags
    .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
    .map((t: string) => t.trim().toLowerCase().slice(0, 32));

  return {
    items: sanitizeItems(data.items ?? []) as LibraryData["items"],
    archivedItems: sanitizeItems(Array.isArray(data.archivedItems) ? data.archivedItems : []) as LibraryData["archivedItems"],
    watchHistory: sanitizeWatchHistory(Array.isArray(data.watchHistory) ? data.watchHistory : []),
    customTags: sanitizedTags,
    settings: { ...DEFAULT_SETTINGS, ...(isRecord(data.settings) ? data.settings : {}) },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function sanitizeItems(items: unknown): unknown[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item: unknown) => {
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
}

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
