"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLibrary } from "@/contexts/LibraryContext";
import { getLibraryItemId } from "@/lib/mediaItems";
import type { LibraryItem, VideoItem, PlaylistChannel, PodcastEpisodeItem, LoopMode } from "@/types/library";

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

function isYouTubePlayerReady(player: YouTubePlayer | null): player is YouTubePlayer {
  return Boolean(
    player &&
      typeof player.loadVideoById === "function" &&
      typeof player.cuePlaylist === "function" &&
      typeof player.playVideo === "function" &&
      typeof player.pauseVideo === "function"
  );
}

function canCreateYouTubePlayer(): boolean {
  return typeof window.YT?.Player === "function";
}

export type PlayerMode = "watch" | "listen";

export function getItemId(item: LibraryItem): string {
  return getLibraryItemId(item);
}

export function usePlayer(
  queue: LibraryItem[],
  onAutoAdvance?: (item: LibraryItem) => void,
  initialMode: PlayerMode = "watch",
  initialLoopMode: LoopMode = "off",
  onEnded?: () => void
) {
  const { updateSettings, updateWatchProgress, getWatchHistoryEntry } = useLibrary();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  // currentItemRef declared before initPlayer so the closure captures it correctly
  const currentItemRef = useRef<LibraryItem | null>(null);

  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [mode, setMode] = useState<PlayerMode>(initialMode);
  const [loopMode, setLoopModeState] = useState<LoopMode>(initialLoopMode);
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

    if (current.type === "podcast-episode") {
      const episode = current as PodcastEpisodeItem;
      updateWatchProgress({
        mediaType: "podcast",
        ytId: episode.episodeId,
        title: episode.title,
        channelName: episode.podcastTitle,
        thumbnail: episode.thumbnail,
        position: 1,
        duration: 1,
        source: episode.watchSource ?? { type: "podcast", feedUrl: episode.podcastFeedUrl, audioUrl: episode.audioUrl },
      });
      setPlaying(false);
      return;
    }

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
    const finishedVideo = current as VideoItem;
    updateWatchProgress({
      ytId: finishedVideo.ytId,
      title: finishedVideo.title,
      channelName: finishedVideo.channelName,
      thumbnail: finishedVideo.thumbnail,
      position: 1,
      duration: 1,
      source: finishedVideo.watchSource ?? (finishedVideo.addedAt > 0 ? { type: "library" } : { type: "unknown" }),
    });

    const currentId = getItemId(current);
    const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);

    if (loop === "all" && queueRef.current.length > 0) {
      if (idx < 0) return;
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
  }, [onAutoAdvance, resetProgressForItem, updateWatchProgress]);

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
    if (!containerRef.current || playerRef.current || !canCreateYouTubePlayer()) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, enablejsapi: 1 },
      events: {
        onReady: () => setYoutubeReady(true),
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleAudioError = () => {
      setPlaying(false);
      setAudioError("Could not play podcast audio. Check the episode source and try again.");
    };
    const handleAudioEnded = () => {
      handleEnded();
      onEndedRef.current?.();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleAudioError);
    audio.addEventListener("ended", handleAudioEnded);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleAudioError);
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, [handleEnded]);

  const saveCurrentProgress = useCallback(() => {
    const current = currentItemRef.current;
    if (!current) return;

    if (current.type === "podcast-episode") {
      const audio = audioRef.current;
      if (!audio || audio.duration <= 0) return;
      const episode = current as PodcastEpisodeItem;
      updateWatchProgress({
        mediaType: "podcast",
        ytId: episode.episodeId,
        title: episode.title,
        channelName: episode.podcastTitle,
        thumbnail: episode.thumbnail,
        position: audio.currentTime,
        duration: audio.duration,
        source: episode.watchSource ?? { type: "podcast", feedUrl: episode.podcastFeedUrl, audioUrl: episode.audioUrl },
      });
      lastSaveTimeRef.current = Date.now();
      return;
    }

    const p = playerRef.current;
    if (!p || current.type !== "video") return;

    try {
      const cur = p.getCurrentTime();
      const dur = p.getDuration();
      if (dur > 0) {
        const video = current as VideoItem;
        updateWatchProgress({
          ytId: video.ytId,
          title: video.title,
          channelName: video.channelName,
          thumbnail: video.thumbnail,
          position: cur,
          duration: dur,
          source: video.watchSource ?? (video.addedAt > 0 ? { type: "library" } : { type: "unknown" }),
        });
        lastSaveTimeRef.current = Date.now();
      }
    } catch {
      // Ignored
    }
  }, [updateWatchProgress]);

  // Poll for progress every 500ms
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      const p = playerRef.current;
      const current = currentItemRef.current;
      if (current?.type === "podcast-episode") {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.duration > 0) {
          setProgress(audio.currentTime / audio.duration);

          const now = Date.now();
          if (now - lastSaveTimeRef.current > 10000) {
            saveCurrentProgress();
          }
        }
        return;
      }
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
    if (!currentItem) return;

    if (currentItem.type === "video") {
      if (!isYouTubePlayerReady(p) || !youtubeReady) {
        if (!p && canCreateYouTubePlayer()) initPlayer();
        return;
      }
      audioRef.current?.pause();
      const video = currentItem as VideoItem;
      const startSeconds = video.lastPosition ?? 0;
      updateWatchProgress({
        ytId: video.ytId,
        title: video.title,
        channelName: video.channelName,
        thumbnail: video.thumbnail,
        position: startSeconds,
        duration: 0,
        lastWatchedRatio: video.lastWatchedRatio,
        preferInputProgress: true,
        source: video.watchSource ?? (video.addedAt > 0 ? { type: "library" } : { type: "unknown" }),
      });
      p.loadVideoById({
        videoId: video.ytId,
        startSeconds,
      });
    } else if (currentItem.type === "playlist-channel") {
      if (!isYouTubePlayerReady(p) || !youtubeReady) {
        if (!p && canCreateYouTubePlayer()) initPlayer();
        return;
      }
      audioRef.current?.pause();
      p.cuePlaylist({
        list: (currentItem as PlaylistChannel).ytPlaylistId,
        listType: "playlist",
      });
      p.playVideo();
    } else if (currentItem.type === "podcast-episode") {
      const episode = currentItem as PodcastEpisodeItem;
      const audio = audioRef.current;
      if (!audio) return;
      if (typeof playerRef.current?.pauseVideo === "function") playerRef.current.pauseVideo();
      audio.src = episode.audioUrl;
      audio.currentTime = episode.lastPosition ?? 0;
      updateWatchProgress({
        mediaType: "podcast",
        ytId: episode.episodeId,
        title: episode.title,
        channelName: episode.podcastTitle,
        thumbnail: episode.thumbnail,
        position: episode.lastPosition ?? 0,
        duration: 0,
        lastWatchedRatio: episode.lastWatchedRatio,
        preferInputProgress: true,
        source: episode.watchSource ?? { type: "podcast", feedUrl: episode.podcastFeedUrl, audioUrl: episode.audioUrl },
      });
      void audio.play().catch(() => setPlaying(false));
    }
    // ChannelItem and PodcastItem are not directly playable — opened via browse modals.
  }, [currentItem, initPlayer, updateWatchProgress, youtubeReady]);

  const play = useCallback(
    (item: LibraryItem) => {
      saveCurrentProgress();
      setAudioError(null);
      const historyEntry =
        item.type === "video"
          ? getWatchHistoryEntry((item as VideoItem).ytId)
          : item.type === "podcast-episode"
          ? getWatchHistoryEntry((item as PodcastEpisodeItem).episodeId, "podcast")
          : undefined;
      const itemToPlay =
        item.type === "video" && typeof (item as VideoItem).lastPosition !== "number"
          ? {
              ...(item as VideoItem),
              lastPosition: historyEntry?.lastPosition,
              lastWatchedRatio: historyEntry?.lastWatchedRatio,
            }
          : item.type === "podcast-episode" && typeof (item as PodcastEpisodeItem).lastPosition !== "number"
          ? {
              ...(item as PodcastEpisodeItem),
              lastPosition: historyEntry?.lastPosition,
              lastWatchedRatio: historyEntry?.lastWatchedRatio,
            }
          : item;
      if (itemToPlay.type === "podcast-episode") {
        resetProgressForItem();
        setCurrentItem(itemToPlay);
        return;
      }
      if (!canCreateYouTubePlayer()) {
        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
          resetProgressForItem();
          setCurrentItem(itemToPlay);
        };
        return;
      }
      if (!playerRef.current) initPlayer();
      resetProgressForItem();
      setCurrentItem(itemToPlay);
    },
    [getWatchHistoryEntry, initPlayer, resetProgressForItem, saveCurrentProgress]
  );

  const pause = useCallback(() => {
    if (currentItemRef.current?.type === "podcast-episode") {
      audioRef.current?.pause();
      setPlaying(false);
      saveCurrentProgress();
      return;
    }
    playerRef.current?.pauseVideo();
    saveCurrentProgress();
  }, [saveCurrentProgress]);

  const resume = useCallback(() => {
    if (currentItemRef.current?.type === "podcast-episode") {
      void audioRef.current?.play().catch(() => setPlaying(false));
      return;
    }
    playerRef.current?.playVideo();
  }, []);

  const seek = useCallback((ratio: number) => {
    if (currentItemRef.current?.type === "podcast-episode") {
      const audio = audioRef.current;
      if (!audio || audio.duration <= 0) return;
      audio.currentTime = ratio * audio.duration;
      setProgress(ratio);
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    try {
      const dur = p.getDuration();
      if (dur > 0) p.seekTo(ratio * dur, true);
    } catch {
      // Player not ready
    }
  }, []);

  const seekBackward = useCallback(() => {
    if (currentItemRef.current?.type === "podcast-episode") {
      const audio = audioRef.current;
      if (!audio || audio.duration <= 0) return;
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    try {
      const cur = p.getCurrentTime();
      const dur = p.getDuration();
      if (dur > 0) p.seekTo(Math.max(0, cur - 10), true);
    } catch {
      // Player not ready
    }
  }, []);

  const seekForward = useCallback(() => {
    if (currentItemRef.current?.type === "podcast-episode") {
      const audio = audioRef.current;
      if (!audio || audio.duration <= 0) return;
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    try {
      const cur = p.getCurrentTime();
      const dur = p.getDuration();
      if (dur > 0) p.seekTo(Math.min(dur, cur + 10), true);
    } catch {
      // Player not ready
    }
  }, []);

  const skipNext = useCallback(() => {
    if (currentItem?.type === "podcast-episode") return;
    if (currentItem?.type !== "video") {
      playerRef.current?.nextVideo();
      return;
    }
    // Skip always advances — never restarts (loop-one only applies on natural ENDED)
    saveCurrentProgress();
    const currentId = getItemId(currentItem);
    const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);
    const loop = loopModeRef.current;
    if (loop === "all" && queueRef.current.length > 0) {
      if (idx < 0) return;
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
  }, [currentItem, onAutoAdvance, resetProgressForItem, saveCurrentProgress]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "watch" ? "listen" : "watch"));
  }, []);

  const setLoopMode = useCallback((next: LoopMode) => {
    setLoopModeState(next);
    updateSettings({ loopMode: next });
  }, [updateSettings]);

  const toggleLoop = useCallback(() => {
    const next: LoopMode = loopModeRef.current === "off" ? "one" : loopModeRef.current === "one" ? "all" : "off";
    setLoopMode(next);
  }, [setLoopMode]);

  const canSeekFixedStep = currentItem?.type === "video" || currentItem?.type === "podcast-episode";

  return {
    containerRef,
    audioRef,
    currentItem,
    playing,
    audioError,
    progress,
    mode,
    loopMode,
    canSeekFixedStep,
    play,
    pause,
    resume,
    seek,
    seekBackward,
    seekForward,
    skipNext,
    toggleMode,
    toggleLoop,
    setLoopMode,
    initPlayer,
  };
}
