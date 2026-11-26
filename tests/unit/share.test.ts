import { describe, expect, it } from "vitest";
import { getSharePayload } from "@/lib/share";
import type { ChannelItem, PlaylistChannel, PodcastEpisodeItem, PodcastItem, VideoItem } from "@/types/library";

function makeVideo(overrides: Partial<VideoItem> = {}): VideoItem {
  return {
    type: "video",
    ytId: "dQw4w9WgXcQ",
    title: "Test Video",
    channelName: "Test Channel",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    tags: [],
    addedAt: 1,
    ...overrides,
  };
}

function makeEpisode(overrides: Partial<PodcastEpisodeItem> = {}): PodcastEpisodeItem {
  return {
    type: "podcast-episode",
    episodeId: "ep-1",
    podcastFeedUrl: "https://example.com/feed.xml",
    title: "Episode One",
    podcastTitle: "My Podcast",
    audioUrl: "https://cdn.example.com/ep1.mp3",
    episodeLink: "https://example.com/episodes/one",
    thumbnail: "https://cdn.example.com/art.jpg",
    publishedAt: "2026-07-11T00:00:00.000Z",
    tags: [],
    addedAt: 0,
    ...overrides,
  };
}

describe("getSharePayload", () => {
  it("builds a YouTube watch URL without timestamp when position is missing or under 5s", () => {
    const video = makeVideo();

    expect(getSharePayload(video)).toEqual({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Test Video",
      text: "Test Video",
    });

    expect(getSharePayload(video, { positionSeconds: 0 })?.url).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );

    expect(getSharePayload(video, { positionSeconds: 4.9 })?.url).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
  });

  it("appends floored &t= seconds for YouTube videos at 5s or more", () => {
    const video = makeVideo();

    expect(getSharePayload(video, { positionSeconds: 5 })?.url).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s"
    );

    expect(getSharePayload(video, { positionSeconds: 67.9 })?.url).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=67s"
    );
  });

  it("prefers episodeLink for podcast episodes without timestamp and formats text with podcast title", () => {
    const episode = makeEpisode();

    expect(getSharePayload(episode, { positionSeconds: 120 })).toEqual({
      url: "https://example.com/episodes/one",
      title: "Episode One",
      text: "Episode One — My Podcast",
    });
  });

  it("uses episode title alone when podcastTitle is empty", () => {
    const episode = makeEpisode({ podcastTitle: "" });

    expect(getSharePayload(episode)).toEqual({
      url: "https://example.com/episodes/one",
      title: "Episode One",
      text: "Episode One",
    });
  });

  it("falls back to audioUrl when episodeLink is missing, non-http(s), equals audioUrl, or looks like an audio file", () => {
    expect(getSharePayload(makeEpisode({ episodeLink: undefined }))?.url).toBe(
      "https://cdn.example.com/ep1.mp3"
    );

    expect(getSharePayload(makeEpisode({ episodeLink: "javascript:alert(1)" }))?.url).toBe(
      "https://cdn.example.com/ep1.mp3"
    );

    expect(getSharePayload(makeEpisode({ episodeLink: "https://cdn.example.com/ep1.mp3" }))?.url).toBe(
      "https://cdn.example.com/ep1.mp3"
    );

    for (const ext of ["mp3", "m4a", "aac", "ogg", "opus", "wav"]) {
      const ep = makeEpisode({
        episodeLink: `https://example.com/files/episode.${ext}?token=abc123`,
      });
      expect(getSharePayload(ep)?.url).toBe("https://cdn.example.com/ep1.mp3");
    }
  });

  it("falls back to podcastFeedUrl only when both episodeLink and audioUrl are unusable", () => {
    const episode = makeEpisode({
      episodeLink: undefined,
      audioUrl: "",
    });

    expect(getSharePayload(episode)?.url).toBe("https://example.com/feed.xml");
  });

  it("returns null for podcast episodes with no usable URLs", () => {
    const episode = makeEpisode({
      episodeLink: "ftp://example.com/ep1",
      audioUrl: "not-a-url",
      podcastFeedUrl: "javascript:void(0)",
    });

    expect(getSharePayload(episode)).toBeNull();
  });

  it("returns null for non-playable items and null/undefined", () => {
    const channel: ChannelItem = {
      type: "channel",
      channelId: "UC123",
      title: "Channel",
      thumbnail: "",
      tags: [],
      addedAt: 1,
    };
    const playlist: PlaylistChannel = {
      type: "playlist-channel",
      ytPlaylistId: "PL123",
      title: "Playlist",
      channelName: "Channel",
      thumbnail: "",
      videoCount: 5,
      tags: [],
      addedAt: 1,
    };
    const podcast: PodcastItem = {
      type: "podcast",
      feedUrl: "https://example.com/feed.xml",
      title: "Podcast",
      author: "Host",
      thumbnail: "",
      episodeCount: 10,
      tags: [],
      addedAt: 1,
    };

    expect(getSharePayload(null)).toBeNull();
    expect(getSharePayload(undefined)).toBeNull();
    expect(getSharePayload(channel)).toBeNull();
    expect(getSharePayload(playlist)).toBeNull();
    expect(getSharePayload(podcast)).toBeNull();
  });
});
