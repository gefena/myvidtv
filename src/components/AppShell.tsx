"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/useLibrary";
import { useLayout } from "@/hooks/useLayout";
import { Header } from "./Header";
import { EmptyState } from "./EmptyState";
import { PlayerArea } from "./PlayerArea";
import { LibraryPanel } from "./LibraryPanel";
import { AddFlow } from "./AddFlow";
import { ImportConfirm } from "./ImportConfirm";
import { ChannelBrowseModal } from "./ChannelBrowseModal";
import { importLibrary as parseImportFile } from "@/lib/exportImport";
import type { LibraryItem, LibraryData, ChannelItem, VideoItem, WatchHistoryItem } from "@/types/library";
import type { ChannelFeedVideo } from "@/lib/channelRss";

export function AppShell() {
  const { items, archivedItems, watchHistory, settings, updateSettings, hydrated, exportLibrary, getWatchHistoryEntry } = useLibrary();
  const layout = useLayout();
  const isMobile = layout === "phone";
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialUrl, setAddInitialUrl] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);
  const [libraryView, setLibraryView] = useState<"library" | "archive" | "history">("library");
  const [showArchive, setShowArchive] = useState(false);
  const [librarySheetOpen, setLibrarySheetOpen] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<LibraryData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [browseChannelItem, setBrowseChannelItem] = useState<ChannelItem | null>(null);
  const [channelContext, setChannelContext] = useState<{ channelId: string; title: string } | null>(null);
  const [ended, setEnded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleItemEnd = useCallback((next: LibraryItem) => {
    setCurrentItem(next);
    setChannelContext(null);
    setEnded(false);
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleChannelVideoSelect = useCallback((video: ChannelFeedVideo, channel: ChannelItem) => {
    const historyEntry = getWatchHistoryEntry(video.ytId);
    const transient: VideoItem = {
      type: "video",
      ytId: video.ytId,
      title: video.title,
      channelName: channel.title,
      thumbnail: video.thumbnail,
      tags: [],
      addedAt: 0,
      lastPosition: historyEntry?.lastPosition,
      lastWatchedRatio: historyEntry?.lastWatchedRatio,
      watchSource: { type: "channel", channelId: channel.channelId },
    };
    setChannelContext({ channelId: channel.channelId, title: channel.title });
    setEnded(false);
    setCurrentItem(transient);
    if (isMobile) setLibrarySheetOpen(false);
    setBrowseChannelItem(null);
  }, [getWatchHistoryEntry, isMobile]);

  const handleHistorySelect = useCallback((entry: WatchHistoryItem) => {
    const sourceChannelId = entry.source?.type === "channel" ? entry.source.channelId : undefined;
    const sourceChannel = sourceChannelId
      ? [...items, ...archivedItems].find((item): item is ChannelItem =>
          item.type === "channel" && (item as ChannelItem).channelId === sourceChannelId
        )
      : null;
    const watchSource = sourceChannel ? entry.source : { type: "history" as const };
    const transient: VideoItem = {
      type: "video",
      ytId: entry.ytId,
      title: entry.title,
      channelName: entry.channelName,
      thumbnail: entry.thumbnail,
      tags: [],
      addedAt: 0,
      lastPosition: entry.lastPosition,
      lastWatchedRatio: entry.lastWatchedRatio,
      watchSource,
    };
    setCurrentItem(transient);
    setChannelContext(sourceChannel ? { channelId: sourceChannel.channelId, title: sourceChannel.title } : null);
    setEnded(false);
    if (isMobile) setLibrarySheetOpen(false);
  }, [archivedItems, isMobile, items]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected if user retries
    e.target.value = "";
    try {
      const data = await parseImportFile(file);
      setPendingImportData(data);
      setImportError(null);
      setImportConfirmOpen(true);
    } catch (err) {
      setPendingImportData(null);
      setImportError(err instanceof Error ? err.message : "Unknown error.");
      setImportConfirmOpen(true);
    }
  }, []);

  // Track values to detect changes and adjust state during render
  // to avoid cascading renders (react-hooks/set-state-in-effect)
  const [prevLayout, setPrevLayout] = useState(layout);
  const [prevCurrentItem, setPrevCurrentItem] = useState(currentItem);
  const [prevListenMode, setPrevListenMode] = useState(settings.listenMode);

  if (layout !== prevLayout || currentItem !== prevCurrentItem || settings.listenMode !== prevListenMode) {
    setPrevLayout(layout);
    setPrevCurrentItem(currentItem);
    setPrevListenMode(settings.listenMode);
    if (isMobile && (!currentItem || settings.listenMode)) {
      setLibrarySheetOpen(true);
    }
  }

  if (!hydrated) return null;

  const isEmpty = items.length === 0 && watchHistory.length === 0 && !showArchive;
  const collapsed = settings.libraryCollapsed;

  const handleCollapseToggle = () => {
    updateSettings({ libraryCollapsed: !collapsed });
  };

  const handleSelectItem = (item: LibraryItem) => {
    setCurrentItem(item);
    setChannelContext(null);
    setEnded(false);
    if (isMobile) setLibrarySheetOpen(false);
  };


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
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
          onImport={handleImportClick}
        />
      ) : (
        /* Shared layout wrapper — PlayerArea always first child for stable React tree */
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            ...(layout !== "tablet" && { flexDirection: layout === "phone" ? "column" : "row" }),
          }}
          className={layout === "tablet" ? "tablet-layout" : undefined}
        >
          {/* PlayerArea wrapper — never moves in the tree, keeps YouTube iframe alive */}
          <div
            style={layout === "desktop"
              ? { flex: 1, minWidth: 0, overflow: "hidden" }
              : { overflow: "hidden" }}
            className={layout === "tablet" ? "tablet-player" : undefined}
          >
            <PlayerArea
              currentItem={currentItem}
              onItemEnd={handleItemEnd}
              onPlaceholderClick={
                layout === "phone" ? () => setLibrarySheetOpen(true)
                : layout === "desktop" && collapsed ? handleCollapseToggle
                : undefined
              }
              onEnded={() => setEnded(true)}
              channelContext={channelContext}
              onOpenChannel={() => channelContext && setBrowseChannelItem({ type: "channel", channelId: channelContext.channelId, title: channelContext.title, thumbnail: "", tags: [], addedAt: 0 })}
              layout={layout}
            />
          </div>

          {/* ── Phone: spacer + bottom bar + library sheet ── */}
          {layout === "phone" && (
            <>
              {/* Spacer / empty area when nothing is playing */}
              <div style={{ flex: 1 }} />

              {/* Library peek bar — splits into two when channel context is active */}
              <div
                style={{
                  display: "flex",
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                  paddingBottom: settings.listenMode
                    ? "calc(104px + env(safe-area-inset-bottom))"
                    : "env(safe-area-inset-bottom)",
                }}
              >
                {channelContext ? (
                  <>
                    <button
                      onClick={() => setBrowseChannelItem({ type: "channel", channelId: channelContext.channelId, title: channelContext.title, thumbnail: "", tags: [], addedAt: 0 })}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        borderRight: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "14px 12px",
                        fontSize: "14px",
                        minHeight: "44px",
                        minWidth: 0,
                      }}
                    >
                      <span style={{ flexShrink: 0 }}>←</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ended ? `More from ${channelContext.title}` : channelContext.title}
                      </span>
                    </button>
                    <button
                      onClick={() => setLibrarySheetOpen(true)}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px 12px",
                        fontSize: "14px",
                        minHeight: "44px",
                      }}
                    >
                      <span>☰</span>
                      <span>Library</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setLibrarySheetOpen(true)}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "14px 20px",
                      fontSize: "14px",
                      minHeight: "44px",
                    }}
                  >
                    <span>☰</span>
                    <span>Library</span>
                  </button>
                )}
              </div>

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
                          {libraryView === "archive" ? "Archive" : libraryView === "history" ? "History" : "Library"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {libraryView !== "archive" && (
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
                          {libraryView !== "archive" && (
                            <button
                              onClick={exportLibrary}
                              aria-label="Export library"
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "13px",
                                padding: "3px 8px",
                                minWidth: "44px",
                                minHeight: "44px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ↓
                            </button>
                          )}
                          {libraryView !== "archive" && (
                            <button
                              onClick={handleImportClick}
                              aria-label="Import library"
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "13px",
                                padding: "3px 8px",
                                minWidth: "44px",
                                minHeight: "44px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ↑
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const next = libraryView === "archive" ? "library" : "archive";
                              setLibraryView(next);
                              if (next === "library") setShowArchive(false);
                            }}
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

                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <LibraryPanel
                        activeTag={activeTag}
                        onTagChange={setActiveTag}
                        onSelect={handleSelectItem}
                        currentItem={currentItem}
                        onCollapse={() => {}}
                        view={libraryView}
                        onViewChange={setLibraryView}
                        layout="phone"
                        onBrowseChannel={(item) => { setBrowseChannelItem(item); setLibrarySheetOpen(false); }}
                        onSelectHistory={handleHistorySelect}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ── Tablet: always-visible library panel ── */}
          {layout === "tablet" && (
            <div className="tablet-library">
              <LibraryPanel
                activeTag={activeTag}
                onTagChange={setActiveTag}
                onSelect={handleSelectItem}
                currentItem={currentItem}
                onCollapse={() => {}}
                onExport={exportLibrary}
                onImport={handleImportClick}
                view={libraryView}
                onViewChange={(next) => {
                  setLibraryView(next);
                  if (next === "library") setShowArchive(false);
                }}
                layout="tablet"
                onBrowseChannel={setBrowseChannelItem}
                onSelectHistory={handleHistorySelect}
              />
            </div>
          )}

          {/* ── Desktop: collapsible library panel ── */}
          {layout === "desktop" && (
            <>
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
                      onCollapse={handleCollapseToggle}
                      onExport={exportLibrary}
                      onImport={handleImportClick}
                      view={libraryView}
                      onViewChange={(next) => {
                        setLibraryView(next);
                        if (next === "library") setShowArchive(false);
                      }}
                      onBrowseChannel={setBrowseChannelItem}
                      onSelectHistory={handleHistorySelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
                  ▶
                </button>
              )}
            </>
          )}
        </div>
      )}

      {browseChannelItem && (
        <ChannelBrowseModal
          channelId={browseChannelItem.channelId}
          channelName={browseChannelItem.title}
          watchHistory={watchHistory}
          onPlay={(video: ChannelFeedVideo) => handleChannelVideoSelect(video, browseChannelItem)}
          onClose={() => setBrowseChannelItem(null)}
        />
      )}

      {addOpen && (
        <AddFlow
          initialUrl={addInitialUrl}
          onClose={() => { setAddOpen(false); setAddInitialUrl(""); }}
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {importConfirmOpen && (
        <ImportConfirm
          data={pendingImportData}
          error={importError}
          onReplace={() => setImportConfirmOpen(false)}
          onMerge={() => setImportConfirmOpen(false)}
          onDismiss={() => setImportConfirmOpen(false)}
          onRetry={() => { setImportConfirmOpen(false); fileInputRef.current?.click(); }}
        />
      )}
    </div>
  );
}
