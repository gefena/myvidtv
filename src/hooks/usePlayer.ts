"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLibrary } from "@/contexts/LibraryContext";
import type { LibraryItem, VideoItem, PlaylistChannel } from "@/types/library";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        options: {
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

type YouTubePlayer = {
  loadVideoById: (args: string | { videoId: string; startSeconds?: number }) => void;
  cuePlaylist: (opts: { list: string; listType: string }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

export type PlayerMode = "watch" | "listen";

export function getItemId(item: LibraryItem): string {
  return item.type === "video"
    ? (item as VideoItem).ytId
    : (item as PlaylistChannel).ytPlaylistId;
}

export function usePlayer(
  queue: LibraryItem[],
  onAutoAdvance?: (item: LibraryItem) => void,
  initialMode: PlayerMode = "watch"
) {
  const { updateVideoPosition } = useLibrary();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // currentItemRef declared before initPlayer so the closure captures it correctly
  const currentItemRef = useRef<LibraryItem | null>(null);

  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [mode, setMode] = useState<PlayerMode>(initialMode);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const advanceQueue = useCallback(() => {
    const current = currentItemRef.current;
    if (!current) return;

    // Before advancing, mark current as finished
    if (current.type === "video") {
      updateVideoPosition((current as VideoItem).ytId, 0, 1); // 0 position, 1 duration -> effectively resets it
    }

    const currentId = getItemId(current);
    const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);
    const next = idx >= 0 ? (queueRef.current[idx + 1] ?? null) : null;
    if (next) {
      setCurrentItem(next);
      onAutoAdvance?.(next);
    }
  }, [onAutoAdvance, updateVideoPosition]);

  // Keep ref in sync with state
  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT) return;
    const existing = document.getElementById("yt-iframe-api");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "yt-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }, []);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, enablejsapi: 1 },
      events: {
        onReady: () => {},
        onStateChange: (event) => {
          const state = event.data;
          setPlaying(state === window.YT.PlayerState.PLAYING);

          if (state === window.YT.PlayerState.ENDED) {
            advanceQueue();
          }
        },
      },
    });
  }, [advanceQueue]);

  const saveCurrentProgress = useCallback(() => {
    const p = playerRef.current;
    const current = currentItemRef.current;
    if (!p || !current || current.type !== "video") return;

    try {
      const cur = p.getCurrentTime();
      const dur = p.getDuration();
      if (dur > 0) {
        updateVideoPosition((current as VideoItem).ytId, cur, dur);
        lastSaveTimeRef.current = Date.now();
      }
    } catch {
      // Ignored
    }
  }, [updateVideoPosition]);

  // Poll for progress every 500ms
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const cur = p.getCurrentTime();
        const dur = p.getDuration();
        if (dur > 0) {
          setProgress(cur / dur);

          // Periodic save every 10s
          const now = Date.now();
          if (now - lastSaveTimeRef.current > 10000) {
            saveCurrentProgress();
          }
        }
      } catch {
        // Player not ready yet
      }
    }, 500);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [saveCurrentProgress]);

  // When currentItem changes, load it into the player
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !currentItem) return;
    setTimeout(() => setProgress(0), 0);
    lastSaveTimeRef.current = Date.now();

    if (currentItem.type === "video") {
      const video = currentItem as VideoItem;
      p.loadVideoById({
        videoId: video.ytId,
        startSeconds: video.lastPosition || 0,
      });
    } else {
      p.cuePlaylist({
        list: (currentItem as PlaylistChannel).ytPlaylistId,
        listType: "playlist",
      });
      p.playVideo();
    }
  }, [currentItem]);

  const play = useCallback(
    (item: LibraryItem) => {
      saveCurrentProgress();
      if (!window.YT) {
        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
          setCurrentItem(item);
        };
        return;
      }
      if (!playerRef.current) initPlayer();
      setCurrentItem(item);
    },
    [initPlayer, saveCurrentProgress]
  );

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
    saveCurrentProgress();
  }, [saveCurrentProgress]);

  const resume = useCallback(() => playerRef.current?.playVideo(), []);

  const seek = useCallback((ratio: number) => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const dur = p.getDuration();
      if (dur > 0) p.seekTo(ratio * dur, true);
    } catch {
      // Player not ready
    }
  }, []);

  const skipNext = useCallback(() => {
    if (currentItem?.type === "video") {
      advanceQueue();
    } else {
      playerRef.current?.nextVideo();
    }
  }, [currentItem, advanceQueue]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "watch" ? "listen" : "watch"));
  }, []);

  return {
    containerRef,
    currentItem,
    playing,
    progress,
    mode,
    play,
    pause,
    resume,
    seek,
    skipNext,
    toggleMode,
    initPlayer,
  };
}
