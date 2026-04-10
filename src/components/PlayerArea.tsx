"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLibrary } from "@/hooks/useLibrary";
import { usePlayer, getItemId } from "@/hooks/usePlayer";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { LibraryItem, VideoItem } from "@/types/library";

type PlayerAreaProps = {
  currentItem: LibraryItem | null;
  onItemEnd?: (next: LibraryItem) => void;
};

export function PlayerArea({ currentItem, onItemEnd }: PlayerAreaProps) {
  const { items, updateSettings, settings } = useLibrary();
  const isMobile = useIsMobile();

  const {
    containerRef,
    currentItem: playerCurrentItem,
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
  } = usePlayer(items, onItemEnd, settings.listenMode ? "listen" : "watch", settings.loopMode);

  // Sync external currentItem into player — guard against re-firing during auto-advance
  useEffect(() => {
    if (currentItem && getItemId(currentItem) !== (playerCurrentItem ? getItemId(playerCurrentItem) : null)) {
      play(currentItem);
    }
  }, [currentItem, play, playerCurrentItem]);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg)",
      }}
    >
      {/* YouTube IFrame container — on mobile uses 16:9 aspect ratio; on desktop collapses in listen mode */}
      <div
        style={
          isMobile
            ? {
                width: "100%",
                aspectRatio: isListen ? undefined : "16/9",
                flex: isListen ? "0 0 0" : undefined,
                overflow: "hidden",
                position: "relative",
                background: "#000",
                flexShrink: 0,
              }
            : {
                flex: isListen ? "0 0 0" : "1",
                overflow: "hidden",
                transition: "flex 0.3s ease",
                position: "relative",
                background: "#000",
              }
        }
      >
        <div
          ref={containerRef}
          id="yt-player"
          style={{
            width: "100%",
            height: "100%",
            opacity: isListen ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        />

        {/* Placeholder when nothing is playing */}
        {!displayItem && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
              pointerEvents: "none",
            }}
          >
            Select something to watch
          </div>
        )}
      </div>

      {/* Now-playing bar */}
      {displayItem && !isListen && (
        <div
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {/* Progress bar — touch-target wrapper expands hit area on mobile */}
          <div
            style={{
              padding: isMobile ? "21px 0" : "0",
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

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
            }}
          >
            {/* Thumbnail */}
            {(displayItem as VideoItem).thumbnail && (
              <div
                style={{
                  position: "relative",
                  width: 48,
                  height: 27,
                  borderRadius: "3px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={(displayItem as VideoItem).thumbnail}
                  alt={displayItem.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            {/* Title + channel */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayItem.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {displayItem.channelName}
              </div>
            </div>

            {/* Playback controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ControlBtn
                onClick={playing ? pause : resume}
                label={playing ? "Pause" : "Play"}
                isMobile={isMobile}
              >
                {playing ? "⏸" : "▶"}
              </ControlBtn>
              <ControlBtn onClick={skipNext} label="Skip" isMobile={isMobile}>⏭</ControlBtn>
              <ControlBtn
                onClick={toggleLoop}
                label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                active={loopMode !== "off"}
                isMobile={isMobile}
              >
                {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
              </ControlBtn>
              <ControlBtn
                onClick={handleToggleMode}
                label={isListen ? "Watch" : "Listen"}
                active={isListen}
                isMobile={isMobile}
              >
                {isListen ? "👁" : "♪"}
              </ControlBtn>
            </div>
          </div>
        </div>
      )}

      {/* Mini listen bar — shown when in listen mode and something is playing */}
      {isListen && displayItem && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--surface)",
            borderTop: "1px solid var(--violet)",
            zIndex: 150,
          }}
        >
          {/* Progress bar — videos only, touch-target wrapper on mobile */}
          {displayItem.type === "video" && (
            <div
              style={{
                padding: isMobile ? "21px 0" : "0",
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
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px",
            paddingBottom: isMobile ? "calc(8px + env(safe-area-inset-bottom))" : "8px",
          }}>
            <span style={{ color: "var(--violet-soft)", fontSize: "16px" }}>♪</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayItem.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{displayItem.channelName}</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <ControlBtn onClick={playing ? pause : resume} label={playing ? "Pause" : "Play"} isMobile={isMobile}>
                {playing ? "⏸" : "▶"}
              </ControlBtn>
              <ControlBtn onClick={skipNext} label="Skip" isMobile={isMobile}>⏭</ControlBtn>
              <ControlBtn
                onClick={toggleLoop}
                label={loopMode === "off" ? "Loop: off" : loopMode === "one" ? "Loop: one" : "Loop: all"}
                active={loopMode !== "off"}
                isMobile={isMobile}
              >
                {loopMode === "one" ? "↺1" : loopMode === "all" ? "↺∞" : "↺"}
              </ControlBtn>
              <ControlBtn onClick={handleToggleMode} label="Watch" active isMobile={isMobile}>👁</ControlBtn>
            </div>
          </div>
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
  isMobile,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  dim?: boolean;
  isMobile?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        aria-label={label}
        style={{
          background: active ? "var(--violet-glow)" : "none",
          border: "none",
          borderRadius: "4px",
          color: active ? "var(--violet-soft)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: isMobile ? "18px" : "14px",
          opacity: dim ? 0.35 : 1,
          padding: isMobile ? "12px 16px" : "4px 8px",
          transition: "color 0.15s, opacity 0.15s",
          minWidth: isMobile ? "44px" : undefined,
          minHeight: isMobile ? "44px" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={isMobile ? undefined : (e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={isMobile ? undefined : (e) => {
          e.currentTarget.style.color = active ? "var(--violet-soft)" : "var(--text-muted)";
          e.currentTarget.style.opacity = dim ? "0.35" : "1";
        }}
      >
        {children}
      </button>
      {showTooltip && !isMobile && (
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
