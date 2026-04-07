"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        color: "var(--text-muted)",
        cursor: "pointer",
        padding: "4px 8px",
        fontSize: "14px",
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text)";
        e.currentTarget.style.borderColor = "var(--violet-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {theme === "dark" ? "☀" : "◑"}
    </button>
  );
}
