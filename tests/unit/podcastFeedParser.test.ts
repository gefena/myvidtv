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

  it("normalizes raw seconds and HH:MM:SS durations and drops invalid values", () => {
    const xml = `
      <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <title>Durations Podcast</title>
          <item>
            <guid>raw-seconds</guid>
            <title>Raw Seconds</title>
            <pubDate>Mon, 04 Jan 2026 10:00:00 GMT</pubDate>
            <itunes:duration>1475</itunes:duration>
            <enclosure url="https://cdn.example.com/1.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>hours</guid>
            <title>Long Episode</title>
            <pubDate>Mon, 03 Jan 2026 10:00:00 GMT</pubDate>
            <itunes:duration>01:02:10</itunes:duration>
            <enclosure url="https://cdn.example.com/2.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>fractional</guid>
            <title>Fractional Seconds</title>
            <pubDate>Mon, 02 Jan 2026 10:00:00 GMT</pubDate>
            <itunes:duration>1475.5</itunes:duration>
            <enclosure url="https://cdn.example.com/3.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>invalid</guid>
            <title>Bad Duration</title>
            <pubDate>Mon, 01 Jan 2026 10:00:00 GMT</pubDate>
            <itunes:duration>not-a-duration</itunes:duration>
            <enclosure url="https://cdn.example.com/4.mp3" type="audio/mpeg" />
          </item>
        </channel>
      </rss>
    `;

    const feed = parsePodcastFeedXml(xml, "https://example.com/feed.xml");
    expect(feed.episodes.map((ep) => [ep.episodeId, ep.duration])).toEqual([
      ["raw-seconds", "24:35"],
      ["hours", "1:02:10"],
      ["fractional", "24:36"],
      ["invalid", undefined],
    ]);
  });

  it("extracts episodeLink for RSS, Atom, and relative URLs, and drops audio-only or missing links", () => {
    const rssXml = `
      <rss version="2.0">
        <channel>
          <title>Link Podcast</title>
          <item>
            <guid>rss-abs</guid>
            <title>RSS Absolute</title>
            <pubDate>Fri, 05 Jan 2026 10:00:00 GMT</pubDate>
            <link>https://example.com/episodes/rss-abs?ref=feed&amp;utm=1</link>
            <enclosure url="https://cdn.example.com/rss-abs.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>rss-rel</guid>
            <title>RSS Relative</title>
            <pubDate>Thu, 04 Jan 2026 10:00:00 GMT</pubDate>
            <link>/episodes/rss-rel</link>
            <enclosure url="https://cdn.example.com/rss-rel.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>rss-audio-only</guid>
            <title>RSS Audio Link</title>
            <pubDate>Wed, 03 Jan 2026 10:00:00 GMT</pubDate>
            <link>https://cdn.example.com/direct.m4a?download=1</link>
            <enclosure url="https://cdn.example.com/rss-audio.mp3" type="audio/mpeg" />
          </item>
          <item>
            <guid>rss-missing</guid>
            <title>RSS Missing Link</title>
            <pubDate>Tue, 02 Jan 2026 10:00:00 GMT</pubDate>
            <enclosure url="https://cdn.example.com/rss-missing.mp3" type="audio/mpeg" />
          </item>
        </channel>
      </rss>
    `;

    const rssFeed = parsePodcastFeedXml(rssXml, "https://example.com/podcast/feed.xml");
    expect(rssFeed.episodes.map((ep) => [ep.episodeId, ep.episodeLink])).toEqual([
      ["rss-abs", "https://example.com/episodes/rss-abs?ref=feed&utm=1"],
      ["rss-rel", "https://example.com/episodes/rss-rel"],
      ["rss-audio-only", undefined],
      ["rss-missing", undefined],
    ]);

    const atomXml = `
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Atom Podcast</title>
        <entry>
          <id>atom-alt</id>
          <title>Atom Alternate</title>
          <updated>2026-01-05T10:00:00Z</updated>
          <link rel="enclosure" type="audio/mpeg" href="https://cdn.example.com/atom-alt.mp3" />
          <link rel="alternate" type="text/html" href="/shows/atom-alt" />
        </entry>
        <entry>
          <id>atom-plain</id>
          <title>Atom Plain Link</title>
          <updated>2026-01-04T10:00:00Z</updated>
          <link rel="enclosure" type="audio/mpeg" href="https://cdn.example.com/atom-plain.mp3" />
          <link href="https://example.com/shows/atom-plain" />
        </entry>
        <entry>
          <id>atom-audio-only</id>
          <title>Atom Audio Only</title>
          <updated>2026-01-03T10:00:00Z</updated>
          <link rel="enclosure" type="audio/mpeg" href="https://cdn.example.com/atom-audio.mp3" />
          <link rel="alternate" href="https://cdn.example.com/atom-audio.mp3" />
        </entry>
      </feed>
    `;

    const atomFeed = parsePodcastFeedXml(atomXml, "https://example.com/atom.xml");
    expect(atomFeed.episodes.map((ep) => [ep.episodeId, ep.episodeLink])).toEqual([
      ["atom-alt", "https://example.com/shows/atom-alt"],
      ["atom-plain", "https://example.com/shows/atom-plain"],
      ["atom-audio-only", undefined],
    ]);
  });

  it("ignores Atom links with rel=self or rel=replies", () => {
    const atomXml = `
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Atom Rel Podcast</title>
        <entry>
          <id>atom-self-replies</id>
          <title>Self And Replies Only</title>
          <updated>2026-01-05T10:00:00Z</updated>
          <link rel="enclosure" type="audio/mpeg" href="https://cdn.example.com/ep.mp3" />
          <link rel="self" href="https://example.com/feeds/ep.xml" />
          <link rel="replies" href="https://example.com/episodes/ep/comments" />
        </entry>
      </feed>
    `;

    const atomFeed = parsePodcastFeedXml(atomXml, "https://example.com/atom.xml");
    expect(atomFeed.episodes.map((ep) => [ep.episodeId, ep.episodeLink])).toEqual([
      ["atom-self-replies", undefined],
    ]);
  });
});
