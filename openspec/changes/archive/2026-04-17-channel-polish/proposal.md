## Why

Channel cards show a blank grey thumbnail box, and several valid YouTube channel URL formats (legacy `/c/` URLs, `/user/` URLs) silently fail or produce confusing errors. Both are visible rough edges in the channel-browsing feature shipped in April 2026.

## What Changes

- Fetch a channel thumbnail (avatar) at add-time and store it on the `ChannelItem`, so channel cards show a real image instead of a blank box.
- Expand URL detection to support legacy `youtube.com/c/<name>` and `youtube.com/user/<name>` formats in addition to `/channel/UCxxx` and `/@handle`.
- Improve error messaging for unresolvable channel URLs to be specific about what format was tried and what to try instead.

## Capabilities

### New Capabilities

_None — both items are refinements to existing capabilities._

### Modified Capabilities

- `channel-browsing`: adds thumbnail fetching at save-time, expands accepted URL formats, improves error messages.

## Impact

- `src/lib/channelRss.ts` — `isChannelUrl`, `resolveChannelId`, `fetchChannelFeed` extended
- `src/app/api/resolve-channel/route.ts` — must handle `/c/` and `/user/` paths in addition to `/@handle`
- `src/contexts/LibraryContext.tsx` — `addChannel` call site passes thumbnail from feed
- `src/components/AddFlow.tsx` — `handleChannelSave` passes thumbnail
- No new dependencies
