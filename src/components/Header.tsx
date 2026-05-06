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
        {/* Rounded-square badge with violet dot */}
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "var(--surface-2)",
          border: "1.5px solid var(--border-hi)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 18px var(--logo-glow)",
          flexShrink: 0,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--violet)" }} />
        </div>
        {/* Two-tone wordmark */}
        <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.3px", lineHeight: 1 }}>
          <span style={{ color: "var(--text)" }}>MyVid</span>
          <span style={{ color: "var(--violet)" }}>TV</span>
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
