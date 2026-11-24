"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLibrary } from "@/hooks/useLibrary";
import { usePlayer, getItemId } from "@/hooks/usePlayer";
import { useIsTouch } from "@/hooks/useLayout";
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
                flex: isListen ? "0 0 0" : "1",
                overflow: "hidden",
                transition: "flex 0.3s ease",
                position: "relative",
                background: "#000",
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
        <div className="player-stage-inner">
          <div className="player-yt-frame">
            <div
              ref={containerRef}
              id="yt-player"
              style={{
                width: "100%",
                height: "100%",
                opacity: isListen || isPodcastEpisode ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>
        <audio ref={audioRef} preload="metadata" />

        {isPodcastEpisode && !isListen && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, rgba(0,0,0,0.86), rgba(0,0,0,0.94))",
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
                    <div className="phone-now-playing-sub" data-testid="now-playing-subtitle">{displayItem.podcastTitle}</div>
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
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekBackward} label="Back 10 seconds" largeTarget isTouch={isTouch} compact>−10</ControlBtn>
                )}
                <ControlBtn onClick={playing ? pause : resume} label={playing ? "Pause" : "Play"} largeTarget isTouch={isTouch} compact>
                  {playing ? "⏸" : "▶"}
                </ControlBtn>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekForward} label="Forward 10 seconds" largeTarget isTouch={isTouch} compact>+10</ControlBtn>
                )}
                <ControlBtn onClick={skipNext} label="Skip" largeTarget isTouch={isTouch} compact>⏭</ControlBtn>
                <ControlBtn
                  onClick={toggleLoop}
                  label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                  active={loopMode !== "off"}
                  largeTarget
                  isTouch={isTouch}
                  compact
                >
                  {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
                </ControlBtn>
                <ControlBtn onClick={handleToggleMode} label={isListen ? "Watch" : "Listen"} active={isListen} largeTarget isTouch={isTouch} compact>
                  {isListen ? "👁" : "♪"}
                </ControlBtn>
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
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{displayItem.podcastTitle}</div>
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button onClick={onOpenChannel} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: layout === "tablet" && isTouch ? "4px" : "6px", flexShrink: 0, ...(layout === "tablet" && { marginLeft: "auto" }) }}>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekBackward} label="Back 10 seconds" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>−10</ControlBtn>
                )}
                <ControlBtn onClick={playing ? pause : resume} label={playing ? "Pause" : "Play"} largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>
                  {playing ? "⏸" : "▶"}
                </ControlBtn>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekForward} label="Forward 10 seconds" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>+10</ControlBtn>
                )}
                <ControlBtn onClick={skipNext} label="Skip" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>⏭</ControlBtn>
                <ControlBtn
                  onClick={toggleLoop}
                  label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                  active={loopMode !== "off"}
                  largeTarget={isTouch}
                  isTouch={isTouch}
                  compact={layout === "tablet" && isTouch}
                >
                  {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
                </ControlBtn>
                <ControlBtn onClick={handleToggleMode} label={isListen ? "Watch" : "Listen"} active={isListen} largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>
                  {isListen ? "👁" : "♪"}
                </ControlBtn>
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
                    <div data-testid="listen-bar-subtitle" style={{ fontSize: "11px", color: "var(--text-dim)" }}>{displayItem.podcastTitle}</div>
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
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekBackward} label="Back 10 seconds" largeTarget isTouch={isTouch} compact>−10</ControlBtn>
                )}
                <ControlBtn onClick={playing ? pause : resume} label={playing ? "Pause" : "Play"} largeTarget isTouch={isTouch} compact>
                  {playing ? "⏸" : "▶"}
                </ControlBtn>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekForward} label="Forward 10 seconds" largeTarget isTouch={isTouch} compact>+10</ControlBtn>
                )}
                <ControlBtn onClick={skipNext} label="Skip" largeTarget isTouch={isTouch} compact>⏭</ControlBtn>
                <ControlBtn
                  onClick={toggleLoop}
                  label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                  active={loopMode !== "off"}
                  largeTarget
                  isTouch={isTouch}
                  compact
                >
                  {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
                </ControlBtn>
                <ControlBtn onClick={handleToggleMode} label="Watch" active largeTarget isTouch={isTouch} compact>👁</ControlBtn>
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
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{displayItem.podcastTitle}</div>
                  ) : "channelName" in displayItem && (channelContext && onOpenChannel ? (
                    <button onClick={onOpenChannel} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {displayItem.channelName} ↗
                    </button>
                  ) : (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{"channelName" in displayItem ? displayItem.channelName : ""}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: layout === "tablet" && isTouch ? "4px" : "6px", flexShrink: 0, ...(layout === "tablet" && { marginLeft: "auto" }) }}>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekBackward} label="Back 10 seconds" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>−10</ControlBtn>
                )}
                <ControlBtn onClick={playing ? pause : resume} label={playing ? "Pause" : "Play"} largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>
                  {playing ? "⏸" : "▶"}
                </ControlBtn>
                {canSeekFixedStep && (
                  <ControlBtn onClick={seekForward} label="Forward 10 seconds" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>+10</ControlBtn>
                )}
                <ControlBtn onClick={skipNext} label="Skip" largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>⏭</ControlBtn>
                <ControlBtn
                  onClick={toggleLoop}
                  label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                  active={loopMode !== "off"}
                  largeTarget={isTouch}
                  isTouch={isTouch}
                  compact={layout === "tablet" && isTouch}
                >
                  {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
                </ControlBtn>
                <ControlBtn onClick={handleToggleMode} label="Watch" active largeTarget={isTouch} isTouch={isTouch} compact={layout === "tablet" && isTouch}>👁</ControlBtn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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

function ControlBtn({
  children,
  onClick,
  label,
  active,
  dim,
  largeTarget,
  isTouch,
  compact,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  dim?: boolean;
  largeTarget?: boolean;
  isTouch?: boolean;
  compact?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={isTouch ? undefined : () => setShowTooltip(true)}
      onMouseLeave={isTouch ? undefined : () => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        aria-label={label}
        style={{
          background: active ? "var(--violet-glow)" : "none",
          border: "none",
          borderRadius: "4px",
          color: active ? "var(--violet-soft)" : largeTarget ? "var(--text)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: largeTarget ? "18px" : "14px",
          opacity: dim ? 0.35 : 1,
          padding: largeTarget ? (compact ? "10px 6px" : "12px 16px") : "4px 8px",
          transition: "color 0.15s, opacity 0.15s",
          minWidth: largeTarget ? "44px" : undefined,
          minHeight: largeTarget ? "44px" : undefined,
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={isTouch ? undefined : (e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={isTouch ? undefined : (e) => {
          e.currentTarget.style.color = active ? "var(--violet-soft)" : largeTarget ? "var(--text)" : "var(--text-muted)";
          e.currentTarget.style.opacity = dim ? "0.35" : "1";
        }}
      >
        {children}
      </button>
      {showTooltip && !isTouch && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "var(--text-muted)",
            fontSize: "11px",
            padding: "3px 7px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
