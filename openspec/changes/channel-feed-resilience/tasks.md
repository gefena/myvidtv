## 1. Cache module

- [x] 1.1 Add `FEED_CACHE_KEY = "myvidtv_channel_feed_cache"` to `src/lib/constants.ts`
- [x] 1.2 Create `src/lib/channelFeedCache.ts` with types `FeedCacheEntry` and `FeedCacheStore`, and functions: `readCache()`, `writeCache(channelId, feed)`, `getCacheEntry(channelId)` — all wrapped in try/catch for localStorage failures
- [x] 1.3 Implement LRU eviction in `writeCache`: when store has 30+ entries, remove the entry with the oldest `lastAccessedAt` before writing the new one
- [x] 1.4 Update `lastAccessedAt` in `getCacheEntry` when returning a hit

## 2. Feed fetch integration

- [x] 2.1 Update `fetchChannelFeed()` in `src/lib/channelRss.ts` to write to cache on success
- [x] 2.2 Update `fetchChannelFeed()` to check cache on error and return `{ feed, fromCache: true }` if entry is within 7 days; propagate original error otherwise
- [x] 2.3 Change `fetchChannelFeed` return type to `Promise<{ feed: ChannelFeed; fromCache: boolean }>` — always a wrapper, never inline on `ChannelFeed`
- [x] 2.4 Update the `ChannelBrowseModal` call site: destructure `const { feed, fromCache } = await fetchChannelFeed(channelId)` and thread both values through local state

## 3. API route cache header

- [x] 3.1 Add `Cache-Control: private, max-age=300, stale-while-revalidate=3600` to the success response in `src/app/api/channel-feed/route.ts`

## 4. Modal error messages and stale banner

> Tasks 4.1 and 2.4 both modify `ChannelBrowseModal` — implement them in a single pass to avoid a broken intermediate state.

- [x] 4.1 Update `ChannelBrowseModal` to handle the `fromCache` flag: show cached videos with a staleness banner ("Showing cached videos from [date] — YouTube could not be reached.") instead of an error state
- [x] 4.2 Replace the single generic error message with code-specific messages: `YOUTUBE_RSS_UPSTREAM_ERROR` → "YouTube's feed server is currently unavailable.", `YOUTUBE_RSS_FETCH_ERROR` → "Could not reach YouTube. Check your connection.", `YOUTUBE_RSS_PARSE_ERROR` → "Unexpected response from YouTube's feed server.", fallback → existing generic message
- [x] 4.3 Pass the error `code` through from `ChannelApiError` to the modal error state so the modal can branch on it

## 5. Verification

- [x] 5.1 Run `npm run build` — no TypeScript errors
- [ ] 5.2 Open a channel modal while online — videos load, cache entry written to localStorage (`myvidtv_channel_feed_cache`)
- [ ] 5.3 Simulate offline: open the same channel modal — stale banner appears with the cached videos
- [ ] 5.4 Simulate offline for a channel with no cache entry — correct error message shown with retry button
- [x] 5.5 Test with `debug=1` on `/api/channel-feed` locally to confirm `Cache-Control` header is present on success responses
