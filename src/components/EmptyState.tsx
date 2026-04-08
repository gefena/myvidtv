"use client";

import { useState } from "react";

type EmptyStateProps = {
  onAdd: (url: string) => void;
  hasArchived?: boolean;
  onViewArchive?: () => void;
  onImport?: () => void;
};

export function EmptyState({ onAdd, hasArchived, onViewArchive, onImport }: EmptyStateProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAdd(url.trim());
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        padding: "40px 20px",
      }}
    >
      {/* TV screen metaphor */}
      <div
        style={{
          position: "relative",
          width: "min(480px, 90vw)",
          aspectRatio: "16/9",
          background: "var(--surface)",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 60px var(--violet-glow)`,
        }}
      >
        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
            borderRadius: "6px",
            pointerEvents: "none",
          }}
        />
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.4 }}>
            ▶
          </div>
          <div style={{ fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            No signal
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "15px",
            margin: "0 0 20px",
          }}
        >
          {hasArchived ? "Your library is empty." : "Add a YouTube link to start watching."}
        </p>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube link..."
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text)",
              fontSize: "14px",
              outline: "none",
              padding: "10px 14px",
              transition: "border-color 0.2s",
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
              fontWeight: 500,
              padding: "10px 18px",
              whiteSpace: "nowrap",
            }}
          >
            Add
          </button>
        </form>
        {hasArchived && onViewArchive && (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "16px 0 0" }}>
            or{" "}
            <button
              onClick={onViewArchive}
              style={{
                background: "none",
                border: "none",
                color: "var(--violet-soft)",
                cursor: "pointer",
                fontSize: "13px",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              view archived items →
            </button>
          </p>
        )}
        {onImport && (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "12px 0 0" }}>
            or{" "}
            <button
              onClick={onImport}
              style={{
                background: "none",
                border: "none",
                color: "var(--violet-soft)",
                cursor: "pointer",
                fontSize: "13px",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              import from a backup file →
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
