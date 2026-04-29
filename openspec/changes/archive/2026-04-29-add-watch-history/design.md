## Context

MyVidTV stores the user's library entirely in browser `localStorage` as `LibraryData`. Saved `VideoItem`s already store `lastPosition` and `lastWatchedRatio`, and the player periodically saves progress for individual videos. Channel browse videos are different: selecting one creates a transient `VideoItem` for playback, but it is not inserted into `library.items`, so the existing progress update has no persisted item to mutate.

The product need is broader than channel progress. Users may want to return to something they watched recently regardless of where playback started. Watch history should therefore be independent of library membership while still integrating with existing saved video progress.

## Goals / Non-Goals

**Goals:**
- Persist recent watched videos from any individual video playback source.
- Resume transient channel videos from watch history.
- Show watched progress in the channel browse modal.
- Provide a History view for returning to recent watched videos.
- Keep storage bounded with both count and age retention.
- Preserve history through export/import.

**Non-Goals:**
- Do not add watched channel videos to the main library automatically.
- Do not track progress inside YouTube playlist-channel playback, where individual playlist item identity is not currently modeled by the app.
- Do not introduce a backend, account system, external database, or new dependency.
- Do not track cross-device history beyond manual export/import.

## Decisions

### Store Watch History as Top-Level Library Data

Add `watchHistory: WatchHistoryItem[]` to `LibraryData`.

```ts
type WatchHistoryItem = {
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  lastPosition: number;
  lastWatchedRatio: number;
  firstWatchedAt: number;
  lastWatchedAt: number;
  source?: {
    type: "library" | "channel" | "history" | "unknown";
    channelId?: string;
  };
};
```

Rationale: top-level history avoids polluting `items` with videos the user did not intentionally save, and avoids coupling history to saved channels. It also supports future entry points that are not channel-specific.

Alternative considered: store progress under each `ChannelItem`. Rejected because the same video can be watched through multiple paths, and history should answer "what did I watch?" rather than "which channel did I watch it from?"

### Retain the Last 50 Items and Last 180 Days

After each history write or import merge, prune history by sorting descending by `lastWatchedAt`, dropping entries older than 180 days, and keeping at most 50 items.

Rationale: this keeps `localStorage` and exported JSON small while preserving useful recent history.

Alternative considered: count-only retention. Rejected because old rarely watched entries could linger forever if the user watches infrequently.

### Keep Saved Video Progress and Watch History in Sync

When an individual video's position is saved:
- Update matching saved `VideoItem` progress if the video exists in active library items.
- Upsert the corresponding watch history record for all individual video playback, including transient channel/history videos.
- Apply the same 95% completion reset to both saved item progress and history progress.

When an individual video starts playback, create or refresh its watch history entry immediately with `lastPosition: 0` and `lastWatchedRatio: 0` if no newer progress is known. This ensures History reflects videos the user actually opened even if they leave before the first 10-second progress save.

Rationale: saved video cards keep their current behavior, while unsaved videos gain persistence through history.

Alternative considered: replace `VideoItem.lastPosition` with history as the sole source of progress. Rejected because existing specs and UI already rely on `VideoItem` progress and because keeping this scoped reduces migration risk.

### Resume From Item Progress First, History Second

When loading a `VideoItem`, use `lastPosition` on the item if present. If no item progress exists, look up watch history by `ytId` and use that `lastPosition`.

Rationale: saved library metadata remains authoritative for saved items, while transient channel/history playback can resume without needing a saved library item.

`lastPosition: 0` is an authoritative saved position, not a missing value. A saved item or history entry with `lastPosition: 0` must start from the beginning and must not fall through to an older fallback position.

### History View Is a Library Panel View, Not a Library Item Type

Add a History view alongside existing library/archive navigation. History rows should use video-like metadata and progress UI, but they are not `LibraryItem`s and do not support tags/archive actions. Selecting a history row plays the video as an individual transient video.

Rationale: users can return to recent videos without changing their curated library.

If a history entry's most recent source is a saved channel and includes `source.channelId`, replaying that entry should restore channel playback context so existing back-to-channel affordances continue to work. History entries without channel source context play as plain individual videos.

### Responsive History UI

History uses the existing library panel surface on desktop and the existing bottom-sheet library surface on mobile. The same History entry point must be available in both places. On mobile, history rows should follow the existing channel/list row pattern: stable thumbnail dimensions, title across up to two readable lines, channel/metadata below, and a single row-level tap target for playback. The remove-from-history action must be touch-accessible without relying on hover.

Rationale: the app already has separate desktop and mobile library surfaces. Reusing those surfaces avoids a new navigation model and keeps History reachable while preserving the player-first mobile layout.

Alternative considered: make History a separate modal. Rejected because it would compete with the channel browse modal and would add another mobile overlay pattern.

### Export and Import Preserve History

Exports include `watchHistory`. Imports sanitize history entries similarly to video items: valid `ytId`, string metadata, allowed thumbnail host, numeric timestamps/positions. Replace mode replaces history. Merge mode combines by `ytId`, keeping the entry with the newest `lastWatchedAt`, then prunes by retention.

Rationale: history is part of the user's local viewing state and should survive backup/restore without allowing malformed data into storage.

## Risks / Trade-offs

- [Risk] History write frequency increases `localStorage` writes because progress is saved periodically. → Mitigation: reuse the existing 10-second save cadence and only write from the existing progress persistence path.
- [Risk] Saved item and history progress can diverge if one path is updated without the other. → Mitigation: centralize progress persistence in a single library context operation that updates both.
- [Risk] History UI could be confused with saved library items. → Mitigation: render History as a separate view and omit tag/archive actions from history rows.
- [Risk] Imported legacy libraries lack `watchHistory`. → Mitigation: default missing `watchHistory` to an empty array in storage reads and import sanitation.
- [Risk] The same video watched from different sources has only one history row. → Mitigation: key by `ytId`; source metadata is informational and may reflect the most recent source.
- [Risk] History controls may be reachable on desktop but cramped or hidden on mobile. → Mitigation: specify History access and remove actions for both desktop panel and mobile sheet, with mobile touch targets and readable two-line titles.
