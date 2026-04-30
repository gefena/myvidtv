"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  startTransition,
  ReactNode,
} from "react";
import type {
  LibraryData,
  LibraryItem,
  LibrarySettings,
  VideoItem,
  PlaylistChannel,
  ChannelItem,
  WatchHistoryItem,
  WatchProgressInput,
} from "@/types/library";
import { STORAGE_KEY, DEFAULT_SETTINGS } from "@/lib/constants";
import { exportLibrary as exportLibraryFile } from "@/lib/exportImport";
import { mergeWatchHistory, pruneWatchHistory, upsertWatchHistory, calculateStoredProgress } from "@/lib/libraryLogic";

const DEFAULT_LIBRARY: LibraryData = {
  items: [],
  archivedItems: [],
  watchHistory: [],
  customTags: [],
  settings: DEFAULT_SETTINGS,
};

function readStorage(): LibraryData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LIBRARY;
    const parsed = JSON.parse(raw) as Partial<LibraryData>;
    return {
      items: parsed.items ?? [],
      archivedItems: parsed.archivedItems ?? [],
      watchHistory: pruneWatchHistory(Array.isArray(parsed.watchHistory) ? parsed.watchHistory : []),
      customTags: parsed.customTags ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return DEFAULT_LIBRARY;
  }
}

function writeStorage(data: LibraryData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function getItemId(item: LibraryItem): string {
  if (item.type === "video") return item.ytId;
  if (item.type === "playlist-channel") return item.ytPlaylistId;
  return item.channelId;
}

type LibraryContextValue = {
  items: LibraryItem[];
  archivedItems: LibraryItem[];
  watchHistory: WatchHistoryItem[];
  customTags: string[];
  settings: LibrarySettings;
  hydrated: boolean;
  addVideo: (video: Omit<VideoItem, "type" | "addedAt">) => void;
  addPlaylistChannel: (playlist: Omit<PlaylistChannel, "type" | "addedAt">) => void;
  addChannel: (channel: Omit<ChannelItem, "type" | "addedAt">) => void;
  archiveItem: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  addCustomTag: (tag: string) => void;
  updateItem: (id: string, patch: Partial<Pick<LibraryItem, "tags">>) => void;
  updateSettings: (patch: Partial<LibrarySettings>) => void;
  updateVideoPosition: (id: string, position: number, duration: number) => void;
  updateWatchProgress: (input: WatchProgressInput) => void;
  removeWatchHistoryEntry: (ytId: string) => void;
  getWatchHistoryEntry: (ytId: string) => WatchHistoryItem | undefined;
  filteredItems: (tag: string | null) => LibraryItem[];
  allTags: () => string[];
  exportLibrary: () => void;
  importLibrary: (data: LibraryData, mode: "replace" | "merge") => boolean;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ library: LibraryData; hydrated: boolean }>({
    library: DEFAULT_LIBRARY,
    hydrated: false,
  });

  useEffect(() => {
    startTransition(() => {
      setState({
        library: readStorage(),
        hydrated: true,
      });
    });
  }, []);

  const update = useCallback((updater: (prev: LibraryData) => LibraryData) => {
    setState((prev) => {
      const next = updater(prev.library);
      writeStorage(next);
      return { ...prev, library: next };
    });
  }, []);

  const { library, hydrated } = state;

  const addVideo = useCallback(
    (video: Omit<VideoItem, "type" | "addedAt">) => {
      update((prev) => {
        const existsInItems = prev.items.some(
          (i) => i.type === "video" && (i as VideoItem).ytId === video.ytId
        );
        const existsInArchive = prev.archivedItems.some(
          (i) => i.type === "video" && (i as VideoItem).ytId === video.ytId
        );
        if (existsInItems || existsInArchive) return prev;
        const newItem: VideoItem = { type: "video", ...video, addedAt: Date.now() };
        return { ...prev, items: [newItem, ...prev.items] };
      });
    },
    [update]
  );

  const addPlaylistChannel = useCallback(
    (playlist: Omit<PlaylistChannel, "type" | "addedAt">) => {
      update((prev) => {
        const existsInItems = prev.items.some(
          (i) =>
            i.type === "playlist-channel" &&
            (i as PlaylistChannel).ytPlaylistId === playlist.ytPlaylistId
        );
        const existsInArchive = prev.archivedItems.some(
          (i) =>
            i.type === "playlist-channel" &&
            (i as PlaylistChannel).ytPlaylistId === playlist.ytPlaylistId
        );
        if (existsInItems || existsInArchive) return prev;
        const newItem: PlaylistChannel = {
          type: "playlist-channel",
          ...playlist,
          addedAt: Date.now(),
        };
        return { ...prev, items: [newItem, ...prev.items] };
      });
    },
    [update]
  );

  const addChannel = useCallback(
    (channel: Omit<ChannelItem, "type" | "addedAt">) => {
      update((prev) => {
        const exists =
          prev.items.some((i) => i.type === "channel" && (i as ChannelItem).channelId === channel.channelId) ||
          prev.archivedItems.some((i) => i.type === "channel" && (i as ChannelItem).channelId === channel.channelId);
        if (exists) return prev;
        const newItem: ChannelItem = { type: "channel", ...channel, addedAt: Date.now() };
        return { ...prev, items: [newItem, ...prev.items] };
      });
    },
    [update]
  );

  const archiveItem = useCallback(
    (id: string) => {
      update((prev) => {
        const itemToArchive = prev.items.find((item) => getItemId(item) === id);
        if (!itemToArchive) return prev;
        return {
          ...prev,
          items: prev.items.filter((item) => getItemId(item) !== id),
          archivedItems: [itemToArchive, ...prev.archivedItems],
        };
      });
    },
    [update]
  );

  const restoreItem = useCallback(
    (id: string) => {
      update((prev) => {
        const itemToRestore = prev.archivedItems.find((item) => getItemId(item) === id);
        if (!itemToRestore) return prev;
        return {
          ...prev,
          archivedItems: prev.archivedItems.filter((item) => getItemId(item) !== id),
          items: [itemToRestore, ...prev.items],
        };
      });
    },
    [update]
  );

  const permanentlyDeleteItem = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        archivedItems: prev.archivedItems.filter((item) => getItemId(item) !== id),
      }));
    },
    [update]
  );

  const addCustomTag = useCallback(
    (tag: string) => {
      const normalized = tag.trim().toLowerCase();
      if (!normalized) return;
      update((prev) => {
        if (prev.customTags.includes(normalized)) return prev;
        return { ...prev, customTags: [...prev.customTags, normalized] };
      });
    },
    [update]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<Pick<LibraryItem, "tags">>) => {
      update((prev) => ({
        ...prev,
        items: prev.items.map((item) => getItemId(item) === id ? { ...item, ...patch } : item),
      }));
    },
    [update]
  );

  const updateSettings = useCallback(
    (patch: Partial<LibrarySettings>) => {
      update((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
    },
    [update]
  );

  const updateVideoPosition = useCallback(
    (id: string, position: number, duration: number) => {
      update((prev) => {
        const { lastPosition: posToSave, lastWatchedRatio: ratioToSave } = calculateStoredProgress(position, duration);
        const video = [...prev.items, ...prev.archivedItems]
          .find((item): item is VideoItem => item.type === "video" && (item as VideoItem).ytId === id);

        return {
          ...prev,
          items: prev.items.map((item) => {
            if (item.type === "video" && (item as VideoItem).ytId === id) {
              return { ...item, lastPosition: posToSave, lastWatchedRatio: ratioToSave };
            }
            return item;
          }),
          archivedItems: prev.archivedItems.map((item) => {
            if (item.type === "video" && (item as VideoItem).ytId === id) {
              return { ...item, lastPosition: posToSave, lastWatchedRatio: ratioToSave };
            }
            return item;
          }),
          watchHistory: video
            ? upsertWatchHistory(prev.watchHistory, {
                ytId: video.ytId,
                title: video.title,
                channelName: video.channelName,
                thumbnail: video.thumbnail,
                position,
                duration,
                source: { type: "library" },
              })
            : prev.watchHistory,
        };
      });
    },
    [update]
  );

  const updateWatchProgress = useCallback(
    (input: WatchProgressInput) => {
      update((prev) => {
        const { lastPosition: posToSave, lastWatchedRatio: ratioToSave } = calculateStoredProgress(input.position, input.duration);
        const hasProgress = input.duration > 0;

        return {
          ...prev,
          items: prev.items.map((item) => {
            if (hasProgress && item.type === "video" && (item as VideoItem).ytId === input.ytId) {
              return { ...item, lastPosition: posToSave, lastWatchedRatio: ratioToSave };
            }
            return item;
          }),
          archivedItems: prev.archivedItems.map((item) => {
            if (hasProgress && item.type === "video" && (item as VideoItem).ytId === input.ytId) {
              return { ...item, lastPosition: posToSave, lastWatchedRatio: ratioToSave };
            }
            return item;
          }),
          watchHistory: upsertWatchHistory(prev.watchHistory, input),
        };
      });
    },
    [update]
  );

  const removeWatchHistoryEntry = useCallback(
    (ytId: string) => {
      update((prev) => ({
        ...prev,
        watchHistory: prev.watchHistory.filter((entry) => entry.ytId !== ytId),
      }));
    },
    [update]
  );

  const getWatchHistoryEntry = useCallback(
    (ytId: string) => library.watchHistory.find((entry) => entry.ytId === ytId),
    [library.watchHistory]
  );

  const exportLibrary = useCallback(() => {
    exportLibraryFile(state.library);
  }, [state.library]);

  const importLibrary = useCallback(
    (data: LibraryData, mode: "replace" | "merge"): boolean => {
      if (mode === "replace") {
        const safe = {
          ...data,
          watchHistory: pruneWatchHistory(data.watchHistory ?? []),
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
        };
        const ok = writeStorage(safe);
        setState((prev) => ({ ...prev, library: safe }));
        return ok;
      } else {
        const prev = state.library;
        const existingIds = new Set(prev.items.map(getItemId));
        const existingArchivedIds = new Set(prev.archivedItems.map(getItemId));
        const newItems = data.items.filter((i) => {
          const id = getItemId(i);
          return !existingIds.has(id) && !existingArchivedIds.has(id);
        });
        const newArchivedItems = data.archivedItems.filter((i) => {
          const id = getItemId(i);
          return !existingIds.has(id) && !existingArchivedIds.has(id);
        });
        const mergedCustomTags = Array.from(
          new Set([...prev.customTags, ...data.customTags])
        );
        const next: LibraryData = {
          ...prev,
          items: [...prev.items, ...newItems],
          archivedItems: [...prev.archivedItems, ...newArchivedItems],
          customTags: mergedCustomTags,
          watchHistory: mergeWatchHistory(prev.watchHistory, data.watchHistory ?? []),
        };
        const ok = writeStorage(next);
        setState((s) => ({ ...s, library: next }));
        return ok;
      }
    },
    [state]
  );

  const filteredItems = useCallback(
    (tag: string | null): LibraryItem[] => {
      if (!tag || tag === "all") return library.items;
      return library.items.filter((item) => item.tags.includes(tag));
    },
    [library.items]
  );

  const allTags = useCallback((): string[] => {
    const tagSet = new Set<string>();
    library.items.forEach((item) => item.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [library.items]);

  return (
    <LibraryContext.Provider
      value={{
        items: library.items,
        archivedItems: library.archivedItems,
        watchHistory: library.watchHistory,
        customTags: library.customTags,
        settings: library.settings,
        hydrated,
        addVideo,
        addPlaylistChannel,
        addChannel,
        archiveItem,
        restoreItem,
        permanentlyDeleteItem,
        addCustomTag,
        updateItem,
        updateSettings,
        updateVideoPosition,
        updateWatchProgress,
        removeWatchHistoryEntry,
        getWatchHistoryEntry,
        filteredItems,
        allTags,
        exportLibrary,
        importLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
