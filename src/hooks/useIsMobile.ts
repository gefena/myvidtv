"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 600;

export function useIsMobile(): boolean {
  // Lazy initializer runs synchronously on the client on first render —
  // avoids the desktop→mobile flash without needing a separate effect.
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth <= MOBILE_BREAKPOINT ||
        window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches)
  );

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.innerWidth <= MOBILE_BREAKPOINT ||
          window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches
      );

    let timeout: ReturnType<typeof setTimeout>;
    const debounced = () => {
      clearTimeout(timeout);
      timeout = setTimeout(check, 100);
    };

    window.addEventListener("resize", debounced);
    return () => {
      window.removeEventListener("resize", debounced);
      clearTimeout(timeout);
    };
  }, []);

  return isMobile;
}
