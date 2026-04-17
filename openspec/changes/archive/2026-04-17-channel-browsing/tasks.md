## 1. Data Model

- [x] 1.1 Add `ChannelItem` type to `src/types/library.ts` with fields: `type: "channel"`, `channelId`, `title`, `thumbnail`, `tags`, `addedAt`
- [x] 1.2 Add `addChannel` action to `useLibrary` hook and update `LibraryData` / localStorage handling to include `channel` items

## 2. Channel URL Utilities

- [x] 2.1 Create `src/lib/channelRss.ts`: implement `isChannelUrl(url)` — returns true for `youtube.com/channel/UCxxx` and `youtube.com/@handle`
- [x] 2.2 Create `/src/app/api/resolve-channel/route.ts` — server-side route that accepts `?handle=` query param, fetches `youtube.com/@{handle}`, parses the channel ID from the RSS `<link>` tag in `<head>`, returns `{ channelId }` or a 404 error
- [x] 2.3 Implement `resolveChannelId(url)` in `channelRss.ts` — extracts channel ID directly from `/channel/UCxxx` URLs; for `@handle` URLs, calls `/api/resolve-channel?handle=` and returns the channel ID
- [x] 2.4 Implement `fetchChannelFeed(channelId)` — fetches `https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`, parses XML via `DOMParser`, returns channel name and array of `{ ytId, title, thumbnail, publishedAt }`

## 3. AddFlow: Channel Step

- [x] 3.1 Add `isChannelUrl` check to `handleUrlSubmit` in `AddFlow.tsx` — channel detection runs before playlist detection
- [x] 3.2 Add `channel-name` step to the `Step` type and implement its UI: loading state while resolving, pre-filled name input, tag picker, save button
- [x] 3.3 Implement `handleChannelSave` — calls `addChannel`, checks for duplicates (library + archive), closes modal on success

## 4. Library Panel: Channel Cards

- [x] 4.1 Update the library panel card renderer to handle `type: "channel"` items — same card style as existing cards but with a "Channel" badge

## 5. Channel Browse Modal

- [x] 5.1 Create `src/components/ChannelBrowseModal.tsx` — accepts `channelId` and `channelName`, fetches RSS on mount, renders video list with title, thumbnail, and published date
- [x] 5.2 Wire up click handler: clicking a video calls the player with the video's `ytId` and closes the modal
- [x] 5.3 Handle loading and error states in the modal (spinner while fetching, error message with retry on failure)

## 6. Connect Browse Modal to Library

- [x] 6.1 Add click handler to channel cards in the library panel that opens `ChannelBrowseModal` with the card's `channelId` and `title`

## 7. Validation

- [x] 7.1 Test `youtube.com/channel/UCxxx` URL — resolves correctly, saves, card shows "Channel" badge
- [x] 7.2 Test `youtube.com/@handle` URL — resolves to channel ID, name pre-filled from RSS
- [x] 7.3 Test duplicate detection for channels (library and archive)
- [x] 7.4 Test channel browse modal — videos load, clicking one plays it without adding to library
- [x] 7.5 Test that video and playlist URL flows are unaffected
- [x] 7.6 Verify mobile responsiveness of the channel browse modal
