import { describe, expect, it } from "vitest";
import { getHistoryBadge, getHistoryKey, getLibraryItemId, getLibraryItemMediaType, getLibraryItemSubtitle, isLibraryItemActive, buildPodcastEpisodeItem, getNextPodcastEpisode } from "@/lib/mediaItems";
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

  it("matches currently playing items and parent podcasts/channels without double-highlighting", () => {
    const video: LibraryItem = { type: "video", ytId: "video-1", title: "Video", channelName: "Channel", thumbnail: "", tags: [], addedAt: 1 };
    const savedChannelVideo: LibraryItem = { type: "video", ytId: "video-2", title: "Saved Chan Video", channelName: "Channel", thumbnail: "", tags: [], addedAt: 2 };
    const playlist: LibraryItem = { type: "playlist-channel", ytPlaylistId: "pl-1", title: "Playlist", channelName: "", thumbnail: "", videoCount: 3, tags: [], addedAt: 1 };
    const podcast: LibraryItem = { type: "podcast", feedUrl: "https://example.com/feed.xml", title: "Podcast", author: "Host", thumbnail: "", episodeCount: 3, tags: [], addedAt: 1 };
    const otherPodcast: LibraryItem = { type: "podcast", feedUrl: "https://example.com/other.xml", title: "Other", author: "", thumbnail: "", episodeCount: 1, tags: [], addedAt: 1 };
    const episode: LibraryItem = { type: "podcast-episode", episodeId: "episode-1", podcastFeedUrl: "https://example.com/feed.xml", title: "Episode", podcastTitle: "Podcast", audioUrl: "https://example.com/e.mp3", thumbnail: "", publishedAt: "", tags: [], addedAt: 1 };
    const episodeViaWatchSource: LibraryItem = { type: "podcast-episode", episodeId: "episode-2", podcastFeedUrl: "", title: "Episode 2", podcastTitle: "Podcast", audioUrl: "https://example.com/e2.mp3", thumbnail: "", publishedAt: "", tags: [], addedAt: 0, watchSource: { type: "podcast", feedUrl: "https://example.com/feed.xml", audioUrl: "https://example.com/e2.mp3" } };
    const channel: LibraryItem = { type: "channel", channelId: "chan-1", title: "Channel", thumbnail: "", tags: [], addedAt: 1 };
    const otherChannel: LibraryItem = { type: "channel", channelId: "chan-2", title: "Other Channel", thumbnail: "", tags: [], addedAt: 1 };
    const transientChannelVideo: LibraryItem = { type: "video", ytId: "video-2", title: "Chan Video", channelName: "Channel", thumbnail: "", tags: [], addedAt: 0, watchSource: { type: "channel", channelId: "chan-1" } };

    // Direct ID matches
    expect(isLibraryItemActive(video, video)).toBe(true);
    expect(isLibraryItemActive(playlist, playlist)).toBe(true);
    expect(isLibraryItemActive(episode, episode)).toBe(true);

    // Parent podcast feedUrl matches (direct field and watchSource fallback)
    expect(isLibraryItemActive(podcast, episode)).toBe(true);
    expect(isLibraryItemActive(podcast, episodeViaWatchSource)).toBe(true);
    expect(isLibraryItemActive(otherPodcast, episode)).toBe(false);

    // Parent channel matches only when the playing video is not itself a row in the library
    expect(isLibraryItemActive(channel, transientChannelVideo)).toBe(true);
    expect(isLibraryItemActive(channel, transientChannelVideo, [video, channel])).toBe(true);
    expect(isLibraryItemActive(channel, transientChannelVideo, [savedChannelVideo, channel])).toBe(false);
    expect(isLibraryItemActive(savedChannelVideo, transientChannelVideo, [savedChannelVideo, channel])).toBe(true);

    // Non-matches
    expect(isLibraryItemActive(video, null)).toBe(false);
    expect(isLibraryItemActive(video, episode)).toBe(false);
    expect(isLibraryItemActive(video, transientChannelVideo)).toBe(false);
    expect(isLibraryItemActive(channel, video)).toBe(false);
    expect(isLibraryItemActive(otherChannel, transientChannelVideo, [otherChannel])).toBe(false);
  });
});

describe("getNextPodcastEpisode", () => {
  const ep = (id: string) => ({ episodeId: id, title: id, audioUrl: `https://x.test/${id}.mp3`, thumbnail: "", publishedAt: "2026-11-01T00:00:00.000Z" });
  const eps = [ep("a"), ep("b"), ep("c")];

  it("returns the episode after the current one in feed order", () => {
    expect(getNextPodcastEpisode(eps, "a")?.episodeId).toBe("b");
    expect(getNextPodcastEpisode(eps, "b")?.episodeId).toBe("c");
  });

  it("returns null at the end unless loop-all wraps", () => {
    expect(getNextPodcastEpisode(eps, "c")).toBeNull();
    expect(getNextPodcastEpisode(eps, "c", true)?.episodeId).toBe("a");
    expect(getNextPodcastEpisode([ep("solo")], "solo", true)).toBeNull();
  });

  it("returns null when the current episode is not in the feed", () => {
    expect(getNextPodcastEpisode(eps, "missing")).toBeNull();
    expect(getNextPodcastEpisode([], "a")).toBeNull();
  });
});

describe("buildPodcastEpisodeItem", () => {
  it("builds a playable episode item with podcast metadata and resume position", () => {
    const item = buildPodcastEpisodeItem(
      { episodeId: "e1", title: "Ep 1", audioUrl: "https://x.test/e1.mp3", thumbnail: "", publishedAt: "2026-11-01T00:00:00.000Z", duration: "24:35" },
      { feedUrl: "https://x.test/feed.xml", title: "Show", thumbnail: "https://x.test/art.jpg" },
      { lastPosition: 42, lastWatchedRatio: 0.3 }
    );
    expect(item).toMatchObject({
      type: "podcast-episode",
      episodeId: "e1",
      podcastFeedUrl: "https://x.test/feed.xml",
      podcastTitle: "Show",
      thumbnail: "https://x.test/art.jpg",
      duration: "24:35",
      lastPosition: 42,
      watchSource: { type: "podcast", feedUrl: "https://x.test/feed.xml", audioUrl: "https://x.test/e1.mp3" },
    });
  });
});
