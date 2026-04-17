## Why

Adding individual videos to MyVidTV requires users to leave the app, find content on YouTube, and paste URLs one at a time. Supporting YouTube channel URLs lets users save a channel once and browse its latest videos directly inside the app — a natural "TV channel" metaphor that fits the product's vision.

## What Changes

- The `AddFlow` input will detect YouTube channel URLs (`youtube.com/@handle`, `youtube.com/channel/UCxxx`) in addition to video and playlist URLs.
- A new `channel` library item type will be introduced to store saved channels (distinct from `playlist-channel`).
- Clicking a channel card in the library opens a **channel browse modal** showing the channel's ~15 most recent videos fetched via YouTube's public RSS feed — no API key required.
- Selecting a video from the browse modal plays it immediately without adding it to the library.
- Channel cards in the library are visually similar to existing cards but carry a "Channel" badge to distinguish them.

## Capabilities

### New Capabilities
- `channel-browsing`: Save a YouTube channel to the library by URL, then browse and play its latest videos from within the app.

### Modified Capabilities
- `playlist-add-flow`: The add flow now also recognises channel URLs as a third input type (alongside video URLs and playlist URLs).

## Impact

- **Types:** New `ChannelItem` type added to `src/types/library.ts`.
- **Library hook:** `useLibrary` gains an `addChannel` action and `ChannelItem` handling.
- **AddFlow:** Channel URL detection and a new `channel-name` step for confirming the channel name before saving.
- **Library panel:** Channel cards rendered alongside video and playlist-channel cards.
- **New component:** `ChannelBrowseModal` — fetches RSS, renders video list, triggers playback.
- **New utility:** `src/lib/channelRss.ts` — resolves `@handle` → channel ID and fetches/parses the RSS feed.
- **Dependencies:** No new npm packages. Uses `fetch` and browser-native XML parsing (`DOMParser`).
