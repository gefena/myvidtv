"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 600;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();

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
