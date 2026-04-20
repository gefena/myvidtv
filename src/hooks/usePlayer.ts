"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLibrary } from "@/contexts/LibraryContext";
import type { LibraryItem, VideoItem, PlaylistChannel, ChannelItem, LoopMode } from "@/types/library";

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
  if (item.type === "video") return (item as VideoItem).ytId;
  if (item.type === "playlist-channel") return (item as PlaylistChannel).ytPlaylistId;
  return (item as ChannelItem).channelId;
}

export function usePlayer(
  queue: LibraryItem[],
  onAutoAdvance?: (item: LibraryItem) => void,
  initialMode: PlayerMode = "watch",
  initialLoopMode: LoopMode = "off",
  onEnded?: () => void
) {
  const { updateVideoPosition, updateSettings } = useLibrary();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  // currentItemRef declared before initPlayer so the closure captures it correctly
  const currentItemRef = useRef<LibraryItem | null>(null);

  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [mode, setMode] = useState<PlayerMode>(initialMode);
  const [loopMode, setLoopMode] = useState<LoopMode>(initialLoopMode);
  const loopModeRef = useRef<LoopMode>(initialLoopMode);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const queueRef = useRef(queue);

  const resetProgressForItem = useCallback(() => {
    setProgress(0);
    lastSaveTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Keep loopModeRef in sync with state (avoids stale closure in onStateChange)
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  const handleEnded = useCallback(() => {
    const current = currentItemRef.current;
    if (!current) return;

    const loop = loopModeRef.current;

    // playlist-channel: advance with loop-all support (loop-one not applicable)
    if (current.type !== "video") {
      const currentId = getItemId(current);
      const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);
      let next: LibraryItem | null;
      if (loop === "all" && queueRef.current.length > 0) {
        next = queueRef.current[(idx + 1) % queueRef.current.length];
      } else {
        next = idx >= 0 ? (queueRef.current[idx + 1] ?? null) : null;
      }
      if (next) {
        resetProgressForItem();
        setCurrentItem(next);
        onAutoAdvance?.(next);
      }
      return;
    }

    // loop-one: restart current video without saving position
    if (loop === "one") {
      playerRef.current?.loadVideoById({
        videoId: (current as VideoItem).ytId,
        startSeconds: 0,
      });
      return;
    }

    // Mark current as finished before advancing
    updateVideoPosition((current as VideoItem).ytId, 0, 1);

    const currentId = getItemId(current);
    const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);

    if (loop === "all" && queueRef.current.length > 0) {
      // Wrap around to first item
      const nextIdx = (idx + 1) % queueRef.current.length;
      const next = queueRef.current[nextIdx];
      resetProgressForItem();
      setCurrentItem(next);
      onAutoAdvance?.(next);
    } else {
      // off: advance or stop
      const next = idx >= 0 ? (queueRef.current[idx + 1] ?? null) : null;
      if (next) {
        resetProgressForItem();
        setCurrentItem(next);
        onAutoAdvance?.(next);
      }
    }
  }, [onAutoAdvance, resetProgressForItem, updateVideoPosition]);

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
            handleEnded();
            onEndedRef.current?.();
          }
        },
      },
    });
  }, [handleEnded]);

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

    if (currentItem.type === "video") {
      const video = currentItem as VideoItem;
      p.loadVideoById({
        videoId: video.ytId,
        startSeconds: video.lastPosition || 0,
      });
    } else if (currentItem.type === "playlist-channel") {
      p.cuePlaylist({
        list: (currentItem as PlaylistChannel).ytPlaylistId,
        listType: "playlist",
      });
      p.playVideo();
    }
    // ChannelItem: not directly playable — opened via browse modal
  }, [currentItem]);

  const play = useCallback(
    (item: LibraryItem) => {
      saveCurrentProgress();
      if (!window.YT) {
        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
          resetProgressForItem();
          setCurrentItem(item);
        };
        return;
      }
      if (!playerRef.current) initPlayer();
      resetProgressForItem();
      setCurrentItem(item);
    },
    [initPlayer, resetProgressForItem, saveCurrentProgress]
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
    if (currentItem?.type !== "video") {
      playerRef.current?.nextVideo();
      return;
    }
    // Skip always advances — never restarts (loop-one only applies on natural ENDED)
    updateVideoPosition((currentItem as VideoItem).ytId, 0, 1);
    const currentId = getItemId(currentItem);
    const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);
    const loop = loopModeRef.current;
    if (loop === "all" && queueRef.current.length > 0) {
      const next = queueRef.current[(idx + 1) % queueRef.current.length];
      resetProgressForItem();
      setCurrentItem(next);
      onAutoAdvance?.(next);
    } else {
      const next = idx >= 0 ? (queueRef.current[idx + 1] ?? null) : null;
      if (next) {
        resetProgressForItem();
        setCurrentItem(next);
        onAutoAdvance?.(next);
      }
    }
  }, [currentItem, onAutoAdvance, resetProgressForItem, updateVideoPosition]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "watch" ? "listen" : "watch"));
  }, []);

  const toggleLoop = useCallback(() => {
    setLoopMode((prev) => {
      const next: LoopMode = prev === "off" ? "one" : prev === "one" ? "all" : "off";
      updateSettings({ loopMode: next });
      return next;
    });
  }, [updateSettings]);

  return {
    containerRef,
    currentItem,
    playing,
    progress,
    mode,
    loopMode,
    play,
    pause,
    resume,
    seek,
    skipNext,
    toggleMode,
    toggleLoop,
    initPlayer,
  };
}
