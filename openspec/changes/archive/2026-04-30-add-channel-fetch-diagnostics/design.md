## Context

Channel browsing and channel URL resolution both depend on server-side fetches to YouTube. The current routes return opaque plain text errors for channel RSS failures and compact JSON errors for channel resolution failures. That is enough for normal UI copy, but it does not expose the failure class needed to debug intermittent morning incidents across localhost and Vercel.

The likely failure modes are materially different: direct YouTube RSS can fail from the developer machine, Node fetch can fail locally while browser access works, Vercel egress can be blocked or rate-limited by YouTube, or parsing can fail after a successful upstream response. The implementation needs to identify which layer failed without leaking unnecessary upstream detail to production users.

## Goals / Non-Goals

**Goals:**

- Preserve successful channel feed and channel resolution behavior.
- Return safe structured API errors with stable codes and request IDs.
- Log rich server-side diagnostics for failed YouTube fetch, upstream response, and parse paths.
- Expose extra debug details only during local development.
- Let the UI keep friendly error copy while showing a reference ID when available.

**Non-Goals:**

- Do not introduce an external logging service, database table, or admin dashboard.
- Do not replace YouTube RSS with a new data provider.
- Do not solve the underlying upstream availability problem in this change.
- Do not expose full upstream response bodies or sensitive environment details in production responses.

## Decisions

1. Add a small server diagnostics helper.

   The API routes should share utilities for request ID generation, elapsed timing, safe upstream header extraction, body snippet truncation, environment detection, structured logging, and JSON error response creation. This keeps the two routes consistent and makes future diagnostics easier to extend.

   Alternative considered: duplicate logging code inside each route. That is simpler initially, but it risks divergent error shapes between channel feed and channel resolution.

2. Use JSON only for error responses.

   Successful `/api/channel-feed` responses should remain XML so `fetchChannelFeed()` can keep parsing the RSS feed normally. Failed route responses should return JSON with `error`, `code`, and `requestId`, plus safe fields such as `upstreamStatus` when applicable.

   Alternative considered: always return JSON with XML nested on success. That would be a breaking change for the existing client parser with no diagnostic benefit.

3. Use stable, route-specific error codes.

   Feed errors should distinguish missing input, upstream non-OK responses, RSS parse failures, and fetch exceptions. Channel resolution errors should distinguish missing path, not found, parse failure, upstream non-OK, and fetch exceptions. Codes are intended for diagnostics and tests; UI copy can remain user-friendly. The planned codes are `MISSING_CHANNEL_ID`, `YOUTUBE_RSS_UPSTREAM_ERROR`, `YOUTUBE_RSS_PARSE_ERROR`, `YOUTUBE_RSS_FETCH_ERROR`, `MISSING_CHANNEL_PATH`, `YOUTUBE_CHANNEL_NOT_FOUND`, `YOUTUBE_CHANNEL_UPSTREAM_ERROR`, `YOUTUBE_CHANNEL_PARSE_ERROR`, and `YOUTUBE_CHANNEL_FETCH_ERROR`.

   Alternative considered: one generic `CHANNEL_FETCH_FAILED` code. That preserves simplicity but does not narrow the incident quickly enough.

4. Keep production responses safe and put rich detail in logs.

   Server logs should include request ID, route, runtime, Vercel region when present, target identifier, upstream URL, elapsed time, upstream status/status text, selected response headers, a short sanitized body snippet, and exception name/message. Production responses should include only safe diagnostic fields. Local responses with `debug=1` can include extended diagnostic details.

   Alternative considered: expose all diagnostic details to any caller. That would make debugging easier, but it risks leaking upstream snippets and deployment details.

5. Preserve diagnostic references through the client layer.

   `fetchChannelFeed()` and `resolveChannelId()` should parse JSON error bodies when present and throw errors that retain `code` and `requestId`. `ChannelBrowseModal` and `AddFlow` should render normal user-facing messages and append the diagnostic reference when available.

   Alternative considered: log request IDs only in the browser console. That makes incidents harder to report from mobile and does not help a user communicate what failed.

## Risks / Trade-offs

- More log volume during repeated failures -> Log only structured failure events and avoid logging successful feed fetches by default.
- JSON error parsing can interact poorly with XML success parsing -> Branch on `res.ok` before reading the response body as XML.
- Server-side RSS validation adds route work to the success path -> Keep validation minimal and only require that returned XML contains expected RSS/Atom feed structure before forwarding it.
- Local debug output may expose too much if enabled in production by mistake -> Gate extended response details on `!process.env.VERCEL` and development/local environment checks.
- Request IDs are not persisted anywhere -> They are still useful for matching UI reports to server logs during the incident window.
- Diagnostics will identify failure class but not prevent recurrence -> A later resilience change may add caching, retries, or alternate fetch paths once the actual failure mode is known.

## Migration Plan

Deploy as a backward-compatible API change: successful feed responses stay XML, successful resolution responses keep their current shape, and UI behavior remains focused on retrying. Existing callers that only check `res.ok` continue to work.

Rollback is straightforward because no persistent data shape changes are introduced. Reverting the route/client changes restores the previous generic error behavior.
