"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useIsMobile } from "@/hooks/useIsMobile";
import { fetchChannelFeed, getChannelErrorRequestId } from "@/lib/channelRss";
import type { ChannelFeedVideo } from "@/lib/channelRss";
import type { WatchHistoryItem } from "@/types/library";

type Props = {
  channelId: string;
  channelName: string;
  watchHistory?: WatchHistoryItem[];
  onPlay: (video: ChannelFeedVideo) => void;
  onClose: () => void;
};

export function ChannelBrowseModal({ channelId, channelName, watchHistory = [], onPlay, onClose }: Props) {
  const [videos, setVideos] = useState<ChannelFeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; requestId?: string } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchChannelFeed(channelId);
      setVideos(feed.videos);
    } catch (err) {
      setError({
        message: "Could not load videos. Check your connection and try again.",
        requestId: getChannelErrorRequestId(err),
      });
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          maxWidth: "520px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 40px)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text)" }}>
              {channelName}
            </span>
            <span style={{
              marginLeft: "8px",
              background: "var(--violet-glow)",
              color: "var(--violet-soft)",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.04em",
            }}>
              CHANNEL
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "12px" }}>
          {loading && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0", fontSize: "14px" }}>
              Loading videos...
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#f87171", marginBottom: error.requestId ? "8px" : "16px", fontSize: "14px" }}>{error.message}</p>
              {error.requestId && (
                <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "12px", fontFamily: "monospace" }}>
                  Reference: {error.requestId}
                </p>
              )}
              <button
                onClick={load}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  cursor: "pointer",
                  padding: "8px 16px",
                  fontSize: "13px",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && videos.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0", fontSize: "14px" }}>
              No videos found.
            </div>
          )}

          {!loading && !error && videos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {videos.map((video) => (
                <button
                  key={video.ytId}
                  onClick={() => { onPlay(video); onClose(); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: "12px", width: "100%" }}>
                    <div style={{ position: "relative", width: 96, height: 54, borderRadius: "4px", overflow: "hidden", flexShrink: 0, background: "var(--surface-2)" }}>
                      {video.thumbnail && (
                        <Image src={video.thumbnail} alt={video.title} fill style={{ objectFit: "cover" }} unoptimized />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text)",
                        lineHeight: 1.3,
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: isMobile ? undefined : "ellipsis",
                        whiteSpace: isMobile ? "normal" : "nowrap",
                        display: isMobile ? "-webkit-box" : "block",
                        WebkitBoxOrient: isMobile ? "vertical" : undefined,
                        WebkitLineClamp: isMobile ? 2 : undefined,
                        overflowWrap: isMobile ? "anywhere" : undefined,
                      }}>
                        {video.title}
                      </div>
                      {video.publishedAt && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(video.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const ratio = watchHistory.find((entry) => entry.ytId === video.ytId)?.lastWatchedRatio ?? 0;
                    return ratio > 0 ? (
                      <div style={{ marginTop: "6px", height: "2px", background: "var(--border)", borderRadius: "1px", width: "100%" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(1, ratio) * 100}%`,
                            background: "var(--violet)",
                            borderRadius: "1px",
                          }}
                        />
                      </div>
                    ) : null;
                  })()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
