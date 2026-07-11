import type { Page } from "@playwright/test";
import type { ChannelItem, LibraryData, PodcastItem, WatchHistoryItem } from "@/types/library";
import type { PodcastFeed, PodcastResolveResult } from "@/lib/podcastRss";

const STORAGE_KEY = "myvidtv_library";

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
}

export async function readLibrary(page: Page): Promise<LibraryData> {
  return await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), STORAGE_KEY) as LibraryData;
}
