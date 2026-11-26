import type { LibraryItem, PodcastEpisodeItem, WatchHistoryItem } from "@/types/library";
import type { PodcastEpisode } from "@/lib/podcastRss";

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

export function isLibraryItemActive(
  item: LibraryItem,
  currentItem: LibraryItem | null,
  libraryItems?: readonly LibraryItem[]
): boolean {
  if (!currentItem) return false;
  const currentId = getLibraryItemId(currentItem);
  if (getLibraryItemId(item) === currentId) return true;

  if (item.type === "podcast" && currentItem.type === "podcast-episode") {
    const episodeFeedUrl =
      currentItem.podcastFeedUrl ||
      (currentItem.watchSource?.type === "podcast" ? currentItem.watchSource.feedUrl : undefined);
    return Boolean(episodeFeedUrl && episodeFeedUrl === item.feedUrl);
  }

  if (item.type === "channel" && currentItem.type === "video") {
    const matchesChannel =
      currentItem.watchSource?.type === "channel" && currentItem.watchSource.channelId === item.channelId;
    if (!matchesChannel) return false;
    if (libraryItems?.some((entry) => entry.type === "video" && entry.ytId === currentItem.ytId)) {
      return false;
    }
    return true;
  }

  return false;
}

/** Build the transient player item for a podcast episode (used by episode picks and Skip). */
export function buildPodcastEpisodeItem(
  episode: PodcastEpisode,
  podcast: { feedUrl: string; title: string; thumbnail: string },
  historyEntry?: Pick<WatchHistoryItem, "lastPosition" | "lastWatchedRatio"> | null
): PodcastEpisodeItem {
  return {
    type: "podcast-episode",
    episodeId: episode.episodeId,
    podcastFeedUrl: podcast.feedUrl,
    title: episode.title,
    podcastTitle: podcast.title,
    audioUrl: episode.audioUrl,
    ...(episode.episodeLink ? { episodeLink: episode.episodeLink } : {}),
    thumbnail: episode.thumbnail || podcast.thumbnail,
    publishedAt: episode.publishedAt,
    duration: episode.duration,
    tags: [],
    addedAt: 0,
    lastPosition: historyEntry?.lastPosition,
    lastWatchedRatio: historyEntry?.lastWatchedRatio,
    watchSource: {
      type: "podcast",
      feedUrl: podcast.feedUrl,
      audioUrl: episode.audioUrl,
      ...(episode.episodeLink ? { episodeLink: episode.episodeLink } : {}),
    },
  };
}

/**
 * Next episode for Skip: the episode after the current one in feed order (the order shown in the
 * episode list). Wraps to the first episode only when loopAll is set; otherwise null at the end.
 */
export function getNextPodcastEpisode(
  episodes: PodcastEpisode[],
  currentEpisodeId: string,
  loopAll = false
): PodcastEpisode | null {
  const idx = episodes.findIndex((e) => e.episodeId === currentEpisodeId);
  if (idx < 0 || episodes.length === 0) return null;
  if (idx + 1 < episodes.length) return episodes[idx + 1];
  return loopAll && episodes.length > 1 ? episodes[0] : null;
}
