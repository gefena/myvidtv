"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/useLibrary";
import { TagPicker } from "./TagPicker";
import { PREDEFINED_TAGS } from "@/lib/constants";
import type { LibraryItem, VideoItem, PlaylistChannel, ChannelItem, WatchHistoryItem } from "@/types/library";

type LibraryPanelProps = {
  activeTag: string;
  onTagChange: (tag: string) => void;
  onSelect: (item: LibraryItem) => void;
  currentItem: LibraryItem | null;
  onCollapse: () => void;
  onExport?: () => void;
  onImport?: () => void;
  view: "library" | "archive" | "history";
  onViewChange: (view: "library" | "archive" | "history") => void;
  isMobile?: boolean;
  onBrowseChannel: (item: ChannelItem) => void;
  onSelectHistory: (item: WatchHistoryItem) => void;
};

function itemId(item: LibraryItem) {
  if (item.type === "video") return item.ytId;
  if (item.type === "playlist-channel") return item.ytPlaylistId;
  return item.channelId;
}

export function LibraryPanel({
  activeTag,
  onTagChange,
  onSelect,
  currentItem,
  onCollapse,
  onExport,
  onImport,
  view,
  onViewChange,
  isMobile = false,
  onBrowseChannel,
  onSelectHistory,
}: LibraryPanelProps) {
  const {
    archivedItems,
    watchHistory,
    filteredItems,
    allTags,
    archiveItem,
    restoreItem,
    permanentlyDeleteItem,
    removeWatchHistoryEntry,
  } = useLibrary();
  const [viewTooltip, setViewTooltip] = useState(false);
  const [collapseTooltip, setCollapseTooltip] = useState(false);
  const [exportTooltip, setExportTooltip] = useState(false);
  const [importTooltip, setImportTooltip] = useState(false);

  const tags = allTags();
  const displayItems = view === "library"
    ? filteredItems(activeTag === "all" ? null : activeTag)
    : archivedItems;

  const isArchive = view === "archive";
  const isHistory = view === "history";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--surface)",
        borderLeft: isMobile ? "none" : "1px solid var(--border)",
        width: isMobile ? "100%" : "320px",
      }}
    >
      {/* Panel header — hidden on mobile (sheet header in AppShell takes over) */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {isArchive ? "Archive" : isHistory ? "History" : "Library"}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {!isArchive && onExport && (
              <div
                style={{ position: "relative", display: "inline-flex" }}
                onMouseEnter={() => setExportTooltip(true)}
                onMouseLeave={() => setExportTooltip(false)}
              >
                <button
                  onClick={onExport}
                  aria-label="Export library"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "11px",
                    padding: "3px 6px",
                  }}
                >
                  ↓
                </button>
                {exportTooltip && !isMobile && (
                  <div
                    style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                  >
                    Export library
                  </div>
                )}
              </div>
            )}
            {!isArchive && onImport && (
              <div
                style={{ position: "relative", display: "inline-flex" }}
                onMouseEnter={() => setImportTooltip(true)}
                onMouseLeave={() => setImportTooltip(false)}
              >
                <button
                  onClick={onImport}
                  aria-label="Import library"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "11px",
                    padding: "3px 6px",
                  }}
                >
                  ↑
                </button>
                {importTooltip && !isMobile && (
                  <div
                    style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                  >
                    Import library
                  </div>
                )}
              </div>
            )}
            <div
              style={{ position: "relative", display: "inline-flex" }}
              onMouseEnter={() => setViewTooltip(true)}
              onMouseLeave={() => setViewTooltip(false)}
            >
              <button
                onClick={() => onViewChange(isHistory ? "library" : "history")}
                aria-label={isHistory ? "Back to library" : "View history"}
                style={{
                  background: isHistory ? "var(--violet-glow)" : "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: isHistory ? "var(--violet-soft)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "3px 6px",
                }}
              >
                {isHistory ? "← Library" : "History"}
              </button>
              {viewTooltip && !isMobile && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                >
                  {isHistory ? "Back to library" : "View history"}
                </div>
              )}
            </div>
            <button
              onClick={() => onViewChange(isArchive ? "library" : "archive")}
              aria-label={isArchive ? "Back to library" : "View archive"}
              style={{
                background: isArchive ? "var(--violet-glow)" : "none",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: isArchive ? "var(--violet-soft)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "11px",
                padding: "3px 6px",
              }}
            >
              {isArchive ? "← Library" : "Archive"}
            </button>
            <div
              style={{ position: "relative", display: "inline-flex" }}
              onMouseEnter={() => setCollapseTooltip(true)}
              onMouseLeave={() => setCollapseTooltip(false)}
            >
              <button
                onClick={onCollapse}
                aria-label="Collapse library"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "3px 6px",
                }}
              >
                ◀
              </button>
              {collapseTooltip && !isMobile && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                >
                  Collapse
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "6px",
            padding: "8px 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {(["library", "history", "archive"] as const).map((nextView) => {
            const active = view === nextView;
            return (
              <button
                key={nextView}
                onClick={() => onViewChange(nextView)}
                style={{
                  background: active ? "var(--violet-glow)" : "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: active ? "var(--violet-soft)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  minHeight: "44px",
                  textTransform: "capitalize",
                }}
              >
                {nextView}
              </button>
            );
          })}
        </div>
      )}

      {/* Tag bar — hidden in archive/history views */}
      {!isArchive && !isHistory && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            overflowX: "auto",
            padding: "10px 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            scrollbarWidth: "none",
          }}
        >
          {["all", ...tags].map((tag) => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onTagChange(tag)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: active ? `2px solid var(--violet)` : "2px solid transparent",
                  borderRadius: 0,
                  color: active ? "var(--text)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: active ? 600 : 400,
                  padding: "2px 6px 6px",
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  boxShadow: active ? `0 2px 8px var(--violet-glow)` : "none",
                  minHeight: "44px",
                  alignItems: "flex-end",
                  display: "flex",
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Items list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {isHistory ? (
          <AnimatePresence mode="popLayout">
            {watchHistory.map((entry) => (
              <motion.div
                key={entry.ytId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryCard
                  entry={entry}
                  isMobile={isMobile}
                  isActive={currentItem?.type === "video" && (currentItem as VideoItem).ytId === entry.ytId}
                  onSelect={() => onSelectHistory(entry)}
                  onRemove={() => removeWatchHistoryEntry(entry.ytId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => {
              const id = itemId(item);
              const isActive = currentItem ? itemId(currentItem) === id : false;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <LibraryCard
                    item={item}
                    isActive={isActive}
                    isArchive={isArchive}
                    isMobile={isMobile}
                    onSelect={() => {
                      if (isArchive) return;
                      if (item.type === "channel") {
                        onBrowseChannel(item as ChannelItem);
                      } else {
                        onSelect(item);
                      }
                    }}
                    onArchive={() => archiveItem(id)}
                    onRestore={() => restoreItem(id)}
                    onDelete={() => permanentlyDeleteItem(id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {(isHistory ? watchHistory.length === 0 : displayItems.length === 0) && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "40px 0" }}>
            {isHistory ? "No watch history yet." : isArchive ? "Your archive is empty." : "No items with this tag."}
          </div>
        )}
      </div>

    </div>
  );
}

function HistoryCard({
  entry,
  isActive,
  isMobile,
  onSelect,
  onRemove,
}: {
  entry: WatchHistoryItem;
  isActive: boolean;
  isMobile: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const ratio = entry.lastWatchedRatio > 0 ? Math.min(1, entry.lastWatchedRatio) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px",
        paddingLeft: isActive ? "5px" : "8px",
        borderRadius: "8px",
        cursor: "pointer",
        background: isActive ? "var(--surface-2)" : "transparent",
        border: `1px solid ${isActive ? "var(--violet)" : "transparent"}`,
        borderLeft: isActive ? "3px solid var(--violet)" : "1px solid transparent",
        transition: "background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        marginBottom: "2px",
      }}
      onClick={onSelect}
      onMouseEnter={isMobile ? undefined : (e) => {
        if (!isActive) {
          e.currentTarget.style.background = "var(--surface-2)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.12)";
        }
      }}
      onMouseLeave={isMobile ? undefined : (e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "";
        }
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: 80, height: 45, flexShrink: 0, borderRadius: "4px", overflow: "hidden", background: "var(--border)" }}>
          {entry.thumbnail && (
            <Image src={entry.thumbnail} alt={entry.title} fill style={{ objectFit: "cover" }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: isActive ? 500 : 400,
            lineHeight: 1.3,
            marginBottom: "3px",
            display: "-webkit-box",
            WebkitLineClamp: isMobile ? 2 : 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "anywhere",
          }}>
            {entry.title}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{entry.channelName}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from history"
          style={{
            background: "none",
            border: "none",
            color: isMobile ? "#f87171" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: isMobile ? "18px" : "14px",
            opacity: isMobile ? 0.8 : 0.55,
            minWidth: isMobile ? "44px" : undefined,
            minHeight: isMobile ? "44px" : undefined,
            padding: isMobile ? "8px" : "2px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      {ratio > 0 && (
        <div style={{ marginTop: "6px", height: "2px", background: "var(--border)", borderRadius: "1px" }}>
          <div
            style={{
              height: "100%",
              width: `${ratio * 100}%`,
              background: "var(--violet)",
              borderRadius: "1px",
            }}
          />
        </div>
      )}
    </div>
  );
}

function LibraryCard({
  item,
  isActive,
  isArchive,
  isMobile,
  onSelect,
  onArchive,
  onRestore,
  onDelete,
}: {
  item: LibraryItem;
  isActive: boolean;
  isArchive: boolean;
  isMobile: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const { customTags, updateItem, addCustomTag } = useLibrary();
  const [editing, setEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(item.tags);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [archiveTooltip, setArchiveTooltip] = useState(false);
  const [restoreTooltip, setRestoreTooltip] = useState(false);
  const [deleteTooltip, setDeleteTooltip] = useState(false);
  const [tagsTooltip, setTagsTooltip] = useState(false);

  const itemId =
    item.type === "video" ? (item as VideoItem).ytId :
    item.type === "playlist-channel" ? (item as PlaylistChannel).ytPlaylistId :
    (item as ChannelItem).channelId;

  const thumbnail = item.thumbnail;
  const title = item.title;
  const sub =
    item.type === "video"
      ? (item as VideoItem).channelName
      : item.type === "playlist-channel"
      ? `${(item as PlaylistChannel).videoCount > 0 ? `${(item as PlaylistChannel).videoCount} videos` : "Playlist"}`
      : "Channel";

  const handleEditOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTags([...item.tags]);
    setEditing(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem(itemId, { tags: editTags });
    editTags.forEach((t) => {
      if (!PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number]) && !customTags.includes(t)) {
        addCustomTag(t);
      }
    });
    setEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
  };

  const actionBtnStyle = (color: string, mobileOpacity = 1, desktopOpacity = 0.55) => ({
    background: "none" as const,
    border: "none" as const,
    color: isMobile ? color : "var(--text-muted)",
    cursor: "pointer" as const,
    fontSize: isMobile ? "16px" : "14px",
    lineHeight: 1,
    opacity: isMobile ? mobileOpacity : desktopOpacity,
    minWidth: isMobile ? "44px" : undefined,
    minHeight: isMobile ? "44px" : undefined,
    padding: isMobile ? "8px" : "2px",
    transition: isMobile ? undefined : "opacity 0.15s, color 0.15s",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px",
        paddingLeft: isActive ? "5px" : "8px",
        borderRadius: "8px",
        cursor: isArchive || editing ? "default" : "pointer",
        background: isActive ? "var(--surface-2)" : "transparent",
        border: `1px solid ${isActive ? "var(--violet)" : "transparent"}`,
        borderLeft: isActive ? "3px solid var(--violet)" : "1px solid transparent",
        transition: "background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        position: "relative",
        marginBottom: "2px",
      }}
      onClick={editing ? undefined : onSelect}
      onMouseEnter={(e) => {
        if (!isActive && !isArchive && !editing) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "var(--surface-2)";
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = "0 4px 16px rgba(124,58,237,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isArchive && !editing) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "transparent";
          el.style.transform = "";
          el.style.boxShadow = "";
        }
      }}
    >
      {/* Top row: thumbnail + info + action buttons */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {/* Thumbnail */}
        <div style={{ position: "relative", width: 80, height: 45, flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--border)" }} />
          )}
          {item.type === "playlist-channel" && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              background: "rgba(0,0,0,0.7)", fontSize: "9px", color: "#fff",
              padding: "1px 4px", borderTopLeftRadius: "3px",
            }}>
              ≡
            </div>
          )}
          {item.type === "channel" && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              background: "rgba(124,58,237,0.85)", fontSize: "9px", color: "#fff",
              padding: "1px 5px", borderTopLeftRadius: "3px", fontWeight: 600,
              letterSpacing: "0.03em",
            }}>
              CH
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px", color: "var(--text)", fontWeight: isActive ? 500 : 400,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1.3, marginBottom: "3px",
          }}>
            {title}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
          {!isArchive && !editing && item.tags.length > 0 && (
            <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "4px" }}>
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: "3px",
                    color: "var(--violet-soft)",
                    fontSize: "10px",
                    padding: "1px 5px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          {isArchive ? (
            <>
              {confirmingDelete ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    aria-label="Confirm delete"
                    style={{
                      background: "#f87171",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 8px",
                      lineHeight: 1.4,
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmingDelete(false); }}
                    aria-label="Cancel delete"
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "11px",
                      padding: "3px 8px",
                      lineHeight: 1.4,
                    }}
                  >
                    No
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{ position: "relative", display: "inline-flex" }}
                    onMouseEnter={() => setRestoreTooltip(true)}
                    onMouseLeave={() => setRestoreTooltip(false)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestore(); }}
                      aria-label="Restore"
                      style={actionBtnStyle("var(--violet-soft)")}
                      onMouseEnter={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--violet-soft)"; }}
                      onMouseLeave={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      ↺
                    </button>
                    {restoreTooltip && !isMobile && (
                      <div
                        style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                      >
                        Restore
                      </div>
                    )}
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-flex" }}
                    onMouseEnter={() => setDeleteTooltip(true)}
                    onMouseLeave={() => setDeleteTooltip(false)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true); }}
                      aria-label="Permanently Delete"
                      style={actionBtnStyle("#f87171")}
                      onMouseEnter={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#f87171"; }}
                      onMouseLeave={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      🗑
                    </button>
                    {deleteTooltip && !isMobile && (
                      <div
                        style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : editing ? (
            <>
              <button
                onClick={handleSave}
                aria-label="Save tags"
                style={{
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: "20px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "3px 10px",
                  lineHeight: 1.4,
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                aria-label="Cancel editing"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "3px 10px",
                  lineHeight: 1.4,
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div
                style={{ position: "relative", display: "inline-flex" }}
                onMouseEnter={() => setTagsTooltip(true)}
                onMouseLeave={() => setTagsTooltip(false)}
              >
                <button
                  onClick={handleEditOpen}
                  aria-label="Edit tags"
                  style={{
                    background: "none",
                    border: "none",
                    color: isMobile ? "var(--text-muted)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "11px",
                    opacity: isMobile ? 0.7 : 0.55,
                    padding: isMobile ? "8px 10px" : "2px 6px",
                    transition: isMobile ? undefined : "opacity 0.15s, color 0.15s",
                    lineHeight: 1.4,
                    minWidth: isMobile ? "44px" : undefined,
                    minHeight: isMobile ? "44px" : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--violet-soft)"; }}
                  onMouseLeave={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  # Tags
                </button>
                {tagsTooltip && !isMobile && (
                  <div
                    style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                  >
                    Edit tags
                  </div>
                )}
              </div>
              <div
                style={{ position: "relative", display: "inline-flex" }}
                onMouseEnter={() => setArchiveTooltip(true)}
                onMouseLeave={() => setArchiveTooltip(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onArchive(); }}
                  aria-label="Archive item"
                  style={actionBtnStyle("#f87171", 0.7)}
                  onMouseEnter={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#f87171"; }}
                  onMouseLeave={isMobile ? undefined : (e) => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  ⊟
                </button>
                {archiveTooltip && !isMobile && (
                  <div
                    style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", padding: "3px 7px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}
                  >
                    Archive
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Watch progress bar — video items only, shown when ratio > 0 */}
      {item.type === "video" && !isArchive && !editing && !!((item as VideoItem).lastWatchedRatio) && (
        <div style={{ marginTop: "6px", height: "2px", background: "var(--border)", borderRadius: "1px" }}>
          <div
            style={{
              height: "100%",
              width: `${((item as VideoItem).lastWatchedRatio ?? 0) * 100}%`,
              background: "var(--violet)",
              borderRadius: "1px",
            }}
          />
        </div>
      )}

      {/* Inline tag editor */}
      {editing && (
        <div
          style={{ marginTop: "10px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <TagPicker
            selected={editTags}
            customTags={customTags}
            onChange={setEditTags}
          />
        </div>
      )}
    </div>
  );
}
