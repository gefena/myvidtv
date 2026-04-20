## 1. Expose `ended` signal from usePlayer

- [x] 1.1 Add `onEnded?: () => void` prop to `PlayerArea`
- [x] 1.2 In `usePlayer`, call `onEnded` when the YouTube player fires `onStateChange` with `YT.PlayerState.ENDED`

## 2. Lift ChannelBrowseModal to AppShell

- [x] 2.1 Add `onBrowseChannel: (item: ChannelItem) => void` prop to `LibraryPanel`
- [x] 2.2 Remove local `browseChannel` state and `ChannelBrowseModal` render from `LibraryPanel`; call `onBrowseChannel` instead
- [x] 2.3 Add `browseChannelItem: ChannelItem | null` state to `AppShell`
- [x] 2.4 Pass `onBrowseChannel` from AppShell to LibraryPanel; render `ChannelBrowseModal` in AppShell when `browseChannelItem` is set

## 3. Add channel context and ended state to AppShell

- [x] 3.1 Add `channelContext: { channelId: string; title: string } | null` state to `AppShell`
- [x] 3.2 Add `ended: boolean` state to `AppShell`; set to `true` via the `onEnded` callback from `PlayerArea`
- [x] 3.3 Add a dedicated `handleChannelVideoSelect(video: ChannelFeedVideo, channel: ChannelItem)` in AppShell that sets `channelContext`, resets `ended` to `false`, and calls `setCurrentItem` with the transient VideoItem
- [x] 3.4 Have `handleSelectItem` (library item picks) always clear `channelContext` and reset `ended` to `false` — no inference about item type needed
- [x] 3.5 In `handleItemEnd` (auto-advance callback), clear `channelContext` and reset `ended` to `false`
- [x] 3.6 Wire `ChannelBrowseModal`'s `onPlay` in AppShell to call `handleChannelVideoSelect` instead of `handleSelectItem`

## 4. Mobile peek bar: context-aware label

- [x] 4.1 When `channelContext` is set and `!ended`: render peek bar as "← [channelContext.title]", tapping opens `ChannelBrowseModal` for that channel (set `browseChannelItem`)
- [x] 4.2 When `channelContext` is set and `ended`: render peek bar as "← More from [channelContext.title]", same action
- [x] 4.3 When `channelContext` is null: keep existing "☰ Library" behavior unchanged
- [x] 4.4 Apply `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` to the peek bar label so long channel names truncate gracefully

## 5. Desktop: clickable channel name in PlayerArea

- [x] 5.1 Add optional props `channelContext` and `onOpenChannel` to `PlayerArea`
- [x] 5.2 In the watch-mode now-playing bar, when `channelContext` is set render the channel name sub-line as a `<button>` that calls `onOpenChannel`; style with a subtle underline or "↗" indicator
- [x] 5.3 In the listen-mode mini bar, apply the same clickable treatment to the channel name sub-line
- [x] 5.4 Pass `channelContext` and `onOpenChannel` (sets `browseChannelItem`) from AppShell to PlayerArea

## 6. Build check and manual testing

- [x] 6.1 Run `npm run build` — fix any TypeScript errors
- [ ] 6.2 Mobile: play a channel video → peek bar shows "← [Channel]" → tap returns to channel browse
- [ ] 6.3 Mobile: let a channel video end → peek bar shows "← More from [Channel]" → tap opens browse
- [ ] 6.4 Mobile: pause mid-video → peek bar still shows "← [Channel]", not the nudge
- [ ] 6.5 Mobile: pick a library item while channel context active → peek bar reverts to "☰ Library"
- [ ] 6.6 Desktop: channel name in now-playing bar is clickable → reopens browse modal
- [ ] 6.7 Desktop: plain library video → channel name is not a button
- [ ] 6.8 Listen mode (mobile + desktop): channel name in mini bar is clickable
