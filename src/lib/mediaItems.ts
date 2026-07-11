import type { LibraryItem, WatchHistoryItem } from "@/types/library";

export type MediaType = "youtube" | "podcast";

export function getLibraryItemId(item: LibraryItem): string {
  switch (item.type) {
    case "video":
      return item.ytId;
    case "playlist-channel":
      return item.ytPlaylistId;
    case "channel":
      return item.channelId;
    case "podcast":
      return item.feedUrl;
    case "podcast-episode":
      return item.episodeId;
  }
}

export function getLibraryItemMediaType(item: LibraryItem): MediaType | "collection" {
  switch (item.type) {
    case "podcast":
    case "podcast-episode":
      return "podcast";
    case "video":
      return "youtube";
    case "playlist-channel":
    case "channel":
      return "collection";
  }
}

export function getLibraryItemSubtitle(item: LibraryItem): string {
  switch (item.type) {
    case "video":
      return item.channelName;
    case "playlist-channel":
      return item.videoCount > 0 ? `${item.videoCount} videos` : "Playlist";
    case "channel":
      return "Channel";
    case "podcast":
      return `${item.episodeCount > 0 ? `${item.episodeCount} episodes` : "Podcast"}${item.author ? ` · ${item.author}` : ""}`;
    case "podcast-episode":
      return item.podcastTitle;
  }
}

export function getHistoryMediaType(entry: Pick<WatchHistoryItem, "mediaType">): MediaType {
  return entry.mediaType ?? "youtube";
}

export function getHistoryKey(entry: Pick<WatchHistoryItem, "mediaType" | "ytId">): string {
  return `${getHistoryMediaType(entry)}:${entry.ytId}`;
}

export function getProgressKey(mediaType: MediaType, id: string): string {
  return `${mediaType}:${id}`;
}

export function getHistoryBadge(entry: Pick<WatchHistoryItem, "mediaType">): string {
  return getHistoryMediaType(entry) === "podcast" ? "POD" : "VID";
}
