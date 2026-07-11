import { describe, expect, it } from "vitest";
import { getHistoryBadge, getHistoryKey, getLibraryItemId, getLibraryItemMediaType, getLibraryItemSubtitle } from "@/lib/mediaItems";
import type { LibraryItem, WatchHistoryItem } from "@/types/library";

describe("media item helpers", () => {
  it("returns stable IDs for all library item types", () => {
    const items: LibraryItem[] = [
      { type: "video", ytId: "video-1", title: "Video", channelName: "Channel", thumbnail: "", tags: [], addedAt: 1 },
      { type: "playlist-channel", ytPlaylistId: "playlist-1", title: "Playlist", channelName: "", thumbnail: "", videoCount: 0, tags: [], addedAt: 1 },
      { type: "channel", channelId: "channel-1", title: "Channel", thumbnail: "", tags: [], addedAt: 1 },
      { type: "podcast", feedUrl: "https://example.com/feed.xml", title: "Podcast", author: "", thumbnail: "", episodeCount: 3, tags: [], addedAt: 1 },
      { type: "podcast-episode", episodeId: "episode-1", podcastFeedUrl: "https://example.com/feed.xml", title: "Episode", podcastTitle: "Podcast", audioUrl: "https://example.com/e.mp3", thumbnail: "", publishedAt: "", tags: [], addedAt: 1 },
    ];

    expect(items.map(getLibraryItemId)).toEqual([
      "video-1",
      "playlist-1",
      "channel-1",
      "https://example.com/feed.xml",
      "episode-1",
    ]);
  });

  it("returns media type and subtitles for podcast items", () => {
    const podcast: LibraryItem = { type: "podcast", feedUrl: "https://example.com/feed.xml", title: "Podcast", author: "Host", thumbnail: "", episodeCount: 3, tags: [], addedAt: 1 };
    const episode: LibraryItem = { type: "podcast-episode", episodeId: "episode-1", podcastFeedUrl: "https://example.com/feed.xml", title: "Episode", podcastTitle: "Podcast", audioUrl: "https://example.com/e.mp3", thumbnail: "", publishedAt: "", tags: [], addedAt: 1 };

    expect(getLibraryItemMediaType(podcast)).toBe("podcast");
    expect(getLibraryItemMediaType(episode)).toBe("podcast");
    expect(getLibraryItemSubtitle(podcast)).toBe("3 episodes · Host");
    expect(getLibraryItemSubtitle(episode)).toBe("Podcast");
  });

  it("keeps history keys and badges media-aware", () => {
    const youtube: WatchHistoryItem = { ytId: "same", title: "Video", channelName: "Channel", thumbnail: "", lastPosition: 0, lastWatchedRatio: 0, firstWatchedAt: 1, lastWatchedAt: 2 };
    const podcast: WatchHistoryItem = { mediaType: "podcast", ytId: "same", title: "Episode", channelName: "Podcast", thumbnail: "", lastPosition: 0, lastWatchedRatio: 0, firstWatchedAt: 1, lastWatchedAt: 2 };

    expect(getHistoryKey(youtube)).toBe("youtube:same");
    expect(getHistoryKey(podcast)).toBe("podcast:same");
    expect(getHistoryBadge(youtube)).toBe("VID");
    expect(getHistoryBadge(podcast)).toBe("POD");
  });
});
