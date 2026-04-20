## Why

When a user browses a channel and plays a video, the channel browse modal closes and the navigation stack is lost — on mobile especially, there is no natural way to get back to the channel list without reopening the library sheet and finding the channel again. The expected mobile behavior is a simple "back" gesture or button that returns you to where you came from.

## What Changes

- Mobile peek bar becomes context-aware: when playing a channel video, "☰ Library" changes to "← [Channel Name]" (and "← More from [Channel Name]" once the video ends), tapping it reopens the channel browse modal directly.
- Desktop now-playing bar: the channel name sub-line becomes a clickable button when the playing video originated from a channel browse.
- Channel context (`channelId` + `title`) is tracked in AppShell and set when a channel video is selected; cleared when the user picks a non-channel item from the library.
- `ChannelBrowseModal` is lifted from `LibraryPanel` to `AppShell` so it can be triggered from both the peek bar and the library panel.
- PlayerArea gains an `onVideoEnd` callback (or exposes ended state) so the peek bar label can switch to the nudge form after playback stops.

## Capabilities

### New Capabilities
- `channel-playback-context`: Tracks which channel a playing video came from and surfaces a direct back-to-channel affordance in both mobile and desktop playback UIs.

### Modified Capabilities
- `channel-browsing`: ChannelBrowseModal moves up to AppShell scope; behavior unchanged but triggering surface expands.
- `mobile-layout`: Peek bar gains conditional rendering based on channel context.

## Impact

- `src/components/AppShell.tsx` — new `channelContext` state, lifted `ChannelBrowseModal`, updated peek bar rendering
- `src/components/LibraryPanel.tsx` — remove local `browseChannel` state and `ChannelBrowseModal` rendering; pass an `onBrowseChannel` callback instead
- `src/components/PlayerArea.tsx` — accept `channelContext` + `onOpenChannel` props; make channel name clickable on desktop
- `src/hooks/usePlayer.ts` — expose `ended` boolean or fire a callback when playback finishes naturally
