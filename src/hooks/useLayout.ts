"use client";

import { useSyncExternalStore } from "react";

export type Layout = "phone" | "tablet" | "desktop";

const PHONE_QUERY = "(max-width: 600px)";
const COARSE_TABLET_QUERY = "(max-width: 1200px) and (pointer: coarse)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

export function resolveLayout(width: number, isCoarsePointer: boolean): Layout {
  if (width <= 600) return "phone";
  if (width <= 1200 && isCoarsePointer) return "tablet";
  return "desktop";
}

export function getClientLayout(): Layout {
  if (typeof window === "undefined") return "desktop";
  return resolveLayout(
    window.innerWidth,
    window.matchMedia(COARSE_POINTER_QUERY).matches
  );
}

function getServerLayout(): Layout {
  return "desktop";
}

function subscribeLayout(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mqls = [
    window.matchMedia(PHONE_QUERY),
    window.matchMedia(COARSE_TABLET_QUERY),
    window.matchMedia(COARSE_POINTER_QUERY),
  ];

  for (const mql of mqls) {
    mql.addEventListener("change", callback);
  }

  return () => {
    for (const mql of mqls) {
      mql.removeEventListener("change", callback);
    }
  };
}

export function useLayout(): Layout {
  return useSyncExternalStore(subscribeLayout, getClientLayout, getServerLayout);
}

export function getClientIsTouch(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function getServerIsTouch(): boolean {
  return false;
}

function subscribeIsTouch(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mql = window.matchMedia(COARSE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => {
    mql.removeEventListener("change", callback);
  };
}

export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribeIsTouch, getClientIsTouch, getServerIsTouch);
}
