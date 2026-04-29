## 1. Data Model and Storage

- [x] 1.1 Add `WatchHistoryItem` and source context types to `src/types/library.ts`.
- [x] 1.2 Extend `LibraryData` with `watchHistory: WatchHistoryItem[]`.
- [x] 1.3 Update default library state and storage reads so missing legacy `watchHistory` defaults to an empty array.
- [x] 1.4 Add helpers to upsert, sort, and prune watch history by newest `lastWatchedAt`, maximum 50 entries, and maximum age 180 days.

## 2. Library Context Operations

- [x] 2.1 Expose `watchHistory`, `updateWatchProgress`, `removeWatchHistoryEntry`, and `getWatchHistoryEntry` from `LibraryContext`.
- [x] 2.2 Replace or extend `updateVideoPosition` so saved `VideoItem` progress and watch history are updated together from one persistence path.
- [x] 2.3 Ensure the 95% completion reset stores `lastPosition: 0` and `lastWatchedRatio: 0` in both saved video progress and history.
- [x] 2.4 Ensure removing a history entry does not delete or mutate any saved library item with the same `ytId`.
- [x] 2.5 Ensure a saved `lastPosition` of 0 is treated as authoritative and never as a missing value.

## 3. Playback Integration

- [x] 3.1 Pass enough video metadata and source context into playback for library, channel, and history videos.
- [x] 3.2 Update playback start handling so every individual video creates or refreshes a watch history entry immediately.
- [x] 3.3 Update `usePlayer` progress saving so every individual video playback updates watch history on the existing periodic and pause saves.
- [x] 3.4 Update video loading so item `lastPosition` is used first, then watch history `lastPosition` is used as fallback only when item progress is absent.
- [x] 3.5 Restore channel playback context when a selected history entry has saved channel source context.
- [x] 3.6 Ensure playlist-channel playback behavior is unchanged and does not create individual watch history entries.

## 4. History View UI

- [x] 4.1 Add a History view entry point alongside the existing library/archive navigation.
- [x] 4.2 Render watch history rows ordered by newest `lastWatchedAt` first with thumbnail, title, channel name, and progress bar when applicable.
- [x] 4.3 Make selecting a history row play the video from its saved history position without adding it to the library.
- [x] 4.4 Add an empty History state for users with no watch history.
- [x] 4.5 Add a remove-from-history action that is available on desktop and mobile.
- [x] 4.6 Ensure History is reachable from both the desktop library panel and the mobile library sheet.
- [x] 4.7 Ensure mobile history rows use stable thumbnail dimensions, readable two-line title truncation, visible channel metadata, and no hover-only controls.

## 5. Channel Browse Integration

- [x] 5.1 Pass watch history data into `ChannelBrowseModal`.
- [x] 5.2 Show a thin progress indicator on channel video rows with matching history progress.
- [x] 5.3 Ensure channel video selection resumes from matching history position when present.
- [x] 5.4 Ensure watching a channel video updates history without saving the video as a library item.

## 6. Export and Import

- [x] 6.1 Include `watchHistory` in exported library JSON.
- [x] 6.2 Sanitize imported watch history entries, including `ytId`, metadata strings, numeric timestamps/positions, ratios, and allowed thumbnail hosts.
- [x] 6.3 In replace mode, replace watch history with sanitized imported history and prune it.
- [x] 6.4 In merge mode, merge watch history by `ytId`, keep the newest `lastWatchedAt`, and prune the merged result.

## 7. Verification

- [ ] 7.1 Verify a saved library video still saves and displays progress as before.
- [ ] 7.2 Verify a channel video creates history, resumes from history, and shows progress in the channel modal.
- [ ] 7.3 Verify History view playback does not add videos to the library.
- [ ] 7.4 Verify history retention removes entries beyond 50 and older than 180 days.
- [ ] 7.5 Verify a completed saved video with `lastPosition: 0` does not resume from stale history.
- [ ] 7.6 Verify legacy imports without `watchHistory` still work.
- [ ] 7.7 Verify removing a history entry does not affect saved card progress for the same `ytId`.
- [ ] 7.8 Verify History is reachable and usable on desktop width, mobile portrait width, and mobile landscape/small-height layout.
- [ ] 7.9 Verify mobile History rows do not overlap controls, preserve readable title/channel text, and keep remove actions visible without hover.
- [ ] 7.10 Verify selecting a history entry from the mobile sheet closes the sheet and keeps playback controls accessible.
- [x] 7.11 Run lint/build checks required for this repo.
