## 1. Diagnostics Foundation

- [x] 1.1 Add a server diagnostics helper for request IDs, elapsed timing, runtime/Vercel region detection, safe header extraction, body snippet sanitization, and structured failure logging.
- [x] 1.2 Add typed diagnostic error response helpers that return safe JSON fields by default and extended debug fields only when running locally with `debug=1`.

## 2. Channel Feed API

- [x] 2.1 Update `/api/channel-feed` to return JSON errors with `MISSING_CHANNEL_ID`, `YOUTUBE_RSS_UPSTREAM_ERROR`, `YOUTUBE_RSS_PARSE_ERROR`, and `YOUTUBE_RSS_FETCH_ERROR` codes.
- [x] 2.2 Log structured diagnostics for channel feed upstream non-OK responses, RSS parse failures, and fetch exceptions.
- [x] 2.3 Preserve successful channel feed responses as XML with the existing content type and client behavior.

## 3. Channel Resolution API

- [x] 3.1 Update `/api/resolve-channel` to return JSON errors with `MISSING_CHANNEL_PATH`, `YOUTUBE_CHANNEL_NOT_FOUND`, `YOUTUBE_CHANNEL_UPSTREAM_ERROR`, `YOUTUBE_CHANNEL_PARSE_ERROR`, and `YOUTUBE_CHANNEL_FETCH_ERROR` codes.
- [x] 3.2 Log structured diagnostics for channel resolution upstream failures, parse failures, and fetch exceptions.
- [x] 3.3 Preserve successful channel resolution responses with the existing `{ channelId }` JSON shape.

## 4. Client Error Handling

- [x] 4.1 Update `src/lib/channelRss.ts` to parse structured JSON API errors and preserve `code` and `requestId` on thrown errors.
- [x] 4.2 Update the channel browse modal to show the existing friendly retry error plus a diagnostic reference when available.
- [x] 4.3 Update the add channel flow to preserve existing user-facing resolution/feed errors and include a diagnostic reference when available.

## 5. Verification

- [x] 5.1 Verify missing-parameter API calls return structured JSON errors with request IDs.
- [x] 5.2 Verify local `debug=1` error responses include extended diagnostics while normal error responses do not.
- [x] 5.3 Verify upstream non-OK, fetch exception, and parse failure paths return the expected codes and log structured diagnostics.
- [x] 5.4 Verify the channel browse modal and add channel flow display diagnostic references without raw upstream details.
- [x] 5.5 Verify successful channel browsing and channel URL resolution still work against a known YouTube channel.
- [x] 5.6 Run lint and build checks.
