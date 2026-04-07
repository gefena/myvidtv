"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useLibrary } from "@/hooks/useLibrary";
import { TagPicker } from "./TagPicker";
import { fetchVideoOEmbed, parsePlaylistId, isPlaylistUrl } from "@/lib/oembed";
import type { VideoMeta } from "@/types/library";

type Step =
  | { name: "input" }
  | { name: "loading" }
  | { name: "video"; meta: VideoMeta }
  | { name: "playlist-name"; playlistId: string }
  | { name: "error"; message: string };

type AddFlowProps = {
  onClose: () => void;
  initialUrl?: string;
};

export function AddFlow({ onClose, initialUrl = "" }: AddFlowProps) {
  const { items, archivedItems, customTags, addVideo, addPlaylistChannel, addCustomTag } = useLibrary();
  const [url, setUrl] = useState(initialUrl);
  const [step, setStep] = useState<Step>({ name: "input" });
  const [tags, setTags] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (isPlaylistUrl(trimmed)) {
      const id = parsePlaylistId(trimmed);
      if (!id) {
        setStep({ name: "error", message: "Could not parse playlist ID from URL." });
        return;
      }
      setStep({ name: "playlist-name", playlistId: id });
      return;
    }

    setStep({ name: "loading" });
    try {
      const meta = await fetchVideoOEmbed(trimmed);
      setStep({ name: "video", meta });
    } catch (err) {
      setStep({ name: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }, [url]);

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    newTags.forEach((t) => addCustomTag(t));
  };

  const handleVideoSave = (meta: VideoMeta) => {
    const allItems = [...items, ...archivedItems];
    const exists = allItems.some((i) => i.type === "video" && i.ytId === meta.ytId);
    if (exists) {
      const inArchive = archivedItems.some((i) => i.type === "video" && i.ytId === meta.ytId);
      setStep({
        name: "error",
        message: inArchive
          ? "This video is in your archive. Restore it from the archive to add it back."
          : "This video is already in your library.",
      });
      return;
    }
    addVideo({
      ytId: meta.ytId,
      title: meta.title,
      channelName: meta.channelName,
      thumbnail: meta.thumbnail,
      tags,
    });
    onClose();
  };

  const handlePlaylistSave = (playlistId: string) => {
    const name = playlistName.trim();
    if (!name) return;
    const allItems = [...items, ...archivedItems];
    const exists = allItems.some((i) => i.type === "playlist-channel" && i.ytPlaylistId === playlistId);
    if (exists) {
      const inArchive = archivedItems.some((i) => i.type === "playlist-channel" && i.ytPlaylistId === playlistId);
      setStep({
        name: "error",
        message: inArchive
          ? "This playlist is in your archive. Restore it from the archive to add it back."
          : "This playlist is already in your library.",
      });
      return;
    }
    addPlaylistChannel({
      ytPlaylistId: playlistId,
      title: name,
      channelName: "",
      thumbnail: "",
      videoCount: 0,
      tags,
    });
    onClose();
  };

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
          maxWidth: "480px",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text)" }}>
            Add to My TV
          </span>
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
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── URL input ── */}
          {step.name === "input" && (
            <form onSubmit={handleUrlSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube link..."
                autoFocus
                style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  fontSize: "14px",
                  outline: "none",
                  padding: "10px 14px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--violet)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                type="submit"
                style={{
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "10px 16px",
                  fontWeight: 500,
                }}
              >
                Fetch
              </button>
            </form>
          )}

          {/* ── Loading ── */}
          {step.name === "loading" && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>
              Fetching...
            </div>
          )}

          {/* ── Error ── */}
          {step.name === "error" && (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f87171", marginBottom: "16px", margin: "0 0 16px" }}>
                {step.message}
              </p>
              <button
                onClick={() => setStep({ name: "input" })}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  cursor: "pointer",
                  padding: "8px 16px",
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Video preview ── */}
          {step.name === "video" && (
            <>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {step.meta.thumbnail && (
                  <div style={{ position: "relative", width: 120, height: 68, flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                    <Image src={step.meta.thumbnail} alt={step.meta.title} fill style={{ objectFit: "cover" }} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                    {step.meta.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {step.meta.channelName}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tags
                </div>
                <TagPicker selected={tags} customTags={customTags} onChange={handleTagsChange} />
              </div>

              <button
                onClick={() => handleVideoSave(step.meta)}
                style={{
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: "10px",
                  width: "100%",
                }}
              >
                Save to My TV
              </button>
            </>
          )}

          {/* ── Playlist name ── */}
          {step.name === "playlist-name" && (
            <>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Playlist ID
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {step.playlistId}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Name this channel
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="e.g. JavaScript Tutorials"
                  autoFocus
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text)",
                    fontSize: "14px",
                    outline: "none",
                    padding: "10px 14px",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--violet)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tags
                </div>
                <TagPicker selected={tags} customTags={customTags} onChange={handleTagsChange} />
              </div>

              <button
                onClick={() => handlePlaylistSave(step.playlistId)}
                disabled={!playlistName.trim()}
                style={{
                  background: playlistName.trim() ? "var(--violet)" : "var(--surface-2)",
                  border: "none",
                  borderRadius: "6px",
                  color: playlistName.trim() ? "#fff" : "var(--text-muted)",
                  cursor: playlistName.trim() ? "pointer" : "default",
                  fontWeight: 500,
                  padding: "10px",
                  width: "100%",
                }}
              >
                Add as Channel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
