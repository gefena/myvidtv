import type { Page } from "@playwright/test";
import type { ChannelItem, LibraryData, WatchHistoryItem } from "@/types/library";

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
