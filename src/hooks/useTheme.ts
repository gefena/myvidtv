"use client";

import { useCallback } from "react";
import { useLibrary } from "./useLibrary";

export function useTheme() {
  const { settings, updateSettings } = useLibrary();

  const toggle = useCallback(() => {
    const next = settings.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    updateSettings({ theme: next });
  }, [settings.theme, updateSettings]);

  return { theme: settings.theme, toggle };
}
