"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { fetchChannelFeed } from "@/lib/channelRss";
import type { ChannelFeedVideo } from "@/lib/channelRss";

type Props = {
  channelId: string;
  channelName: string;
  onPlay: (video: ChannelFeedVideo) => void;
  onClose: () => void;
};

export function ChannelBrowseModal({ channelId, channelName, onPlay, onClose }: Props) {
  const [videos, setVideos] = useState<ChannelFeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchChannelFeed(channelId)
      .then((feed) => { setVideos(feed.videos); setLoading(false); })
      .catch(() => { setError("Could not load videos. Check your connection and try again."); setLoading(false); });
  };

  useEffect(() => { load(); }, [channelId]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <p style={{ color: "#f87171", marginBottom: "16px", fontSize: "14px" }}>{error}</p>
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
                    alignItems: "center",
                    gap: "12px",
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
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.3,
                      marginBottom: "4px",
                    }}>
                      {video.title}
                    </div>
                    {video.publishedAt && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {new Date(video.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
