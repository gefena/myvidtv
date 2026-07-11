import { describe, expect, it } from "vitest";
import { parsePodcastFeedXml } from "@/lib/podcastFeedParser";

describe("podcast feed parser", () => {
  it("extracts compact podcast JSON and caps playable episodes", () => {
    const items = Array.from({ length: 105 }, (_, index) => `
      <item>
        <guid>episode-${index}</guid>
        <title><![CDATA[Episode &amp; ${index}]]></title>
        <pubDate>Sat, 11 Jul 2026 10:00:00 GMT</pubDate>
        <itunes:duration>12:34</itunes:duration>
        <enclosure url="/audio-${index}.mp3" type="audio/mpeg" />
      </item>
    `).join("");
    const xml = `
      <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <title>Sample Podcast</title>
          <itunes:author>Sample Host</itunes:author>
          <image><url>/art.jpg</url></image>
          ${items}
        </channel>
      </rss>
    `;

    const feed = parsePodcastFeedXml(xml, "https://example.com/feed.xml");

    expect(feed).toMatchObject({
      feedUrl: "https://example.com/feed.xml",
      title: "Sample Podcast",
      author: "Sample Host",
      thumbnail: "https://example.com/art.jpg",
      episodeCount: 105,
    });
    expect(feed.episodes).toHaveLength(100);
    expect(feed.episodes[0]).toMatchObject({
      episodeId: "episode-0",
      title: "Episode & 0",
      audioUrl: "https://example.com/audio-0.mp3",
      thumbnail: "https://example.com/art.jpg",
      duration: "12:34",
    });
  });

  it("ignores entries without playable audio", () => {
    const xml = `
      <rss version="2.0">
        <channel>
          <title>Sample Podcast</title>
          <item><guid>no-audio</guid><title>No audio</title></item>
        </channel>
      </rss>
    `;

    const feed = parsePodcastFeedXml(xml, "https://example.com/feed.xml");

    expect(feed.episodeCount).toBe(1);
    expect(feed.episodes).toEqual([]);
  });

  it("orders playable episodes newest first even when the feed is oldest first", () => {
    const xml = `
      <rss version="2.0">
        <channel>
          <title>Oldest First Podcast</title>
          <item>
            <guid>oldest</guid>
            <title>Oldest</title>
            <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
            <enclosure url="https://cdn.example.com/oldest.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>middle</guid>
            <title>Middle</title>
            <pubDate>Mon, 01 Jan 2025 10:00:00 GMT</pubDate>
            <enclosure url="https://cdn.example.com/middle.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>newest</guid>
            <title>Newest</title>
            <pubDate>Mon, 01 Jan 2026 10:00:00 GMT</pubDate>
            <enclosure url="https://cdn.example.com/newest.mp3" type="audio/mpeg" />
          </item>
        </channel>
      </rss>
    `;

    const feed = parsePodcastFeedXml(xml, "https://example.com/feed.xml");

    expect(feed.episodes.map((episode) => episode.episodeId)).toEqual(["newest", "middle", "oldest"]);
  });

  it("counts large feeds without returning more than the playable cap", () => {
    const items = Array.from({ length: 2_000 }, (_, index) => `
      <item>
        <guid>daily-${index}</guid>
        <title>Daily Episode ${index}</title>
        <pubDate>${new Date(Date.UTC(2024, 0, 1 + index)).toUTCString()}</pubDate>
        <enclosure url="https://cdn.example.com/daily-${index}.mp3" type="audio/mpeg" />
      </item>
    `).join("");
    const xml = `<rss><channel><title>Daily Podcast</title>${items}</channel></rss>`;

    const feed = parsePodcastFeedXml(xml, "https://example.com/feed.xml");

    expect(feed.episodeCount).toBe(2_000);
    expect(feed.episodes).toHaveLength(100);
    expect(feed.episodes.at(0)?.episodeId).toBe("daily-1999");
    expect(feed.episodes.at(-1)?.episodeId).toBe("daily-1900");
  });
});
