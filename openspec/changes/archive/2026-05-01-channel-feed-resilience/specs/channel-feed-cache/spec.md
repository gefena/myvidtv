## ADDED Requirements

### Requirement: Cache channel feed responses in localStorage
The system SHALL cache successfully fetched and parsed `ChannelFeed` objects in `localStorage` under the key `myvidtv_channel_feed_cache`. Each entry SHALL record the channel ID, the parsed feed, the time it was fetched (`cachedAt`), and the time it was last accessed (`lastAccessedAt`). Cache reads and writes SHALL be wrapped in try/catch so that localStorage unavailability (e.g. private browsing, storage quota exceeded) degrades silently to no-cache behavior.

#### Scenario: Successful feed fetch updates cache
- **WHEN** `fetchChannelFeed()` receives a successful response from `/api/channel-feed`
- **THEN** the parsed `ChannelFeed` is written to `localStorage` under `myvidtv_channel_feed_cache[channelId]` with the current timestamp as `cachedAt` and `lastAccessedAt`

#### Scenario: Cache write fails silently
- **WHEN** writing to `localStorage` throws (e.g. quota exceeded or private browsing)
- **THEN** the error is swallowed and the caller receives the fresh feed normally

#### Scenario: Cache read fails silently
- **WHEN** reading from `localStorage` throws
- **THEN** the error is swallowed and the cache is treated as empty for that channel

### Requirement: Serve stale cache on fetch failure
When `/api/channel-feed` returns an error or the network fetch throws, the system SHALL check the localStorage cache for the affected channel. If a cache entry exists and its `cachedAt` timestamp is within 7 days of the current time, the system SHALL return the stale `ChannelFeed` along with a flag indicating the data is from cache. If no cache entry exists or the entry is older than 7 days, the system SHALL propagate the original error to the caller.

#### Scenario: Fetch fails, fresh cache entry served
- **WHEN** the channel feed fetch fails AND the localStorage cache has an entry for that channel that is less than 7 days old
- **THEN** `fetchChannelFeed()` resolves with the cached `ChannelFeed` and a `fromCache: true` flag

#### Scenario: Fetch fails, no cache entry
- **WHEN** the channel feed fetch fails AND there is no cache entry for that channel
- **THEN** `fetchChannelFeed()` rejects with the original error

#### Scenario: Fetch fails, cache entry is older than 7 days
- **WHEN** the channel feed fetch fails AND the cache entry's `cachedAt` is more than 7 days ago
- **THEN** `fetchChannelFeed()` rejects with the original error (the stale entry is not served)

### Requirement: LRU eviction at 30-entry cap
The cache SHALL store at most 30 entries. When a new entry would exceed this limit, the system SHALL evict the entry with the oldest `lastAccessedAt` timestamp before writing the new entry. Reading a cache entry SHALL update its `lastAccessedAt` to the current time.

#### Scenario: Cache below cap — no eviction
- **WHEN** a new channel feed is cached and the store has fewer than 30 entries
- **THEN** the new entry is written without evicting any existing entry

#### Scenario: Cache at cap — LRU entry evicted
- **WHEN** a new channel feed is cached and the store already has 30 entries
- **THEN** the entry with the oldest `lastAccessedAt` is removed before the new entry is written

#### Scenario: Re-caching an existing channel does not trigger eviction
- **WHEN** a channel feed is written to the cache and the store already contains an entry for that channel ID
- **THEN** the existing entry is updated in place and no other entry is evicted

#### Scenario: Cache read updates last-accessed time
- **WHEN** a stale cache entry is read during a failed fetch
- **THEN** the entry's `lastAccessedAt` is updated to the current time before the entry is returned
