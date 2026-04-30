import type { WatchHistoryItem, WatchProgressInput } from "@/types/library";

export const WATCH_HISTORY_LIMIT = 50;
export const WATCH_HISTORY_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export function pruneWatchHistory(history: WatchHistoryItem[], now = Date.now()): WatchHistoryItem[] {
  const cutoff = now - WATCH_HISTORY_MAX_AGE_MS;
  return [...history]
    .filter((entry) => entry.lastWatchedAt >= cutoff)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .slice(0, WATCH_HISTORY_LIMIT);
}

export function upsertWatchHistory(
  history: WatchHistoryItem[],
  input: WatchProgressInput,
  now = Date.now()
): WatchHistoryItem[] {
  const existing = history.find((entry) => entry.ytId === input.ytId);
  const progress = calculateStoredProgress(input.position, input.duration);
  const hasProgress = input.duration > 0;
  const inputPosition = Number.isFinite(input.position) && input.position > 0 ? Math.floor(input.position) : 0;
  const inputRatio =
    typeof input.lastWatchedRatio === "number" && Number.isFinite(input.lastWatchedRatio)
      ? Math.min(1, Math.max(0, input.lastWatchedRatio))
      : 0;
  const seedFromInput = !hasProgress && input.preferInputProgress;
  const lastPosition = hasProgress
    ? progress.lastPosition
    : seedFromInput ? inputPosition : existing?.lastPosition ?? inputPosition;
  const lastWatchedRatio = hasProgress
    ? progress.lastWatchedRatio
    : seedFromInput ? inputRatio : existing?.lastWatchedRatio ?? inputRatio;

  const nextEntry: WatchHistoryItem = {
    ytId: input.ytId,
    title: input.title,
    channelName: input.channelName,
    thumbnail: input.thumbnail,
    lastPosition,
    lastWatchedRatio,
    firstWatchedAt: existing?.firstWatchedAt ?? now,
    lastWatchedAt: now,
    source: input.source ?? existing?.source,
  };

  return pruneWatchHistory([
    nextEntry,
    ...history.filter((entry) => entry.ytId !== input.ytId),
  ], now);
}

export function mergeWatchHistory(current: WatchHistoryItem[], incoming: WatchHistoryItem[], now?: number): WatchHistoryItem[] {
  const byId = new Map<string, WatchHistoryItem>();
  [...current, ...incoming].forEach((entry) => {
    const existing = byId.get(entry.ytId);
    if (!existing || entry.lastWatchedAt > existing.lastWatchedAt) {
      byId.set(entry.ytId, entry);
    }
  });
  return pruneWatchHistory(Array.from(byId.values()), now);
}

export function calculateStoredProgress(position: number, duration: number): {
  lastPosition: number;
  lastWatchedRatio: number;
} {
  const isFinished = duration > 0 && position / duration >= 0.95;
  return {
    lastPosition: isFinished ? 0 : Math.floor(position),
    lastWatchedRatio: isFinished ? 0 : duration > 0 ? position / duration : 0,
  };
}
