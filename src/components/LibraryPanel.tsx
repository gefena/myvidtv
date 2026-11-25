"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/useLibrary";
import { TagPicker } from "./TagPicker";
import { PREDEFINED_TAGS } from "@/lib/constants";
import { getHistoryBadge, getHistoryKey, getHistoryMediaType, getLibraryItemId, getLibraryItemSubtitle, isLibraryItemActive } from "@/lib/mediaItems";
import { useIsTouch } from "@/hooks/useLayout";
import type { Layout } from "@/hooks/useLayout";
import type { LibraryItem, VideoItem, ChannelItem, PodcastItem, WatchHistoryItem } from "@/types/library";

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
  layout?: Layout;
  bottomInset?: number | string;
  onBrowseChannel: (item: ChannelItem) => void;
  onBrowsePodcast: (item: PodcastItem) => void;
  onSelectHistory: (item: WatchHistoryItem) => void;
};

function itemId(item: LibraryItem) {
  return getLibraryItemId(item);
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
  layout = "desktop",
  bottomInset = 0,
  onBrowseChannel,
  onBrowsePodcast,
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

  // phone-only behavior (sheet, mobile-specific nav)
  const isMobile = layout === "phone";
  // touch sizing and no-hover treatment derived from pointer capability
  const isTouch = useIsTouch();

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
        borderLeft: layout === "phone" ? "none" : "1px solid var(--border)",
        width: layout === "desktop" ? "320px" : "100%",
      }}
    >
      {/* Panel header — hidden on phone (sheet header in AppShell takes over) */}
      {layout !== "phone" && (
        <div
          style={{
            display: "flex",
            flexWrap: layout === "tablet" ? "wrap" : "nowrap",
            alignItems: "center",
            justifyContent: "space-between",
            rowGap: layout === "tablet" ? "2px" : undefined,
            padding: layout === "tablet" ? "2px 10px" : "0 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            minHeight: "44px",
          }}
        >
          {/* Tab row: Library / History / Archive */}
          <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
            {(["library", "history", "archive"] as const).map((v) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  onClick={() => onViewChange(v)}
                  aria-pressed={active}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: active ? "2px solid var(--violet)" : "2px solid transparent",
                    borderRadius: 0,
                    color: active ? "var(--text)" : "var(--text-dim)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: active ? 500 : 400,
                    padding: "12px 8px 10px",
                    textTransform: "capitalize",
                    transition: "color 0.15s, border-color 0.15s",
                    lineHeight: 1,
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Utility buttons: Export / Import / Collapse */}
          <div style={{ display: "flex", gap: "6px", ...(layout === "tablet" && { marginLeft: "auto" }) }}>
            {!isArchive && onExport && (
              <button
                onClick={onExport}
                aria-label="Export library"
                title="Export library"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "3px 7px",
                  minWidth: isTouch ? (layout === "tablet" ? "40px" : "44px") : "28px",
                  minHeight: isTouch ? (layout === "tablet" ? "40px" : "44px") : "28px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span aria-hidden="true">↓</span>
              </button>
            )}
            {!isArchive && onImport && (
              <button
                onClick={onImport}
                aria-label="Import library"
                title="Import library"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "3px 7px",
                  minWidth: isTouch ? (layout === "tablet" ? "40px" : "44px") : "28px",
                  minHeight: isTouch ? (layout === "tablet" ? "40px" : "44px") : "28px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span aria-hidden="true">↑</span>
              </button>
            )}
            {layout === "desktop" && (
              <button
                onClick={onCollapse}
                aria-label="Collapse library"
                title="Collapse library"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "3px 7px",
                  minWidth: "28px",
                  minHeight: "28px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span aria-hidden="true">◀</span>
              </button>
            )}
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
                aria-pressed={active}
                style={{
                  background: active ? "var(--violet-glow)" : "none",
                  border: `1px solid ${active ? "var(--border-hi)" : "var(--border)"}`,
                  borderRadius: "4px",
                  color: active ? "var(--violet-soft)" : "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: active ? 600 : 400,
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
                  color: active ? "var(--text)" : isMobile ? "var(--text-dim)" : "var(--text-muted)",
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
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          ...(typeof bottomInset === "string"
            ? {
                paddingBottom: bottomInset,
                scrollPaddingBottom: bottomInset,
              }
            : bottomInset > 0 && {
                paddingBottom: `calc(${bottomInset}px + env(safe-area-inset-bottom, 0px))`,
                scrollPaddingBottom: `calc(${bottomInset}px + env(safe-area-inset-bottom, 0px))`,
              }),
        }}
      >
        {isHistory ? (
          <AnimatePresence mode="popLayout">
            {watchHistory.map((entry) => (
              <motion.div
                key={getHistoryKey(entry)}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryCard
                  entry={entry}
                  isMobile={isTouch}
                  isActive={
                    (currentItem?.type === "video" && getHistoryMediaType(entry) === "youtube" && (currentItem as VideoItem).ytId === entry.ytId) ||
                    (currentItem?.type === "podcast-episode" && entry.mediaType === "podcast" && currentItem.episodeId === entry.ytId)
                  }
                  onSelect={() => onSelectHistory(entry)}
                  onRemove={() => removeWatchHistoryEntry(entry.ytId, getHistoryMediaType(entry))}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => {
              const id = itemId(item);
              const isActive = !isArchive && isLibraryItemActive(item, currentItem, displayItems);
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
                    isMobile={isTouch}
                    layout={layout}
                    onSelect={() => {
                      if (isArchive) return;
                      if (item.type === "channel") {
                        onBrowseChannel(item as ChannelItem);
                      } else if (item.type === "podcast") {
                        onBrowsePodcast(item as PodcastItem);
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
  const [hovered, setHovered] = useState(false);
  const ratio = entry.lastWatchedRatio > 0 ? Math.min(1, entry.lastWatchedRatio) : 0;

  return (
    <div
      data-active={isActive ? "true" : undefined}
      aria-current={isActive ? "true" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px",
        paddingLeft: isActive ? "6px" : "8px",
        borderRadius: "8px",
        cursor: "pointer",
        background: isActive ? "var(--row-active-bg)" : hovered ? "var(--surface-2)" : "transparent",
        border: `1px solid ${isActive ? "var(--row-active-border)" : "transparent"}`,
        borderLeft: isActive ? "4px solid var(--violet)" : "1px solid transparent",
        boxShadow: isActive ? "var(--row-active-shadow)" : hovered ? "0 4px 16px rgba(124,58,237,0.12)" : "none",
        transform: !isActive && hovered ? "translateY(-1px)" : "none",
        transition: "background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        marginBottom: "3px",
      }}
      onClick={onSelect}
      onMouseEnter={isMobile ? undefined : () => setHovered(true)}
      onMouseLeave={isMobile ? undefined : () => setHovered(false)}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: 80, height: 45, flexShrink: 0, borderRadius: "4px", overflow: "hidden", background: "var(--border)" }}>
          {entry.thumbnail && (
            getHistoryMediaType(entry) === "podcast" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.thumbnail}
                alt={entry.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <Image src={entry.thumbnail} alt={entry.title} fill sizes="80px" style={{ objectFit: "cover" }} />
            )
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: isActive ? 600 : 400,
            lineHeight: 1.3,
            marginBottom: "3px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "anywhere",
          }}>
            {entry.title}
          </div>
          <div style={{ fontSize: "11px", color: isActive ? "var(--text-dim)" : "var(--text-muted)" }}>{entry.channelName}</div>
          <div style={{ marginTop: "4px", display: "inline-flex", background: "var(--chip)", borderRadius: "3px", color: "var(--violet-soft)", fontSize: "9px", fontWeight: 600, padding: "1px 5px", letterSpacing: "0.03em" }}>
            {getHistoryBadge(entry)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from history"
          title="Remove from history"
          style={{
            background: "none",
            border: "none",
            color: isMobile ? "#f87171" : "var(--text-dim)",
            cursor: "pointer",
            fontSize: isMobile ? "18px" : "14px",
            opacity: isMobile ? 0.85 : hovered ? 1 : 0.65,
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
  layout = "desktop",
  onSelect,
  onArchive,
  onRestore,
  onDelete,
}: {
  item: LibraryItem;
  isActive: boolean;
  isArchive: boolean;
  isMobile: boolean;
  layout?: Layout;
  onSelect: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const { customTags, updateItem, addCustomTag } = useLibrary();
  const [editing, setEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(item.tags);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [hovered, setHovered] = useState(false);
  const [focusedWithin, setFocusedWithin] = useState(false);

  const itemId = getLibraryItemId(item);

  const thumbnail = item.thumbnail;
  const title = item.title;
  const sub = getLibraryItemSubtitle(item);
  const showDesktopActions = hovered || focusedWithin || editing || confirmingDelete;

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

  const actionBtnStyle = (color: string, mobileOpacity = 1) => ({
    background: "none" as const,
    border: "none" as const,
    color: isMobile ? color : "var(--text-dim)",
    cursor: "pointer" as const,
    fontSize: isMobile ? "16px" : "14px",
    lineHeight: 1,
    opacity: isMobile ? mobileOpacity : showDesktopActions ? 1 : 0,
    minWidth: isMobile ? "44px" : "24px",
    minHeight: isMobile ? "44px" : "24px",
    padding: isMobile ? "8px" : "2px 4px",
    transition: isMobile ? undefined : "opacity 0.15s, color 0.15s",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  });

  const actionButtons = isArchive ? (
    <>
      {confirmingDelete ? (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Confirm delete"
            title="Confirm delete"
            style={{
              background: "#f87171",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              padding: isMobile ? "8px 12px" : "3px 8px",
              minHeight: isMobile ? "40px" : undefined,
              lineHeight: 1.4,
            }}
          >
            Delete
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmingDelete(false); }}
            aria-label="Cancel delete"
            title="Cancel delete"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: isMobile ? "var(--text-dim)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: "11px",
              padding: isMobile ? "8px 12px" : "3px 8px",
              minHeight: isMobile ? "40px" : undefined,
              lineHeight: 1.4,
            }}
          >
            No
          </button>
        </>
      ) : (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onRestore(); }}
            aria-label="Restore"
            title="Restore"
            style={actionBtnStyle("var(--violet-soft)")}
          >
            ↺
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true); }}
            aria-label="Permanently Delete"
            title="Permanently delete"
            style={actionBtnStyle("#f87171")}
          >
            🗑
          </button>
        </>
      )}
    </>
  ) : editing ? (
    <>
      <button
        onClick={handleSave}
        aria-label="Save tags"
        title="Save tags"
        style={{
          background: "var(--violet)",
          border: "none",
          borderRadius: "20px",
          color: "#fff",
          cursor: "pointer",
          fontSize: "11px",
          padding: isMobile ? "8px 14px" : "3px 10px",
          minHeight: isMobile ? "40px" : undefined,
          lineHeight: 1.4,
        }}
      >
        Save
      </button>
      <button
        onClick={handleCancel}
        aria-label="Cancel editing"
        title="Cancel editing"
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          color: isMobile ? "var(--text-dim)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: "11px",
          padding: isMobile ? "8px 14px" : "3px 10px",
          minHeight: isMobile ? "40px" : undefined,
          lineHeight: 1.4,
        }}
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      <button
        onClick={handleEditOpen}
        aria-label="Edit tags"
        title="Edit tags"
        style={{
          background: "none",
          border: "none",
          color: "var(--text-dim)",
          cursor: "pointer",
          fontSize: "11px",
          opacity: isMobile ? 0.75 : showDesktopActions ? 1 : 0,
          padding: isMobile ? "8px 10px" : "2px 6px",
          transition: isMobile ? undefined : "opacity 0.15s, color 0.15s",
          lineHeight: 1.4,
          minWidth: isMobile ? "44px" : undefined,
          minHeight: isMobile ? "44px" : "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        # Tags
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onArchive(); }}
        aria-label="Archive item"
        title="Archive item"
        style={actionBtnStyle("#f87171", 0.75)}
      >
        ⊟
      </button>
    </>
  );

  const visibleTags = !isArchive && !editing && item.tags.length > 0 ? item.tags.slice(0, 3) : [];

  return (
    <div
      data-testid="library-card"
      data-active={isActive ? "true" : undefined}
      aria-current={isActive ? "true" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px",
        paddingLeft: isActive ? "6px" : "8px",
        borderRadius: "8px",
        cursor: isArchive || editing ? "default" : "pointer",
        background: isActive ? "var(--row-active-bg)" : hovered && !isArchive && !editing ? "var(--surface-2)" : "transparent",
        border: `1px solid ${isActive ? "var(--row-active-border)" : "transparent"}`,
        borderLeft: isActive ? "4px solid var(--violet)" : "1px solid transparent",
        boxShadow: isActive
          ? "var(--row-active-shadow)"
          : hovered && !isArchive && !editing
          ? "0 4px 16px rgba(124,58,237,0.12)"
          : "none",
        transform: !isActive && hovered && !isArchive && !editing ? "translateY(-1px)" : "none",
        transition: "background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        position: "relative",
        marginBottom: "3px",
      }}
      onClick={editing ? undefined : onSelect}
      onMouseEnter={isMobile ? undefined : () => setHovered(true)}
      onMouseLeave={isMobile ? undefined : () => setHovered(false)}
      onFocus={isMobile ? undefined : () => setFocusedWithin(true)}
      onBlur={isMobile ? undefined : (e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusedWithin(false);
        }
      }}
    >
      {/* Top row: thumbnail + full-width 2-line title & subtitle */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {/* Thumbnail */}
        <div style={{ position: "relative", width: 80, height: 45, flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
          {thumbnail && (item.type === "podcast" || item.type === "podcast-episode") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : thumbnail ? (
            <Image src={thumbnail} alt={title} fill sizes="80px" style={{ objectFit: "cover" }} />
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
          {item.type === "podcast" && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              background: "rgba(16,185,129,0.85)", fontSize: "9px", color: "#fff",
              padding: "1px 5px", borderTopLeftRadius: "3px", fontWeight: 600,
              letterSpacing: "0.03em",
            }}>
              POD
            </div>
          )}
        </div>

        {/* Info — gets full remaining width with 2-line title clamp */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: isActive ? 600 : 400,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "anywhere",
            lineHeight: 1.3,
            marginBottom: "3px",
          }}>
            {title}
          </div>
          <div
            style={
              layout !== "desktop"
                ? { fontSize: "11px", color: isActive ? "var(--text-dim)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                : { fontSize: "11px", color: isActive ? "var(--text-dim)" : "var(--text-muted)" }
            }
          >
            {sub}
          </div>
        </div>
      </div>

      {/* Second row: tags on the left + row actions on the right (hover/focus revealed on desktop) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          marginTop: isMobile ? "2px" : "4px",
          minHeight: isMobile ? undefined : "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", minWidth: 0 }}>
          {isActive && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "var(--violet-glow)",
                border: "1px solid var(--border-hi)",
                borderRadius: "3px",
                color: "var(--violet-soft)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "1px 5px",
              }}
            >
              Playing
            </span>
          )}
          {visibleTags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "var(--chip)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {actionButtons}
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
