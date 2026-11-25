"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLayout } from "@/hooks/useLayout";
import { useIsMounted } from "@/hooks/useIsMounted";
import { formatPodcastDuration } from "@/lib/duration";
import { fetchPodcastFeed } from "@/lib/podcastRss";
import type { PodcastEpisode } from "@/lib/podcastRss";
import type { PodcastItem, WatchHistoryItem } from "@/types/library";

type Props = {
  podcast: PodcastItem;
  watchHistory?: WatchHistoryItem[];
  onPlay: (episode: PodcastEpisode) => void;
  onClose: () => void;
};

export function PodcastBrowseModal({ podcast, watchHistory = [], onPlay, onClose }: Props) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isMobile = useLayout() === "phone";
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) dialogRef.current?.focus();
  }, [isMounted]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchPodcastFeed(podcast.feedUrl);
      setEpisodes(feed.episodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load episodes. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [podcast.feedUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.repeat) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const modalContent = (
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
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={podcast.title}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          maxWidth: "520px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100dvh - 40px)",
          overflow: "hidden",
          outline: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text)" }}>
              {podcast.title}
            </span>
            <span style={{
              marginLeft: "8px",
              background: "rgba(16,185,129,0.16)",
              color: "#6ee7b7",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}>
              PODCAST
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            style={{
              background: "none",
              border: "none",
              color: isMobile ? "var(--text-dim)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              flexShrink: 0,
              ...(isMobile && {
                minWidth: "40px",
                minHeight: "40px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }),
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div style={{ overflowY: "auto", overscrollBehavior: "contain", padding: "12px" }}>
          {loading && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0", fontSize: "14px" }}>
              Loading episodes...
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

          {!loading && !error && episodes.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0", fontSize: "14px" }}>
              No playable audio episodes found.
            </div>
          )}

          {!loading && !error && episodes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {episodes.map((episode) => {
                const history = watchHistory.find((entry) => entry.mediaType === "podcast" && entry.ytId === episode.episodeId);
                const ratio = history?.lastWatchedRatio ?? 0;
                const formattedDuration = formatPodcastDuration(episode.duration);
                return (
                  <button
                    key={episode.episodeId}
                    onClick={() => { onPlay(episode); onClose(); }}
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
                      <div style={{ width: 54, height: 54, borderRadius: "4px", overflow: "hidden", flexShrink: 0, background: "var(--surface-2)" }}>
                        {episode.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={episode.thumbnail} alt={episode.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                          {episode.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {[formatDate(episode.publishedAt), formattedDuration].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                    {ratio > 0 && (
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
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isMounted) return null;
  return createPortal(modalContent, document.body);
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
