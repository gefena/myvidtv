"use client";

import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = {
  onAdd: () => void;
};

export function Header({ onAdd }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Viewport mark — rounded frame + violet signal dot */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--text-muted)" }}>
          <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8.5" cy="16" r="3.5" fill="#8b5cf6"/>
        </svg>
        {/* Two-tone wordmark */}
        <span style={{ fontSize: "14px", letterSpacing: "0.06em", lineHeight: 1 }}>
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>MyVid</span>
          <span style={{ fontWeight: 600, color: "var(--violet)" }}>TV</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <ThemeToggle />
        <button
          onClick={onAdd}
          style={{
            background: "var(--violet)",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            padding: "5px 12px",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          + Add
        </button>
      </div>
    </header>
  );
}
