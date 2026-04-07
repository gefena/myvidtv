"use client";

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
  ReactNode,
} from "react";
import type {
  LibraryData,
  LibraryItem,
  LibrarySettings,
  VideoItem,
  PlaylistChannel,
} from "@/types/library";
import { STORAGE_KEY, DEFAULT_SETTINGS } from "@/lib/constants";

const DEFAULT_LIBRARY: LibraryData = {
  items: [],
  archivedItems: [],
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
      customTags: parsed.customTags ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return DEFAULT_LIBRARY;
  }
}

function writeStorage(data: LibraryData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

type LibraryContextValue = {
  items: LibraryItem[];
  archivedItems: LibraryItem[];
  customTags: string[];
  settings: LibrarySettings;
  hydrated: boolean;
  addVideo: (video: Omit<VideoItem, "type" | "addedAt">) => void;
  addPlaylistChannel: (playlist: Omit<PlaylistChannel, "type" | "addedAt">) => void;
  archiveItem: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  removeItem: (id: string) => void;
  addCustomTag: (tag: string) => void;
  updateItem: (id: string, patch: Partial<Pick<LibraryItem, "tags">>) => void;
  updateSettings: (patch: Partial<LibrarySettings>) => void;
  updateVideoPosition: (id: string, position: number, duration: number) => void;
  filteredItems: (tag: string | null) => LibraryItem[];
  allTags: () => string[];
};


const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ library: LibraryData; hydrated: boolean }>({
    library: DEFAULT_LIBRARY,
    hydrated: false,
  });

  useLayoutEffect(() => {
    setTimeout(() => {
      setState({
        library: readStorage(),
        hydrated: true,
      });
    }, 0);
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

  const archiveItem = useCallback(
    (id: string) => {
      update((prev) => {
        const itemToArchive = prev.items.find((item) => {
          if (item.type === "video") return (item as VideoItem).ytId === id;
          return (item as PlaylistChannel).ytPlaylistId === id;
        });

        if (!itemToArchive) return prev;

        return {
          ...prev,
          items: prev.items.filter((item) => {
            if (item.type === "video") return (item as VideoItem).ytId !== id;
            return (item as PlaylistChannel).ytPlaylistId !== id;
          }),
          archivedItems: [itemToArchive, ...prev.archivedItems],
        };
      });
    },
    [update]
  );

  const restoreItem = useCallback(
    (id: string) => {
      update((prev) => {
        const itemToRestore = prev.archivedItems.find((item) => {
          if (item.type === "video") return (item as VideoItem).ytId === id;
          return (item as PlaylistChannel).ytPlaylistId === id;
        });

        if (!itemToRestore) return prev;

        return {
          ...prev,
          archivedItems: prev.archivedItems.filter((item) => {
            if (item.type === "video") return (item as VideoItem).ytId !== id;
            return (item as PlaylistChannel).ytPlaylistId !== id;
          }),
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
        archivedItems: prev.archivedItems.filter((item) => {
          if (item.type === "video") return (item as VideoItem).ytId !== id;
          return (item as PlaylistChannel).ytPlaylistId !== id;
        }),
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
        items: prev.items.map((item) => {
          const itemId = item.type === "video" ? (item as VideoItem).ytId : (item as PlaylistChannel).ytPlaylistId;
          return itemId === id ? { ...item, ...patch } : item;
        }),
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
        const isFinished = duration > 0 && position / duration > 0.95;
        const posToSave = isFinished ? 0 : Math.floor(position);

        return {
          ...prev,
          items: prev.items.map((item) => {
            if (item.type === "video" && (item as VideoItem).ytId === id) {
              return { ...item, lastPosition: posToSave };
            }
            return item;
          }),
        };
      });
    },
    [update]
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
        customTags: library.customTags,
        settings: library.settings,
        hydrated,
        addVideo,
        addPlaylistChannel,
        archiveItem,
        restoreItem,
        permanentlyDeleteItem,
        removeItem: archiveItem, // Backward compat
        addCustomTag,
        updateItem,
        updateSettings,
        updateVideoPosition,
        filteredItems,
        allTags,
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
