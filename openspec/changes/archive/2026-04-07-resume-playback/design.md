## Context

Users currently lose their playback position when switching videos or reloading the app. We need a lightweight way to persist and resume playback for individual video items using the existing `localStorage` data model.

## Goals / Non-Goals

**Goals:**
- Automatically resume videos from the last saved position.
- Save progress periodically to survive crashes/reloads.

**Non-Goals:**
- Playback resume for `PlaylistChannel` items.
- Multiple resume points (bookmarks) per video.
- Visual progress bar on library thumbnails (the YouTube player already shows its own bar).
- Syncing resume points between devices (MyVidTV is local-only).

## Decisions

### 1. Data Model: Add `lastPosition` to `VideoItem`
- **Decision:** Store `lastPosition` as a number (seconds) directly on the `VideoItem` object.
- **Rationale:** Keeps the data localized with the video and simplifies resumption during initial load.
- **Alternatives:** A separate key-value store for progress. This would keep the library data "cleaner" but is not necessary given the simplicity of the requirement.

### 2. Save Strategy: Periodic + Event-based
- **Decision:** Save progress every 10 seconds during playback and immediately upon pause.
- **Rationale:** 10 seconds is a good balance between data accuracy and `localStorage` write frequency. Saving on pause captures the most common intentional stop.

### 3. The 95% Reset Rule
- **Decision:** If progress reaches 95% of total duration, save `lastPosition` as 0.
- **Rationale:** Prevents "stuck at end" loops and mimics standard streaming behavior where credits mark completion.

### 4. Implementation in `usePlayer`
- **Decision:** Use the existing `progress` interval to periodically call a new `updateVideoPosition` method from the library context.
- **Rationale:** Avoids creating redundant intervals.

## Risks / Trade-offs

- [Risk] → **localStorage churn**: Frequent writes could theoretically impact performance or storage life (unlikely on modern SSDs for small JSON objects).
- Mitigation → Throttle writes to 10-second intervals.
- [Risk] → **Race Conditions**: `seekTo` being called before the YouTube player is fully loaded.
- Mitigation → Use the `startSeconds` property in `loadVideoById` for the initial load, which is handled natively by the YouTube API.
