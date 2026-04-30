import { describe, expect, it } from "vitest";
import {
  WATCH_HISTORY_LIMIT,
  WATCH_HISTORY_MAX_AGE_MS,
  calculateStoredProgress,
  mergeWatchHistory,
  pruneWatchHistory,
  upsertWatchHistory,
} from "@/lib/libraryLogic";
import type { WatchHistoryItem } from "@/types/library";

function historyEntry(ytId: string, lastWatchedAt: number): WatchHistoryItem {
  return {
    ytId,
    title: `Video ${ytId}`,
    channelName: "Channel",
    thumbnail: "",
    lastPosition: 10,
    lastWatchedRatio: 0.25,
    firstWatchedAt: lastWatchedAt - 100,
    lastWatchedAt,
  };
}

describe("watch history logic", () => {
  it("keeps the newest 50 entries", () => {
    const now = 2_000_000_000_000;
    const entries = Array.from({ length: WATCH_HISTORY_LIMIT + 5 }, (_, index) =>
      historyEntry(`video-${index}`, now - index)
    );

    const pruned = pruneWatchHistory(entries, now);

    expect(pruned).toHaveLength(WATCH_HISTORY_LIMIT);
    expect(pruned[0]?.ytId).toBe("video-0");
    expect(pruned.at(-1)?.ytId).toBe("video-49");
  });

  it("removes entries older than 180 days", () => {
    const now = 2_000_000_000_000;
    const fresh = historyEntry("fresh", now - WATCH_HISTORY_MAX_AGE_MS);
    const stale = historyEntry("stale", now - WATCH_HISTORY_MAX_AGE_MS - 1);

    expect(pruneWatchHistory([stale, fresh], now).map((entry) => entry.ytId)).toEqual(["fresh"]);
  });

  it("merges matching entries by newest lastWatchedAt", () => {
    const now = 2_000_000_000_000;
    const current = [historyEntry("same", now - 100), historyEntry("current-only", now - 150)];
    const incoming = [historyEntry("same", now - 50), historyEntry("incoming-only", now - 125)];

    const merged = mergeWatchHistory(current, incoming, now);

    expect(merged.map((entry) => entry.ytId)).toEqual(["same", "incoming-only", "current-only"]);
    expect(merged.find((entry) => entry.ytId === "same")?.lastWatchedAt).toBe(now - 50);
  });

  it("resets stored progress at the inclusive 95 percent completion threshold", () => {
    expect(calculateStoredProgress(95, 100)).toEqual({ lastPosition: 0, lastWatchedRatio: 0 });
    expect(calculateStoredProgress(94, 100)).toEqual({ lastPosition: 94, lastWatchedRatio: 0.94 });
  });
});

describe("upsertWatchHistory", () => {
  it("creates a new entry with calculated progress", () => {
    const now = 2_000_000_000_000;
    const result = upsertWatchHistory([], { ytId: "new-vid", title: "New Video", channelName: "Channel", thumbnail: "", position: 30, duration: 200 }, now);

    expect(result).toHaveLength(1);
    expect(result[0]?.lastPosition).toBe(30);
    expect(result[0]?.lastWatchedRatio).toBeCloseTo(0.15);
    expect(result[0]?.firstWatchedAt).toBe(now);
    expect(result[0]?.lastWatchedAt).toBe(now);
  });

  it("updates an existing entry and preserves firstWatchedAt", () => {
    const earlier = 2_000_000_000_000;
    const later = earlier + 60_000;
    const existing = [historyEntry("upd-vid", earlier)];

    const result = upsertWatchHistory(existing, { ytId: "upd-vid", title: "Video upd-vid", channelName: "Channel", thumbnail: "", position: 50, duration: 200 }, later);

    expect(result[0]?.firstWatchedAt).toBe(earlier - 100);
    expect(result[0]?.lastWatchedAt).toBe(later);
    expect(result[0]?.lastPosition).toBe(50);
  });

  it("seeds progress from input when duration is zero and preferInputProgress is true", () => {
    const now = 2_000_000_000_000;
    const result = upsertWatchHistory([], { ytId: "seed-vid", title: "Seed Video", channelName: "Channel", thumbnail: "", position: 45, duration: 0, lastWatchedRatio: 0.5, preferInputProgress: true }, now);

    expect(result[0]?.lastPosition).toBe(45);
    expect(result[0]?.lastWatchedRatio).toBe(0.5);
  });

  it("falls back to existing progress when duration is zero and preferInputProgress is not set", () => {
    const now = 2_000_000_000_000;
    const existing = [{ ...historyEntry("fall-vid", now - 100), lastPosition: 80, lastWatchedRatio: 0.4 }];

    const result = upsertWatchHistory(existing, { ytId: "fall-vid", title: "Video fall-vid", channelName: "Channel", thumbnail: "", position: 0, duration: 0 }, now);

    expect(result[0]?.lastPosition).toBe(80);
    expect(result[0]?.lastWatchedRatio).toBe(0.4);
  });
});
