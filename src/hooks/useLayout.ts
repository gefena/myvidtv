"use client";

import { useState, useEffect } from "react";

export type Layout = "phone" | "tablet" | "desktop";

function detectLayout(): Layout {
  const w = window.innerWidth;
  if (w <= 600) return "phone";
  if (w <= 1200 && window.matchMedia("(pointer: coarse)").matches) return "tablet";
  return "desktop";
}

export function useLayout(): Layout {
  // Lazy initializer: "desktop" on server (SSR), actual layout on client.
  // AppShell returns null until hydrated, so no hydration mismatch in rendered output.
  const [layout, setLayout] = useState<Layout>(() =>
    typeof window === "undefined" ? "desktop" : detectLayout()
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const debounced = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setLayout(detectLayout()), 100);
    };

    window.addEventListener("resize", debounced);
    return () => {
      window.removeEventListener("resize", debounced);
      clearTimeout(timeout);
    };
  }, []);

  return layout;
}
