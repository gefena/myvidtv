## Context

When a user opens a channel's browse modal and selects a video, the modal closes and a transient `VideoItem` is passed to the player. The channel identity (`channelId`, `title`) is discarded at that point — only the display string `channelName` survives on the item. There is no back path.

On mobile the library is behind a bottom sheet, so recovery requires 3+ taps. On desktop the library panel is visible but the channel card still needs to be located. The fix is to retain the channel context through playback and surface a one-tap affordance.

## Goals / Non-Goals

**Goals:**
- Remember which channel a playing video came from, while that video is playing.
- Mobile: replace the Library peek bar label with a direct back-to-channel button.
- Mobile: switch that label to a nudge ("← More from …") when the video ends naturally.
- Desktop: make the channel name in the now-playing bar a clickable button when channel context exists.
- `ChannelBrowseModal` opens fresh from the top (no scroll state — RSS is newest-first).

**Non-Goals:**
- Preserving channel browse scroll position.
- Auto-advancing to the next channel video after the current one ends.
- Persisting channel context across page reloads.
- Any change to how channel videos are added to the library.

## Decisions

### 1. Channel context lives in AppShell state

`channelContext: { channelId: string; title: string } | null` in `AppShell`.

**Why here and not in the item:** The transient `VideoItem` is intentionally ephemeral (not saved to localStorage). Annotating it with a `sourceChannelId` would blur the line between library data and navigation state. AppShell already owns `currentItem` and handles selection — it's the right place to track "where we came from."

**Why not in a hook or context:** Overkill for a single nullable value with a clear lifecycle tied to `currentItem` changes in AppShell.

**Lifecycle:** Set by a dedicated `handleChannelVideoSelect` function (called from ChannelBrowseModal's `onPlay`). `handleSelectItem` (library picks) always clears it — no inference about item type needed. `handleItemEnd` (auto-advance) also clears it.

### 2. ChannelBrowseModal lifts from LibraryPanel to AppShell

Currently `LibraryPanel` owns `browseChannel` state and renders the modal. To let the peek bar (also in AppShell) reopen the modal, the modal must live at the AppShell level.

`LibraryPanel` gets an `onBrowseChannel: (item: ChannelItem) => void` prop instead of managing the modal itself. AppShell holds `browseChannelItem` state and renders the modal once.

**Why not a portal or event bus:** Direct prop drilling is simplest and consistent with how modals already work in this codebase (`AddFlow`, `ImportConfirm`).

### 3. `ended` lives in AppShell, signalled via callback

The peek bar needs to switch from "← Channel" to "← More from Channel" when playback stops naturally. `usePlayer` already tracks `playing: boolean` but doesn't distinguish "never started / paused" from "ended".

Rather than threading an `ended` boolean up from `usePlayer` → `PlayerArea` → `AppShell` as a prop, `PlayerArea` accepts an `onEnded?: () => void` callback. `AppShell` owns `ended: boolean` state, set to `true` by that callback and reset to `false` in `handleSelectItem` and `handleItemEnd`. The peek bar reads AppShell's own `ended` directly — no prop threading needed, and the reset happens automatically at the right moments.

**Why not infer from `playing === false`:** `playing` is false both when paused and when ended. A separate flag avoids a false nudge while the user is just paused mid-video.

### 4. Peek bar mutation (mobile only)

The existing Library peek bar button in AppShell is conditionally rendered. Both `channelContext` and `ended` are AppShell state, so the peek bar reads them directly:

- `channelContext` set, `!ended` → label: `← [channelContext.title]`, action: open ChannelBrowseModal
- `channelContext` set, `ended` → label: `← More from [channelContext.title]`, same action
- `channelContext` null → unchanged "☰ Library" behavior

### 5. Desktop: clickable channel name in now-playing bar

`PlayerArea` receives two optional props: `channelContext` and `onOpenChannel`. When both are present, the `channelName` sub-line in the now-playing bar renders as a button styled as a muted underlined link. On the listen bar the same treatment applies.

## Risks / Trade-offs

**Channel context goes stale if the user navigates away and back** — if the user picks a library video, then plays a channel video via the library sheet, `channelContext` is set correctly. But if auto-advance kicks in (channel video ends → next library item plays), `channelContext` is NOT cleared automatically. The nudge label would persist incorrectly.

Mitigation: Clear `channelContext` in `handleSelectItem` only when the item is not from a channel. For `onItemEnd` (auto-advance), also clear `channelContext` since the new item is a library item, not a channel browse video.

**Title truncation in peek bar** — long channel names will overflow the single-line peek bar on small screens.

Mitigation: apply `overflow: hidden; text-overflow: ellipsis` on the label, same as other truncated text in the app.
