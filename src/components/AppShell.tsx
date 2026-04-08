"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/useLibrary";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Header } from "./Header";
import { EmptyState } from "./EmptyState";
import { PlayerArea } from "./PlayerArea";
import { LibraryPanel } from "./LibraryPanel";
import { AddFlow } from "./AddFlow";
import type { LibraryItem } from "@/types/library";

export function AppShell() {
  const { items, archivedItems, settings, updateSettings, hydrated } = useLibrary();
  const isMobile = useIsMobile();
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialUrl, setAddInitialUrl] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);
  const [libraryView, setLibraryView] = useState<"library" | "archive">("library");
  const [showArchive, setShowArchive] = useState(false);
  const [librarySheetOpen, setLibrarySheetOpen] = useState(false);

  const handleItemEnd = useCallback((next: LibraryItem) => {
    setCurrentItem(next);
  }, []);

  // Track values to detect changes and adjust state during render
  // to avoid cascading renders (react-hooks/set-state-in-effect)
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile);
  const [prevCurrentItem, setPrevCurrentItem] = useState(currentItem);
  const [prevListenMode, setPrevListenMode] = useState(settings.listenMode);

  if (isMobile !== prevIsMobile || currentItem !== prevCurrentItem || settings.listenMode !== prevListenMode) {
    setPrevIsMobile(isMobile);
    setPrevCurrentItem(currentItem);
    setPrevListenMode(settings.listenMode);
    if (isMobile && (!currentItem || settings.listenMode)) {
      setLibrarySheetOpen(true);
    }
  }

  if (!hydrated) return null;

  const isEmpty = items.length === 0 && !showArchive;
  const collapsed = settings.libraryCollapsed;

  const handleCollapseToggle = () => {
    updateSettings({ libraryCollapsed: !collapsed });
  };

  const handleSelectItem = (item: LibraryItem) => {
    setCurrentItem(item);
    if (isMobile) setLibrarySheetOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <Header onAdd={() => setAddOpen(true)} />

      {isEmpty ? (
        <EmptyState
          onAdd={(url) => { setAddInitialUrl(url); setAddOpen(true); }}
          hasArchived={archivedItems.length > 0}
          onViewArchive={() => {
            setShowArchive(true);
            setLibraryView("archive");
            updateSettings({ libraryCollapsed: false });
          }}
        />
      ) : isMobile ? (
        /* ── Mobile layout ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {/* Player — 16:9 aspect ratio is controlled inside PlayerArea on mobile */}
          <PlayerArea currentItem={currentItem} onItemEnd={handleItemEnd} />

          {/* Spacer / empty area when nothing is playing */}
          <div style={{ flex: 1 }} />

          {/* Library peek bar */}
          {!settings.listenMode && (
            <button
              onClick={() => setLibrarySheetOpen(true)}
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "none",
                borderTop: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 20px",
                fontSize: "14px",
                paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
              }}
            >
              <span>☰</span>
              <span>Library</span>
            </button>
          )}

          {/* Library sheet */}
          <AnimatePresence>
            {librarySheetOpen && (
              <motion.div
                key="library-sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 100,
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Sheet handle + header */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px 12px",
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                      {libraryView === "archive" ? "Archive" : "Library"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {libraryView === "library" && (
                        <button
                          onClick={() => setAddOpen(true)}
                          style={{
                            background: "var(--violet)",
                            border: "none",
                            borderRadius: "4px",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "12px",
                            padding: "3px 8px",
                          }}
                        >
                          + Add
                        </button>
                      )}
                      <button
                        onClick={() => setLibraryView(libraryView === "archive" ? "library" : "archive")}
                        style={{
                          background: libraryView === "archive" ? "var(--violet-glow)" : "none",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          color: libraryView === "archive" ? "var(--violet-soft)" : "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "11px",
                          padding: "3px 6px",
                        }}
                      >
                        {libraryView === "archive" ? "← Library" : "Archive"}
                      </button>
                      <button
                        onClick={() => setLibrarySheetOpen(false)}
                        aria-label="Close library"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "22px",
                          lineHeight: 1,
                          padding: "4px 8px",
                          minWidth: "44px",
                          minHeight: "44px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                {/* Library panel — no collapse button on mobile */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <LibraryPanel
                    activeTag={activeTag}
                    onTagChange={setActiveTag}
                    onSelect={handleSelectItem}
                    currentItem={currentItem}
                    onAdd={() => setAddOpen(true)}
                    onCollapse={() => {}}
                    view={libraryView}
                    onViewChange={setLibraryView}
                    isMobile
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Desktop layout ── */
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
          className="main-content"
        >
          {/* Player area */}
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <PlayerArea
              currentItem={currentItem}
              onItemEnd={handleItemEnd}
            />
          </div>

          {/* Library panel — collapsible */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="library"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden", flexShrink: 0 }}
              >
                <LibraryPanel
                  activeTag={activeTag}
                  onTagChange={setActiveTag}
                  onSelect={handleSelectItem}
                  currentItem={currentItem}
                  onAdd={() => setAddOpen(true)}
                  onCollapse={handleCollapseToggle}
                  view={libraryView}
                  onViewChange={setLibraryView}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed toggle tab */}
          {collapsed && (
            <button
              onClick={handleCollapseToggle}
              aria-label="Expand library"
              style={{
                width: "20px",
                background: "var(--surface)",
                border: "none",
                borderLeft: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "10px",
                flexShrink: 0,
              }}
            >
              ◀
            </button>
          )}
        </div>
      )}

      {addOpen && (
        <AddFlow
          initialUrl={addInitialUrl}
          onClose={() => { setAddOpen(false); setAddInitialUrl(""); }}
        />
      )}
    </div>
  );
}
