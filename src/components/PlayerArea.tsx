"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLibrary } from "@/hooks/useLibrary";
import { usePlayer, getItemId } from "@/hooks/usePlayer";
import { useIsTouch } from "@/hooks/useLayout";
import { formatElapsedTime, formatPodcastDuration } from "@/lib/duration";
import type { Layout } from "@/hooks/useLayout";
import type { LibraryItem, PodcastEpisodeItem } from "@/types/library";

type PlayerAreaProps = {
  currentItem: LibraryItem | null;
  onItemEnd?: (next: LibraryItem) => void;
  onPlaceholderClick?: () => void;
  onEnded?: () => void;
  channelContext?: { channelId: string; title: string } | null;
  onOpenChannel?: () => void;
  layout?: Layout;
  backgroundInert?: boolean;
};

export function PlayerArea({ currentItem, onItemEnd, onPlaceholderClick, onEnded, channelContext, onOpenChannel, layout = "desktop", backgroundInert = false }: PlayerAreaProps) {
  const { items, updateSettings, settings } = useLibrary();
  const isTouch = useIsTouch();
  const listenBarRef = useRef<HTMLDivElement>(null);

  const {
    containerRef,
    audioRef,
    currentItem: playerCurrentItem,
    playing,
    audioError,
    audioDuration,
    audioCurrentTime,
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
  } = usePlayer(items, onItemEnd, settings.listenMode ? "listen" : "watch", settings.loopMode, onEnded);

  // Sync external currentItem into player — guard against re-firing during auto-advance
  useEffect(() => {
    if (currentItem && getItemId(currentItem) !== (playerCurrentItem ? getItemId(playerCurrentItem) : null)) {
      play(currentItem);
    }
  }, [currentItem, play, playerCurrentItem]);

  // Sync listen mode after Replace import — only fires when settings.listenMode changes externally
  useEffect(() => {
    if (mode !== (settings.listenMode ? "listen" : "watch")) toggleMode();
  }, [mode, settings.listenMode, toggleMode]);

  // Sync loop mode after Replace import — only fires when settings.loopMode changes externally
  useEffect(() => {
    if (loopMode !== settings.loopMode) setLoopMode(settings.loopMode);
  }, [loopMode, settings.loopMode, setLoopMode]);

  // Persist listenMode when toggled
  const handleToggleMode = () => {
    toggleMode();
    updateSettings({ listenMode: mode === "watch" });
  };

  // Init player when YT API ready
  useEffect(() => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
      prev?.();
    };
    if (window.YT) initPlayer();
  }, [initPlayer]);

  const isListen = mode === "listen";
  const displayItem = playerCurrentItem ?? currentItem;
  const hasDisplayItem = Boolean(displayItem);
  const isPodcastEpisode = displayItem?.type === "podcast-episode";
  const podcastDuration = isPodcastEpisode
    ? formatPodcastDuration((displayItem as PodcastEpisodeItem).duration) ?? formatPodcastDuration(audioDuration)
    : null;
  const podcastTimeDisplay = podcastDuration
    ? audioCurrentTime > 0
      ? `${formatElapsedTime(audioCurrentTime)} / ${podcastDuration}`
      : podcastDuration
    : null;

  // Measure the fixed phone listen bar height so the library sheet and peek bar stay clear
  useEffect(() => {
    const root = document.documentElement;
    if (!isListen || !hasDisplayItem || layout !== "phone") {
      root.style.setProperty("--phone-listen-bar-height", "0px");
      return;
    }

    const el = listenBarRef.current;
    if (!el) return;

    const updateHeight = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--phone-listen-bar-height", `${height}px`);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return () => {
        root.style.setProperty("--phone-listen-bar-height", "0px");
      };
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty("--phone-listen-bar-height", "0px");
    };
  }, [isListen, hasDisplayItem, layout]);

  const mobileTitleWrapStyle = {
    fontSize: "13px",
    color: "var(--text)",
    fontWeight: 500,
    lineHeight: 1.3,
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
  };

  const placeholderInner = (
    <>
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: "12px", opacity: 0.35, color: "var(--text-muted)" }}
      >
        <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="16" r="3.5" fill="#8b5cf6" />
      </svg>
      <span style={{ fontSize: "13px", letterSpacing: "0.05em" }}>
        Select something to watch
      </span>
    </>
  );

  const renderTransportControls = (opts: {
    largeTarget: boolean;
    compact: boolean;
    inListenBar: boolean;
  }) => (
    <>
      {canSeekFixedStep && (
        <ControlBtn
          onClick={seekBackward}
          label="Back 10 seconds"
          largeTarget={opts.largeTarget}
          isTouch={isTouch}
          compact={opts.compact}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            −10
          </span>
        </ControlBtn>
      )}
      <ControlBtn
        onClick={playing ? pause : resume}
        label={playing ? "Pause" : "Play"}
        primary
        largeTarget={opts.largeTarget}
        isTouch={isTouch}
        compact={opts.compact}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </ControlBtn>
      {canSeekFixedStep && (
        <ControlBtn
          onClick={seekForward}
          label="Forward 10 seconds"
          largeTarget={opts.largeTarget}
          isTouch={isTouch}
          compact={opts.compact}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            +10
          </span>
        </ControlBtn>
      )}
      <ControlBtn
        onClick={skipNext}
        label="Skip"
        largeTarget={opts.largeTarget}
        isTouch={isTouch}
        compact={opts.compact}
      >
        <SkipNextIcon />
      </ControlBtn>
      <ControlBtn
        onClick={toggleLoop}
        label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
        active={loopMode !== "off"}
        largeTarget={opts.largeTarget}
        isTouch={isTouch}
        compact={opts.compact}
      >
        <LoopIcon mode={loopMode} />
      </ControlBtn>
      <ControlBtn
        onClick={handleToggleMode}
        label={opts.inListenBar ? "Watch" : isListen ? "Watch" : "Listen"}
        active={opts.inListenBar ? true : isListen}
        largeTarget={opts.largeTarget}
        isTouch={isTouch}
        compact={opts.compact}
      >
        {opts.inListenBar || isListen ? <WatchIcon /> : <ListenIcon />}
      </ControlBtn>
    </>
  );

  const renderPodcastSubtitle = (testId: string, className?: string) => {
    const episode = displayItem as PodcastEpisodeItem;
    return (
      <div
        className={className}
        data-testid={testId}
        style={className ? undefined : { fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        <span>{episode.podcastTitle}</span>
        {podcastTimeDisplay && (
          <span data-testid="player-podcast-duration" style={{ fontVariantNumeric: "tabular-nums" }}>
            {" · "}{podcastTimeDisplay}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg)",
      }}
    >
      {/* YouTube IFrame container — phone/tablet: capped 16:9 or flex in landscape; desktop: flex height */}
      <div
        data-testid="player-video-stage"
        inert={backgroundInert}
        className={
          isListen || layout === "desktop"
            ? undefined
            : layout === "phone"
            ? "player-video-stage-phone"
            : "player-video-stage-tablet"
        }
        style={
          layout === "desktop"
            ? {
                flex: isListen && !hasDisplayItem ? "0 0 0" : "1",
                overflow: "hidden",
                transition: "flex 0.3s ease",
                position: "relative",
                background: isListen && hasDisplayItem ? "var(--bg)" : "#000",
              }
            : isListen && hasDisplayItem && layout === "phone"
            ? {
                width: "100%",
                flex: "1",
                minHeight: 0,
                overflow: "hidden",
                position: "relative",
                background: "var(--bg)",
              }
            : isListen
            ? {
                width: "100%",
                flex: "0 0 0",
                overflow: "hidden",
                position: "relative",
                background: "#000",
                flexShrink: 0,
              }
            : {
                overflow: "hidden",
                position: "relative",
                background: "#000",
              }
        }
      >
        {/* Keep #yt-player mounted and sized:
            - Listen mode (YouTube audio-only): opacity:0 + pointer-events:none (never visibility:hidden so mobile browsers don't throttle audio)
            - Podcast mode: visibility:hidden + opacity:0 + behind opaque podcast-stage (never display:none so the iframe stays sized when switching back to video) */}
        <div
          data-testid="yt-player-wrapper"
          className="player-stage-inner"
          style={{
            visibility: isPodcastEpisode ? "hidden" : "visible",
            opacity: isListen || isPodcastEpisode ? 0 : 1,
            pointerEvents: isListen || isPodcastEpisode ? "none" : "auto",
            zIndex: isListen || isPodcastEpisode ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <div className="player-yt-frame">
            <div
              ref={containerRef}
              id="yt-player"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
        <audio ref={audioRef} preload="metadata" />

        {isPodcastEpisode && !isListen && (
          <div
            data-testid="podcast-stage"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, #161022 0%, #0b0712 100%)",
              padding: layout === "phone" ? "12px" : "24px",
              gap: layout === "phone" ? "8px" : "14px",
            }}
          >
            <PodcastArtwork item={displayItem as PodcastEpisodeItem} size={layout === "phone" ? 132 : 260} />
            {audioError && (
              <div
                role="alert"
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  textAlign: "center",
                  maxWidth: "360px",
                  lineHeight: 1.4,
                }}
              >
                {audioError}
              </div>
            )}
          </div>
        )}

        {isListen && displayItem && layout !== "tablet" && (
          <div
            data-testid="listen-stage"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg)",
              padding: layout === "phone" ? "16px 24px" : "24px 32px 84px",
              gap: layout === "phone" ? "12px" : "16px",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <ListenArtwork item={displayItem} compact={layout === "phone"} />
            <div style={{ maxWidth: "420px", width: "100%", minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--violet-soft)",
                  background: "var(--violet-glow)",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  marginBottom: "8px",
                }}
              >
                <span aria-hidden="true">♪</span>
                <span>Audio mode</span>
              </div>
              <div
                data-testid="listen-stage-title"
                style={{
                  fontSize: layout === "phone" ? "15px" : "18px",
                  fontWeight: 600,
                  color: "var(--text)",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                  marginBottom: "4px",
                }}
              >
                {displayItem.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {displayItem.type === "podcast-episode"
                  ? `${displayItem.podcastTitle}${podcastTimeDisplay ? ` · ${podcastTimeDisplay}` : ""}`
                  : "channelName" in displayItem
                  ? displayItem.channelName
                  : ""}
              </div>
            </div>
            {isPodcastEpisode && audioError && (
              <div
                role="alert"
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  textAlign: "center",
                  maxWidth: "360px",
                  lineHeight: 1.4,
                }}
              >
                {audioError}
              </div>
            )}
          </div>
        )}

        {/* Placeholder when nothing is playing */}
        {!displayItem && (
          onPlaceholderClick ? (
            <button
              onClick={onPlaceholderClick}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={isTouch ? undefined : (e) => {
                const svg = e.currentTarget.querySelector("svg") as SVGElement | null;
                if (svg) svg.style.opacity = "0.65";
                e.currentTarget.style.boxShadow = "inset 0 0 60px var(--violet-glow)";
              }}
              onMouseLeave={isTouch ? undefined : (e) => {
                const svg = e.currentTarget.querySelector("svg") as SVGElement | null;
                if (svg) svg.style.opacity = "0.35";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {placeholderInner}
            </button>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              {placeholderInner}
            </div>
          )
        )}
      </div>

      {/* Now-playing bar */}
      {displayItem && !isListen && (
        <div
          inert={backgroundInert}
          style={{
            background: "var(--surface-3)",
            borderTop: "2px solid var(--border-hi)",
            flexShrink: 0,
          }}
        >
          {/* Progress bar — touch-target wrapper expands hit area on phone */}
          <div
            className={layout === "phone" ? "phone-progress-wrap" : undefined}
            style={{
              padding: layout === "phone" ? undefined : "0",
              cursor: "pointer",
              background: "transparent",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio);
            }}
          >
            <div style={{ height: "2px", background: "var(--border)" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: "var(--violet)",
                  transition: "width 0.5s linear",
                }}
              />
            </div>
          </div>

          {/* Phone: two-row layout (compacts to single row in short landscape) */}
          {layout === "phone" ? (
            <div className="phone-now-playing">
              <div className="phone-now-playing-meta">
                <NowPlayingThumbnail item={displayItem} width={44} height={displayItem.type === "podcast-episode" ? 44 : 25} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="phone-title-wrap" style={mobileTitleWrapStyle}>
                    {displayItem.title}
                  </div>
                  {displayItem.type === "podcast-episode" ? (
                    renderPodcastSubtitle("now-playing-subtitle", "phone-now-playing-sub")
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button onClick={onOpenChannel} className="phone-now-playing-sub" data-testid="now-playing-subtitle" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", maxWidth: "100%", display: "block" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div className="phone-now-playing-sub" data-testid="now-playing-subtitle">{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div className="phone-now-playing-controls">
                {renderTransportControls({ largeTarget: true, compact: true, inListenBar: false })}
              </div>
            </div>
          ) : (
            /* Tablet + desktop: single-row layout (wraps cleanly on narrow tablet landscape) */
            <div
              style={
                layout === "tablet"
                  ? { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", padding: "8px 12px" }
                  : { display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px" }
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: layout === "tablet" ? "10px" : "12px", flex: layout === "tablet" ? "1 1 180px" : "1", minWidth: 0 }}>
                <NowPlayingThumbnail item={displayItem} width={48} height={displayItem.type === "podcast-episode" ? 48 : 27} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayItem.title}
                  </div>
                  {displayItem.type === "podcast-episode" ? (
                    renderPodcastSubtitle("now-playing-subtitle")
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button onClick={onOpenChannel} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", color: "var(--text-dim)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: layout === "tablet" && isTouch ? "4px" : "8px", flexShrink: 0, ...(layout === "tablet" && { marginLeft: "auto" }) }}>
                {renderTransportControls({ largeTarget: isTouch, compact: layout === "tablet" && isTouch, inListenBar: false })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mini listen bar — shown when in listen mode and something is playing */}
      {/* Tablet: in-flow (library stays visible). Phone/desktop: fixed overlay. */}
      {isListen && displayItem && (
        <div
          ref={listenBarRef}
          style={layout === "tablet" ? {
            background: "var(--surface)",
            borderTop: "1px solid var(--violet)",
            flexShrink: 0,
          } : {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--surface)",
            borderTop: "1px solid var(--violet)",
            zIndex: 150,
          }}
        >
          {/* Progress bar — touch-target wrapper on phone */}
          {(displayItem.type === "video" || displayItem.type === "podcast-episode") && (
            <div
              className={layout === "phone" ? "phone-progress-wrap" : undefined}
              style={{
                padding: layout === "phone" ? undefined : "0",
                cursor: "pointer",
                background: "transparent",
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
            >
              <div style={{ height: "2px", background: "var(--border)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress * 100}%`,
                    background: "var(--violet)",
                    transition: "width 0.5s linear",
                  }}
                />
              </div>
            </div>
          )}

          {/* Phone: two-row layout — metadata row then actions row */}
          {layout === "phone" ? (
            <div
              style={{
                padding: "8px 12px",
                paddingLeft: "max(12px, env(safe-area-inset-left, 0px))",
                paddingRight: "max(12px, env(safe-area-inset-right, 0px))",
                paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <span aria-hidden="true" style={{ color: "var(--violet-soft)", fontSize: "14px", lineHeight: 1, marginTop: "2px" }}>♪</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="phone-title-wrap" style={{ ...mobileTitleWrapStyle, fontWeight: 400 }}>
                    {displayItem.title}
                  </div>
                  {displayItem.type === "podcast-episode" ? (
                    renderPodcastSubtitle("listen-bar-subtitle")
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button data-testid="listen-bar-subtitle" onClick={onOpenChannel} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", color: "var(--text-dim)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div data-testid="listen-bar-subtitle" style={{ fontSize: "11px", color: "var(--text-dim)" }}>{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "nowrap" }}>
                {renderTransportControls({ largeTarget: true, compact: true, inListenBar: true })}
              </div>
            </div>
          ) : (
            /* Tablet + desktop: single-row layout (wraps cleanly on narrow tablet landscape) */
            <div
              style={
                layout === "tablet"
                  ? { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", padding: "8px 12px" }
                  : { display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px" }
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: layout === "tablet" ? "10px" : "12px", flex: layout === "tablet" ? "1 1 180px" : "1", minWidth: 0 }}>
                <span aria-hidden="true" style={{ color: "var(--violet-soft)", fontSize: "16px", flexShrink: 0 }}>♪</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayItem.title}
                  </div>
                  {displayItem.type === "podcast-episode" ? (
                    renderPodcastSubtitle("listen-bar-subtitle")
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button onClick={onOpenChannel} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", color: "var(--text-dim)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: layout === "tablet" && isTouch ? "4px" : "8px", flexShrink: 0, ...(layout === "tablet" && { marginLeft: "auto" }) }}>
                {renderTransportControls({ largeTarget: isTouch, compact: layout === "tablet" && isTouch, inListenBar: true })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ transform: "translateX(1px)" }}>
      <path d="M7.5 5.25a1 1 0 0 1 1.52-.85l10.2 6.75a1 1 0 0 1 0 1.7L9.02 19.6A1 1 0 0 1 7.5 18.75V5.25Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

function SkipNextIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 6.1a1 1 0 0 1 1.54-.84l7.96 5.4a1 1 0 0 1 0 1.66l-7.96 5.4a1 1 0 0 1-1.54-.83V6.1Z" />
      <rect x="16.5" y="5.5" width="2.5" height="13" rx="1" />
    </svg>
  );
}

function LoopIcon({ mode }: { mode: "off" | "one" | "all" }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.5 20.5 6 17 9.5" />
        <path d="M3.5 11.5v-1a4.5 4.5 0 0 1 4.5-4.5h12.5" />
        <path d="M7 21.5 3.5 18 7 14.5" />
        <path d="M20.5 12.5v1a4.5 4.5 0 0 1-4.5 4.5H3.5" />
      </svg>
      {mode !== "off" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            fontSize: "8px",
            fontWeight: 700,
            lineHeight: 1,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {mode === "one" ? "1" : "∞"}
        </span>
      )}
    </span>
  );
}

function ListenIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="7" rx="1.5" />
      <rect x="17" y="13" width="4" height="7" rx="1.5" />
    </svg>
  );
}

function WatchIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function NowPlayingThumbnail({ item, width, height }: { item: LibraryItem; width: number; height: number }) {
  const thumbnail = item.thumbnail;
  if (!thumbnail) return null;

  return (
    <div style={{ position: "relative", width, height, borderRadius: "3px", overflow: "hidden", flexShrink: 0, marginTop: "2px", background: "var(--border)" }}>
      {item.type === "podcast-episode" || item.type === "podcast" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Image src={thumbnail} alt={item.title} fill sizes={`${width}px`} style={{ objectFit: "cover" }} />
      )}
    </div>
  );
}

function PodcastArtwork({ item, size }: { item: PodcastEpisodeItem; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1 / 1",
        borderRadius: "8px",
        overflow: "hidden",
        background: "var(--surface-2)",
        boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
      }}
    >
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnail} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "42px" }}>
          ♪
        </div>
      )}
    </div>
  );
}

function ListenArtwork({ item, compact }: { item: LibraryItem; compact: boolean }) {
  const isSquare = item.type === "podcast-episode" || item.type === "podcast";
  const thumbnail = item.thumbnail;

  return (
    <div
      style={{
        position: "relative",
        width: isSquare ? (compact ? "min(168px, 46vw)" : "220px") : (compact ? "min(256px, 76vw)" : "320px"),
        aspectRatio: isSquare ? "1 / 1" : "16 / 9",
        maxHeight: compact ? "34dvh" : "38dvh",
        borderRadius: "10px",
        overflow: "hidden",
        background: "var(--surface-2)",
        border: "1px solid var(--border-hi)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
        flexShrink: 0,
      }}
    >
      {thumbnail ? (
        isSquare ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Image src={thumbnail} alt={item.title} fill sizes={compact ? "256px" : "320px"} style={{ objectFit: "cover" }} />
        )
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet-soft)", fontSize: "42px" }}>
          ♪
        </div>
      )}
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  label,
  active,
  primary,
  dim,
  largeTarget,
  isTouch,
  compact,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  primary?: boolean;
  dim?: boolean;
  largeTarget?: boolean;
  isTouch?: boolean;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const primarySize = largeTarget ? "44px" : "36px";
  const background = primary
    ? hovered
      ? "var(--play-btn-hover)"
      : "var(--play-btn-bg)"
    : active
    ? "var(--violet-glow)"
    : hovered
    ? "var(--chip)"
    : "transparent";

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        background,
        border: "none",
        borderRadius: primary ? "9999px" : "6px",
        color: primary ? "#ffffff" : active ? "var(--violet-soft)" : "var(--text)",
        cursor: "pointer",
        fontSize: largeTarget ? "18px" : "15px",
        opacity: dim ? 0.45 : 1,
        padding: primary ? 0 : largeTarget ? (compact ? "10px 6px" : "12px 14px") : "6px 8px",
        transition: "color 0.15s, opacity 0.15s, background-color 0.15s, transform 0.12s",
        width: primary ? primarySize : undefined,
        height: primary ? primarySize : undefined,
        minWidth: primary ? primarySize : largeTarget ? "44px" : "34px",
        minHeight: primary ? primarySize : largeTarget ? "44px" : "34px",
        boxShadow: primary ? "0 2px 10px var(--violet-glow)" : undefined,
        whiteSpace: "nowrap",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={isTouch ? undefined : () => setHovered(true)}
      onMouseLeave={isTouch ? undefined : () => setHovered(false)}
    >
      {children}
    </button>
  );
}
