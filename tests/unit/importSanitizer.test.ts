import { describe, expect, it } from "vitest";
import { sanitizeLibraryData } from "@/lib/importSanitizer";

describe("import sanitizer", () => {
  it("accepts legacy library exports without watchHistory", () => {
    const data = sanitizeLibraryData({
      items: [
        {
          type: "video",
          ytId: "abc123",
          title: "Imported video",
          channelName: "Channel",
          thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
          tags: ["Tech"],
          addedAt: 1,
        },
      ],
      customTags: [" Tech "],
    });

    expect(data.watchHistory).toEqual([]);
    expect(data.items).toHaveLength(1);
    expect(data.customTags).toEqual(["tech"]);
  });

  it("rejects data without an items array", () => {
    expect(() => sanitizeLibraryData({ customTags: [] })).toThrow("missing items array");
  });

  it("accepts podcast feed items with HTTP thumbnails", () => {
    const data = sanitizeLibraryData({
      items: [
        {
          type: "podcast",
          feedUrl: "https://example.com/podcast.xml",
          title: "Imported podcast",
          author: "Host",
          thumbnail: "https://cdn.example.com/art.jpg",
          episodeCount: 12,
          tags: ["audio"],
          addedAt: 1,
        },
      ],
    });

    expect(data.items).toHaveLength(1);
    expect(data.items[0]).toMatchObject({
      type: "podcast",
      feedUrl: "https://example.com/podcast.xml",
      thumbnail: "https://cdn.example.com/art.jpg",
    });
  });

  it("drops podcast feed items without HTTP feed URLs", () => {
    const data = sanitizeLibraryData({
      items: [
        {
          type: "podcast",
          feedUrl: "javascript:alert(1)",
          title: "Bad podcast",
          author: "",
          thumbnail: "",
          episodeCount: 0,
          tags: [],
          addedAt: 1,
        },
      ],
    });

    expect(data.items).toEqual([]);
  });

  it("keeps podcast watch history source data", () => {
    const data = sanitizeLibraryData({
      items: [],
      watchHistory: [
        {
          mediaType: "podcast",
          ytId: "episode-1",
          title: "Episode",
          channelName: "Podcast",
          thumbnail: "https://cdn.example.com/art.jpg",
          lastPosition: 30,
          lastWatchedRatio: 0.2,
          firstWatchedAt: 1,
          lastWatchedAt: 2,
          source: {
            type: "podcast",
            feedUrl: "https://example.com/feed.xml",
            audioUrl: "https://cdn.example.com/audio.mp3",
          },
        },
      ],
    });

    expect(data.watchHistory[0]).toMatchObject({
      mediaType: "podcast",
      thumbnail: "https://cdn.example.com/art.jpg",
      source: {
        type: "podcast",
        feedUrl: "https://example.com/feed.xml",
        audioUrl: "https://cdn.example.com/audio.mp3",
      },
    });
  });
});
