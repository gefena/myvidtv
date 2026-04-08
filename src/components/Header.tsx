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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px", color: "var(--violet)" }}>▶</span>
        <span
          style={{
            fontWeight: 600,
            letterSpacing: "0.08em",
            fontSize: "14px",
            color: "var(--text)",
            textTransform: "uppercase",
          }}
        >
          MyVidTV
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
