"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useIsTouch } from "@/hooks/useLayout";
import { getItemId } from "@/hooks/usePlayer";
import { getSharePayload, type SharePayload } from "@/lib/share";
import type { LibraryItem } from "@/types/library";

type ShareButtonProps = {
  item: LibraryItem | null;
  getPositionSeconds?: () => number | undefined;
  largeTarget?: boolean;
};

type MenuPosition = {
  bottom?: number;
  top?: number;
  right: number;
};

export function ShareButton({ item, getPositionSeconds, largeTarget }: ShareButtonProps) {
  const isMounted = useIsMounted();
  const isTouch = useIsTouch();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hovered, setHovered] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [activePayload, setActivePayload] = useState<SharePayload | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ bottom: 72, right: 16 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itemId = item ? getItemId(item) : null;
  const menuOpen = openItemId !== null && openItemId === itemId;
  const useLargeTarget = Boolean(largeTarget || isTouch);
  const basePayload = getSharePayload(item);

  const closeMenu = useCallback((returnFocus = false) => {
    setOpenItemId(null);
    if (returnFocus) {
      buttonRef.current?.focus();
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    firstActionRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      closeMenu(false);
    };

    const handleWindowDismiss = () => {
      closeMenu(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleWindowDismiss);
    window.addEventListener("blur", handleWindowDismiss);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleWindowDismiss);
      window.removeEventListener("blur", handleWindowDismiss);
    };
  }, [closeMenu, menuOpen]);

  const toast = isMounted && toastMessage
    ? createPortal(
        <div
          role="status"
          aria-live="polite"
          className="share-toast"
        >
          {toastMessage}
        </div>,
        document.body
      )
    : null;

  if (!basePayload || !item) return toast;

  const openPopover = (payload: SharePayload) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const right = Math.max(8, window.innerWidth - rect.right);
      if (rect.top >= 140) {
        setMenuPos({ bottom: window.innerHeight - rect.top + 8, right });
      } else {
        setMenuPos({ top: rect.bottom + 8, right });
      }
    }
    setActivePayload(payload);
    setOpenItemId(itemId);
  };

  const handleClick = async () => {
    if (menuOpen) {
      closeMenu(false);
      return;
    }

    const payload = getSharePayload(item, { positionSeconds: getPositionSeconds?.() });
    if (!payload) return;

    if (isTouch && typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: payload.title,
          text: `${payload.text}\n${payload.url}`,
          url: payload.url,
        });
        return;
      } catch (err) {
        if ((err as { name?: string } | null)?.name === "AbortError") {
          return;
        }
      }
    }

    openPopover(payload);
  };

  const handleCopyLink = async () => {
    if (!activePayload) return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(activePayload.url);
      showToast("Copied link");
    } catch {
      showToast("Couldn't copy link");
    }
    closeMenu(true);
  };

  const handleWhatsApp = () => {
    if (!activePayload) return;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${activePayload.text}\n${activePayload.url}`)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    closeMenu(true);
  };

  const mailtoHref = activePayload
    ? `mailto:?subject=${encodeURIComponent(activePayload.title)}&body=${encodeURIComponent(`${activePayload.text}\n${activePayload.url}`)}`
    : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-testid="share-button"
        aria-label={`Share "${item.title}"`}
        title="Share"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={() => {
          void handleClick();
        }}
        onMouseEnter={isTouch ? undefined : () => setHovered(true)}
        onMouseLeave={isTouch ? undefined : () => setHovered(false)}
        style={{
          background: menuOpen
            ? "var(--violet-glow)"
            : hovered
            ? "var(--chip)"
            : "transparent",
          border: "none",
          borderRadius: "6px",
          color: menuOpen ? "var(--violet-soft)" : "var(--text)",
          cursor: "pointer",
          padding: useLargeTarget ? "10px 6px" : "6px 8px",
          minWidth: useLargeTarget ? "44px" : "34px",
          minHeight: useLargeTarget ? "44px" : "34px",
          transition: "color 0.15s, background-color 0.15s",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShareIcon />
      </button>

      {isMounted && menuOpen && activePayload && createPortal(
        <div
          ref={menuRef}
          aria-label="Share options"
          data-testid="share-menu"
          className="share-menu"
          style={{
            position: "fixed",
            bottom: menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
            top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
            right: `${menuPos.right}px`,
            zIndex: 260,
          }}
        >
          <button
            ref={firstActionRef}
            type="button"
            className="share-menu-item"
            onClick={() => {
              void handleCopyLink();
            }}
          >
            Copy link
          </button>
          <button
            type="button"
            className="share-menu-item"
            onClick={handleWhatsApp}
          >
            WhatsApp
          </button>
          <a
            href={mailtoHref}
            className="share-menu-item"
            onClick={() => closeMenu(true)}
          >
            Email
          </a>
        </div>,
        document.body
      )}

      {toast}
    </>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}
