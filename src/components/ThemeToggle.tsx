"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="phone-header-btn theme-toggle-btn"
      style={{
        background: "none",
        borderRadius: "6px",
        cursor: "pointer",
        padding: "4px 8px",
        fontSize: "14px",
        transition: "color 0.2s, border-color 0.2s",
      }}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "◑"}</span>
    </button>
  );
}
