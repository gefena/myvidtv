"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLibrary } from "@/hooks/useLibrary";
import { useLayout } from "@/hooks/useLayout";
import { Header } from "./Header";
import { EmptyState } from "./EmptyState";
import { PlayerArea } from "./PlayerArea";
import { LibraryPanel } from "./LibraryPanel";
import { AddFlow } from "./AddFlow";
import { ImportConfirm } from "./ImportConfirm";
import { ChannelBrowseModal } from "./ChannelBrowseModal";
import { PodcastBrowseModal } from "./PodcastBrowseModal";
import { importLibrary as parseImportFile } from "@/lib/exportImport";
import type { LibraryItem, LibraryData, ChannelItem, PodcastItem, PodcastEpisodeItem, VideoItem, WatchHistoryItem } from "@/types/library";
import type { ChannelFeedVideo } from "@/lib/channelRss";
import type { PodcastEpisode } from "@/lib/podcastRss";

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
  const [browsePodcastItem, setBrowsePodcastItem] = useState<PodcastItem | null>(null);
  const [channelContext, setChannelContext] = useState<{ channelId: string; title: string } | null>(null);
  const [ended, setEnded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetCloseBtnRef = useRef<HTMLButtonElement>(null);
  const sheetTriggerRef = useRef<HTMLElement | null>(null);
  const sheetUserInitiatedRef = useRef(false);
  const peekBarTriggerRef = useRef<HTMLButtonElement>(null);
  const wasSheetOpenRef = useRef(false);
  const modalTriggerRef = useRef<HTMLElement | null>(null);
  const wasModalOpenRef = useRef(false);

  const captureModalTrigger = useCallback((el?: HTMLElement | null) => {
    if (el) {
      modalTriggerRef.current = el;
    } else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      modalTriggerRef.current = document.activeElement;
    }
  }, []);

  const openLibrarySheet = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    if (e?.currentTarget instanceof HTMLElement) {
      sheetTriggerRef.current = e.currentTarget;
    } else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      sheetTriggerRef.current = document.activeElement;
    }
    sheetUserInitiatedRef.current = true;
    setLibrarySheetOpen(true);
  }, []);

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

  const handlePodcastEpisodeSelect = useCallback((episode: PodcastEpisode, podcast: PodcastItem) => {
    const historyEntry = getWatchHistoryEntry(episode.episodeId, "podcast");
    const transient: PodcastEpisodeItem = {
      type: "podcast-episode",
      episodeId: episode.episodeId,
      podcastFeedUrl: podcast.feedUrl,
      title: episode.title,
      podcastTitle: podcast.title,
      audioUrl: episode.audioUrl,
      thumbnail: episode.thumbnail || podcast.thumbnail,
      publishedAt: episode.publishedAt,
      duration: episode.duration,
      tags: [],
      addedAt: 0,
      lastPosition: historyEntry?.lastPosition,
      lastWatchedRatio: historyEntry?.lastWatchedRatio,
      watchSource: { type: "podcast", feedUrl: podcast.feedUrl, audioUrl: episode.audioUrl },
    };
    setChannelContext(null);
    setEnded(false);
    setCurrentItem(transient);
    if (isMobile) setLibrarySheetOpen(false);
    setBrowsePodcastItem(null);
  }, [getWatchHistoryEntry, isMobile]);

  const handleHistorySelect = useCallback((entry: WatchHistoryItem) => {
    if (entry.mediaType === "podcast") {
      const source = entry.source?.type === "podcast" ? entry.source : undefined;
      const transient: PodcastEpisodeItem = {
        type: "podcast-episode",
        episodeId: entry.ytId,
        podcastFeedUrl: source?.feedUrl ?? "",
        title: entry.title,
        podcastTitle: entry.channelName,
        audioUrl: source?.audioUrl ?? "",
        thumbnail: entry.thumbnail,
        publishedAt: "",
        tags: [],
        addedAt: 0,
        lastPosition: entry.lastPosition,
        lastWatchedRatio: entry.lastWatchedRatio,
        watchSource: source ?? { type: "history" },
      };
      if (!transient.audioUrl) return;
      setCurrentItem(transient);
      setChannelContext(null);
      setEnded(false);
      if (isMobile) setLibrarySheetOpen(false);
      return;
    }

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

  // Keep the mobile library sheet CLOSED on first load (header and mini-player visible).
  // Open it automatically only when explicitly toggling into listen mode on phone;
  // close it when exiting listen mode to watch a playing item, or when leaving phone layout.
  // (adjusted during render to avoid cascading renders via react-hooks/set-state-in-effect)
  const isEmpty = items.length === 0 && watchHistory.length === 0 && !showArchive;
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile);
  const [prevListenMode, setPrevListenMode] = useState(settings.listenMode);

  if (
    isMobile !== prevIsMobile ||
    settings.listenMode !== prevListenMode
  ) {
    setPrevIsMobile(isMobile);
    setPrevListenMode(settings.listenMode);
    if (hydrated && isMobile && !isEmpty && !prevListenMode && settings.listenMode) {
      setLibrarySheetOpen(true);
    } else if (isMobile && prevListenMode && !settings.listenMode && currentItem) {
      setLibrarySheetOpen(false);
    } else if (!isMobile && prevIsMobile && librarySheetOpen) {
      setLibrarySheetOpen(false);
    }
  }

  const modalOpen = addOpen || Boolean(browseChannelItem) || Boolean(browsePodcastItem) || importConfirmOpen;

  // Close the phone library sheet on Escape when no modal is open above it
  useEffect(() => {
    if (!isMobile || !librarySheetOpen || modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.repeat) setLibrarySheetOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, librarySheetOpen, modalOpen]);

  // Move focus into the phone library sheet only on user-initiated opens; restore to trigger on close
  useEffect(() => {
    const isOpen = isMobile && librarySheetOpen;
    if (isOpen && !wasSheetOpenRef.current) {
      wasSheetOpenRef.current = true;
      const wasUserInitiated = sheetUserInitiatedRef.current;
      sheetUserInitiatedRef.current = false;
      if (wasUserInitiated) {
        if (sheetCloseBtnRef.current) {
          sheetCloseBtnRef.current.focus();
        } else {
          sheetRef.current?.focus();
        }
      }
    } else if (!isOpen && wasSheetOpenRef.current) {
      wasSheetOpenRef.current = false;
      sheetUserInitiatedRef.current = false;
      if (!modalOpen) {
        const trigger = sheetTriggerRef.current;
        if (trigger && trigger.isConnected) {
          trigger.focus();
        } else {
          const active = typeof document !== "undefined" ? document.activeElement : null;
          const focusWasInsideSheet = !active || active === document.body || sheetRef.current?.contains(active);
          if (focusWasInsideSheet && peekBarTriggerRef.current && peekBarTriggerRef.current.isConnected) {
            peekBarTriggerRef.current.focus();
          }
        }
      }
      sheetTriggerRef.current = null;
    }
  }, [isMobile, librarySheetOpen, modalOpen]);

  // Restore focus when a modal closes (back into the sheet if open, or to its trigger)
  useEffect(() => {
    if (modalOpen) {
      wasModalOpenRef.current = true;
      return;
    }
    if (!wasModalOpenRef.current) return;
    wasModalOpenRef.current = false;
    const trigger = modalTriggerRef.current;
    modalTriggerRef.current = null;
    if (trigger && trigger.isConnected && !trigger.closest("[inert]")) {
      trigger.focus();
    } else if (isMobile && librarySheetOpen) {
      if (sheetCloseBtnRef.current && sheetCloseBtnRef.current.isConnected) {
        sheetCloseBtnRef.current.focus();
      } else {
        sheetRef.current?.focus();
      }
    } else if (peekBarTriggerRef.current && peekBarTriggerRef.current.isConnected) {
      peekBarTriggerRef.current.focus();
    }
  }, [isMobile, librarySheetOpen, modalOpen]);

  if (!hydrated) return null;

  const collapsed = settings.libraryCollapsed;
  const phoneSheetOpen = isMobile && librarySheetOpen;
  const phoneSheetModal = phoneSheetOpen && !(settings.listenMode && Boolean(currentItem));

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
        background: "var(--bg-grad)",
      }}
    >
      <Header onAdd={() => { captureModalTrigger(); setAddOpen(true); }} inert={phoneSheetModal || modalOpen} />

      {isEmpty ? (
        <main inert={modalOpen} style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>
          <EmptyState
            onAdd={(url) => { captureModalTrigger(); setAddInitialUrl(url); setAddOpen(true); }}
            hasArchived={archivedItems.length > 0}
            onViewArchive={() => {
              setShowArchive(true);
              setLibraryView("archive");
              updateSettings({ libraryCollapsed: false });
            }}
            onImport={() => { captureModalTrigger(); handleImportClick(); }}
          />
        </main>
      ) : (
        /* Shared layout wrapper — PlayerArea always first child for stable React tree */
        <main
          inert={modalOpen}
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            position: "relative",
            ...(layout !== "tablet" && { flexDirection: layout === "phone" ? "column" : "row" }),
          }}
          className={layout === "tablet" ? "tablet-layout" : undefined}
        >
          {/* PlayerArea wrapper — never moves in the tree, keeps YouTube iframe alive */}
          <div
            style={
              layout === "desktop"
                ? { flex: 1, minWidth: 0, overflow: "hidden" }
                : layout === "phone" && settings.listenMode && currentItem
                ? { flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }
                : { overflow: "hidden" }
            }
            className={
              layout === "tablet"
                ? "tablet-player"
                : layout === "phone"
                ? "app-shell-player-phone"
                : undefined
            }
          >
            <PlayerArea
              currentItem={currentItem}
              onItemEnd={handleItemEnd}
              onPlaceholderClick={
                layout === "phone" ? () => openLibrarySheet()
                : layout === "desktop" && collapsed ? handleCollapseToggle
                : undefined
              }
              onEnded={() => setEnded(true)}
              channelContext={channelContext}
              onOpenChannel={() => {
                if (!channelContext) return;
                captureModalTrigger();
                setBrowseChannelItem({ type: "channel", channelId: channelContext.channelId, title: channelContext.title, thumbnail: "", tags: [], addedAt: 0 });
              }}
              layout={layout}
              backgroundInert={phoneSheetModal}
            />
          </div>

          {/* ── Phone: spacer + bottom bar + library sheet ── */}
          {layout === "phone" && (
            <>
              {/* Spacer / empty area when nothing is playing (listen-stage fills this area in listen mode) */}
              {!(settings.listenMode && currentItem) && (
                <div className="phone-spacer" style={{ flex: 1 }} />
              )}

              {/* Library peek bar — splits into two when channel context is active */}
              <div
                inert={phoneSheetOpen}
                style={{
                  display: "flex",
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                  paddingLeft: "env(safe-area-inset-left, 0px)",
                  paddingRight: "env(safe-area-inset-right, 0px)",
                  paddingBottom: settings.listenMode && currentItem
                    ? "var(--phone-listen-bar-height, 0px)"
                    : "env(safe-area-inset-bottom, 0px)",
                }}
              >
                {channelContext ? (
                  <>
                    <button
                      className="phone-peek-bar-btn-split"
                      onClick={() => {
                        captureModalTrigger();
                        setBrowseChannelItem({ type: "channel", channelId: channelContext.channelId, title: channelContext.title, thumbnail: "", tags: [], addedAt: 0 });
                      }}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        borderRight: "1px solid var(--border)",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "14px",
                        minWidth: 0,
                      }}
                    >
                      <span aria-hidden="true" style={{ flexShrink: 0 }}>←</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ended ? `More from ${channelContext.title}` : channelContext.title}
                      </span>
                    </button>
                    <button
                      ref={peekBarTriggerRef}
                      data-testid="phone-open-library"
                      className="phone-peek-bar-btn-split"
                      onClick={openLibrarySheet}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <span aria-hidden="true">☰</span>
                      <span>Library</span>
                    </button>
                  </>
                ) : currentItem && (currentItem.type === "video" || currentItem.type === "podcast-episode") ? (
                  /* Styled minibar — shows current media info when playing */
                  <>
                    <button
                      ref={peekBarTriggerRef}
                      className="phone-peek-bar-btn"
                      onClick={openLibrarySheet}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                        textAlign: "left",
                      }}
                    >
                      {currentItem.thumbnail && (
                        <div style={{ position: "relative", width: 24, height: currentItem.type === "podcast-episode" ? 24 : 14, borderRadius: "2px", overflow: "hidden", flexShrink: 0, background: "var(--border)" }}>
                          {currentItem.type === "podcast-episode" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentItem.thumbnail} alt={currentItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <Image
                              src={currentItem.thumbnail}
                              alt={currentItem.title}
                              fill
                              sizes="24px"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                          {currentItem.title}
                        </div>
                        <div className="phone-peek-bar-sub" style={{ fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {currentItem.type === "podcast-episode" ? currentItem.podcastTitle : currentItem.channelName}
                        </div>
                      </div>
                    </button>
                    <button
                      data-testid="phone-open-library"
                      className="phone-peek-bar-btn-icon"
                      onClick={openLibrarySheet}
                      aria-label="Open library"
                      title="Open library"
                      style={{
                        background: "none",
                        border: "none",
                        borderLeft: "1px solid var(--border)",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      <span aria-hidden="true">☰</span>
                    </button>
                  </>
                ) : (
                  <button
                    ref={peekBarTriggerRef}
                    data-testid="phone-open-library"
                    className="phone-peek-bar-btn-wide"
                    onClick={openLibrarySheet}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "none",
                      color: "var(--text-dim)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span aria-hidden="true">☰</span>
                    <span>Library</span>
                  </button>
                )}
              </div>

              {/* Library sheet */}
              <AnimatePresence>
                {librarySheetOpen && phoneSheetModal && (
                  <motion.div
                    key="library-sheet-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setLibrarySheetOpen(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 99,
                      background: "rgba(0,0,0,0.5)",
                    }}
                  />
                )}
                {librarySheetOpen && (
                  <motion.div
                    ref={sheetRef}
                    tabIndex={-1}
                    key="library-sheet"
                    role="dialog"
                    aria-modal={phoneSheetModal}
                    aria-label="Library"
                    inert={modalOpen}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    style={{
                      position: phoneSheetModal ? "fixed" : "absolute",
                      top: phoneSheetModal ? "max(52px, env(safe-area-inset-top, 0px))" : 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 100,
                      background: "var(--surface)",
                      borderTop: "1px solid var(--border-hi)",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      overflow: "hidden",
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
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "6px 8px",
                        padding: "8px 12px 10px",
                      }}>
                        <span data-testid="sheet-header-title" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                          {libraryView === "archive" ? "Archive" : libraryView === "history" ? "History" : "Library"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", marginLeft: "auto" }}>
                          {libraryView !== "archive" && (
                            <button
                              onClick={(e) => { captureModalTrigger(e.currentTarget); setAddOpen(true); }}
                              style={{
                                background: "var(--violet)",
                                border: "none",
                                borderRadius: "4px",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "6px 10px",
                                minHeight: "40px",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              + Add
                            </button>
                          )}
                          {libraryView !== "archive" && (
                            <button
                              onClick={exportLibrary}
                              aria-label="Export library"
                              title="Export library"
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-dim)",
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: "3px 8px",
                                minWidth: "40px",
                                minHeight: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span aria-hidden="true">↓</span>
                            </button>
                          )}
                          {libraryView !== "archive" && (
                            <button
                              onClick={() => { captureModalTrigger(); handleImportClick(); }}
                              aria-label="Import library"
                              title="Import library"
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-dim)",
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: "3px 8px",
                                minWidth: "40px",
                                minHeight: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span aria-hidden="true">↑</span>
                            </button>
                          )}
                          <button
                            ref={sheetCloseBtnRef}
                            onClick={() => setLibrarySheetOpen(false)}
                            aria-label="Close library"
                            title="Close library"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-dim)",
                              cursor: "pointer",
                              fontSize: "22px",
                              lineHeight: 1,
                              padding: "4px 6px",
                              minWidth: "40px",
                              minHeight: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span aria-hidden="true">×</span>
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
                        onViewChange={(next) => {
                          setLibraryView(next);
                          if (next === "library") setShowArchive(false);
                        }}
                        layout="phone"
                        bottomInset={settings.listenMode && Boolean(currentItem) ? "calc(var(--phone-listen-bar-height, 0px) + 8px)" : 0}
                        onBrowseChannel={(item) => { captureModalTrigger(); setBrowseChannelItem(item); }}
                        onBrowsePodcast={(item) => { captureModalTrigger(); setBrowsePodcastItem(item); }}
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
                onImport={() => { captureModalTrigger(); handleImportClick(); }}
                view={libraryView}
                onViewChange={(next) => {
                  setLibraryView(next);
                  if (next === "library") setShowArchive(false);
                }}
                layout="tablet"
                onBrowseChannel={(item) => { captureModalTrigger(); setBrowseChannelItem(item); }}
                onBrowsePodcast={(item) => { captureModalTrigger(); setBrowsePodcastItem(item); }}
                onSelectHistory={handleHistorySelect}
              />
            </div>
          )}

          {/* ── Desktop: collapsible library panel ── */}
          {layout === "desktop" && (
            <>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.aside
                    key="library"
                    aria-label="Library"
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
                      onImport={() => { captureModalTrigger(); handleImportClick(); }}
                      view={libraryView}
                      onViewChange={(next) => {
                        setLibraryView(next);
                        if (next === "library") setShowArchive(false);
                      }}
                      onBrowseChannel={(item) => { captureModalTrigger(); setBrowseChannelItem(item); }}
                      onBrowsePodcast={(item) => { captureModalTrigger(); setBrowsePodcastItem(item); }}
                      onSelectHistory={handleHistorySelect}
                    />
                  </motion.aside>
                )}
              </AnimatePresence>

              {collapsed && (
                <button
                  onClick={handleCollapseToggle}
                  aria-label="Expand library"
                  title="Expand library"
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
        </main>
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

      {browsePodcastItem && (
        <PodcastBrowseModal
          podcast={browsePodcastItem}
          watchHistory={watchHistory}
          onPlay={(episode: PodcastEpisode) => handlePodcastEpisodeSelect(episode, browsePodcastItem)}
          onClose={() => setBrowsePodcastItem(null)}
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
