## Why

YouTube's public RSS feed endpoint (`feeds/videos.xml`) has a documented history of multi-hour outages — with at least one lasting ~10 hours — and no SLA or official acknowledgment. The current app makes a live fetch on every channel modal open with no fallback, so any outage makes channels completely unusable and shows a misleading "check your connection" message. Users who browse a channel one day and return days later also hit a cold fetch with no resilience.

## What Changes

- **Server-side**: `/api/channel-feed` adds `Cache-Control` headers on successful responses so the browser's HTTP cache can serve them while fresh.
- **Client-side**: A localStorage-backed feed cache stores parsed feed data per channel, refreshed on every successful fetch and served stale-on-error for up to 7 days.
- **Error messages**: The channel browse modal distinguishes YouTube server errors from connectivity errors, and shows a contextual banner when displaying stale cached data.
- **Cache size limit**: The feed cache is capped at 30 channels (LRU eviction) to stay within reasonable localStorage bounds.

## Capabilities

### New Capabilities

- `channel-feed-cache`: localStorage cache for RSS feed responses — stores parsed feed data keyed by channel ID, refreshes on success, serves stale-on-error up to 7 days, LRU-evicts when over 30 entries.

### Modified Capabilities

- `channel-browsing`: error scenario messages are updated to be context-specific; a new scenario is added for when the modal serves stale cached data with a visible staleness banner.

## Impact

- `src/lib/channelRss.ts` — `fetchChannelFeed()` gains cache read/write logic; cache module added
- `src/app/api/channel-feed/route.ts` — adds `Cache-Control` header on successful responses
- `src/components/ChannelBrowseModal.tsx` — updated error messages; stale-data banner
- `src/lib/constants.ts` — new localStorage key for feed cache
- No new dependencies
- No breaking changes
