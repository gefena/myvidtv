import type { ChannelFeed } from "@/lib/channelRss";
import { FEED_CACHE_KEY } from "@/lib/constants";

const CACHE_MAX_ENTRIES = 30;
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type FeedCacheEntry = {
  feed: ChannelFeed;
  cachedAt: number;
  lastAccessedAt: number;
};

type FeedCacheStore = Record<string, FeedCacheEntry>;

function readStore(): FeedCacheStore {
  try {
    const raw = localStorage.getItem(FEED_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as FeedCacheStore;
  } catch {
    return {};
  }
}

function saveStore(store: FeedCacheStore): void {
  try {
    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded or unavailable — silently ignore
  }
}

export function writeCache(channelId: string, feed: ChannelFeed): void {
  try {
    const store = readStore();
    const now = Date.now();
    const isUpdate = channelId in store;

    if (!isUpdate && Object.keys(store).length >= CACHE_MAX_ENTRIES) {
      const lruKey = Object.entries(store).sort(
        ([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt
      )[0][0];
      delete store[lruKey];
    }

    store[channelId] = { feed, cachedAt: now, lastAccessedAt: now };
    saveStore(store);
  } catch {
    // silently ignore
  }
}

export function getCacheEntry(channelId: string): FeedCacheEntry | null {
  try {
    const store = readStore();
    const entry = store[channelId];
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > CACHE_MAX_AGE_MS) return null;

    const updated = { ...entry, lastAccessedAt: Date.now() };
    store[channelId] = updated;
    saveStore(store);

    return updated;
  } catch {
    return null;
  }
}
