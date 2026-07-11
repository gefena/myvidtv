import { describe, expect, it } from "vitest";
import { discoverFeedLinksFromHtml, parseApplePodcastId, parseSpotifyShowId } from "@/lib/podcastLinkResolver";

describe("podcast link resolver", () => {
  it("extracts Apple Podcasts IDs", () => {
    expect(parseApplePodcastId(new URL("https://podcasts.apple.com/us/podcast/show-name/id123456789"))).toBe("123456789");
    expect(parseApplePodcastId(new URL("https://itunes.apple.com/podcast/show-name?id=987654321"))).toBe("987654321");
  });

  it("extracts Spotify show IDs", () => {
    expect(parseSpotifyShowId(new URL("https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk?si=test"))).toBe("4rOoJ6Egrf8K2IrywzwOMk");
    expect(parseSpotifyShowId(new URL("https://open.spotify.com/episode/abc"))).toBeNull();
  });

  it("discovers alternate RSS feeds from podcast pages", () => {
    const choices = discoverFeedLinksFromHtml(
      `
        <html>
          <head>
            <link rel="alternate" type="application/rss+xml" title="Main Feed" href="/feed.xml">
            <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="https://feeds.example.com/atom">
            <link rel="stylesheet" href="/style.css">
          </head>
        </html>
      `,
      "https://example.com/podcast"
    );

    expect(choices).toEqual([
      { title: "Main Feed", author: "", feedUrl: "https://example.com/feed.xml", thumbnail: "" },
      { title: "Atom Feed", author: "", feedUrl: "https://feeds.example.com/atom", thumbnail: "" },
    ]);
  });
});
