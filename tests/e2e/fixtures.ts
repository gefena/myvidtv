import type { Page } from "@playwright/test";
import type { ChannelItem, LibraryData, PodcastItem, VideoItem, WatchHistoryItem } from "@/types/library";
import type { PodcastFeed, PodcastResolveResult } from "@/lib/podcastRss";

const STORAGE_KEY = "myvidtv_library";

export function videoItem(overrides: Partial<VideoItem> = {}): VideoItem {
  return {
    type: "video",
    ytId: "dQw4w9WgXcQ",
    title: "Seeded Long Video Title For Mobile Layout Verification",
    channelName: "Seeded Channel",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    tags: ["music"],
    addedAt: Date.now(),
    ...overrides,
  };
}

export async function mockYouTubeIframeApi(page: Page): Promise<void> {
  await page.route("https://www.youtube.com/iframe_api", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.__ytPlayerCreateCount = window.__ytPlayerCreateCount || 0;
        window.YT = {
          PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 },
          Player: function(el, opts) {
            window.__ytPlayerCreateCount += 1;
            window.__ytTriggerEnded = function() {
              opts.events?.onStateChange?.({ data: 0 });
            };
            this.loadVideoById = function() { opts.events?.onStateChange?.({ data: 1 }); };
            this.cuePlaylist = function() {};
            this.playVideo = function() { opts.events?.onStateChange?.({ data: 1 }); };
            this.pauseVideo = function() { opts.events?.onStateChange?.({ data: 2 }); };
            this.nextVideo = function() {};
            this.seekTo = function() {};
            this.getCurrentTime = function() { return 30; };
            this.getDuration = function() { return 120; };
            this.getPlayerState = function() { return 1; };
            this.destroy = function() {};
            setTimeout(() => opts.events?.onReady?.(), 10);
          }
        };
        setTimeout(() => window.onYouTubeIframeAPIReady?.(), 10);
      `,
    });
  });
}

export async function mockYouTubeOEmbed(
  page: Page,
  meta: { title: string; author_name: string } = {
    title: "Mocked YouTube Video",
    author_name: "Mocked Creator",
  }
): Promise<void> {
  await page.route("https://www.youtube.com/oembed?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(meta),
    });
  });
}

export function watchHistoryEntry(overrides: Partial<WatchHistoryItem> = {}): WatchHistoryItem {
  return {
    ytId: "history-video-1",
    title: "Seeded History Video",
    channelName: "Seeded Channel",
    thumbnail: "https://i.ytimg.com/vi/history-video-1/hqdefault.jpg",
    lastPosition: 42,
    lastWatchedRatio: 0.3,
    firstWatchedAt: Date.now() - 10_000,
    lastWatchedAt: Date.now(),
    source: { type: "history" },
    ...overrides,
  };
}

export function channelItem(overrides: Partial<ChannelItem> = {}): ChannelItem {
  return {
    type: "channel",
    channelId: "UC_test_fixture_channel",
    title: "Seeded Channel",
    thumbnail: "",
    tags: [],
    addedAt: Date.now(),
    ...overrides,
  };
}

export function podcastItem(overrides: Partial<PodcastItem> = {}): PodcastItem {
  return {
    type: "podcast",
    feedUrl: "https://example.test/feed.xml",
    title: "Seeded Podcast",
    author: "Seeded Host",
    thumbnail: "https://podcast-cdn.example.test/artwork.jpg",
    episodeCount: 1,
    tags: [],
    addedAt: Date.now(),
    ...overrides,
  };
}

export function podcastFeed(overrides: Partial<PodcastFeed> = {}): PodcastFeed {
  return {
    feedUrl: "https://example.test/feed.xml",
    title: "Seeded Podcast",
    author: "Seeded Host",
    thumbnail: "https://podcast-cdn.example.test/artwork.jpg",
    episodeCount: 1,
    episodes: [
      {
        episodeId: "seeded-episode-1",
        title: "Seeded Podcast Episode",
        audioUrl: "https://podcast-cdn.example.test/audio.mp3",
        thumbnail: "https://podcast-cdn.example.test/episode.jpg",
        publishedAt: "2026-07-11T00:00:00.000Z",
        duration: "12:34",
      },
    ],
    ...overrides,
  };
}

export async function mockPodcastFeed(page: Page, feed: PodcastFeed, status = 200): Promise<void> {
  await page.route("**/api/podcast-feed?**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status >= 400 ? { error: "Podcast feed failed" } : feed),
    });
  });
}

export async function mockPodcastResolve(page: Page, result: PodcastResolveResult, status = 200): Promise<void> {
  await page.route("**/api/resolve-podcast?**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status >= 400 ? { error: "Podcast resolve failed" } : result),
    });
  });
}

export async function seedLibrary(page: Page, data: Partial<LibraryData>): Promise<void> {
  const library: LibraryData = {
    items: [],
    archivedItems: [],
    watchHistory: [],
    customTags: [],
    settings: {
      theme: "dark",
      libraryCollapsed: false,
      listenMode: false,
      sortOrder: "addedAt_desc",
      loopMode: "off",
    },
    ...data,
  };

  await page.goto("/");
  await page.evaluate(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: JSON.stringify(library) }
  );
  await page.reload();
  await page.locator("header").waitFor({ state: "visible" });
}

export async function readLibrary(page: Page): Promise<LibraryData> {
  return await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), STORAGE_KEY) as LibraryData;
}
