## Why

Channel browsing sometimes fails for a short morning window on localhost and/or Vercel, but the app currently collapses all upstream failures into a generic "Could not fetch channel feed" error. We need enough diagnostics to tell whether a failure is local network, Vercel egress, YouTube RSS, parsing, or app code.

## What Changes

- Add structured diagnostics to channel feed and channel resolution API routes.
- Return safe JSON error responses with stable error codes and request IDs instead of opaque plain text.
- Log upstream status, elapsed time, selected headers, and short body snippets on server-side failures.
- Add local-only debug detail for channel feed and channel resolution requests.
- Preserve normal user-facing messages while giving maintainers a reference ID and enough local detail to catch live incidents.
- No breaking changes to successful channel browse behavior.

## Capabilities

### New Capabilities
- `channel-fetch-diagnostics`: Defines diagnostics, safe error responses, local debug behavior, and observability expectations for YouTube channel RSS and channel resolution fetches.

### Modified Capabilities
- `channel-browsing`: Channel browse failures surface a safe diagnostic reference while preserving the existing retry flow.

## Impact

- `src/app/api/channel-feed/route.ts`: add structured diagnostics, safe JSON errors, local debug support, and clearer upstream handling.
- `src/app/api/resolve-channel/route.ts`: add matching diagnostics for channel URL resolution.
- `src/lib/channelRss.ts`: parse JSON error bodies and preserve request IDs/error codes in thrown errors.
- `src/components/ChannelBrowseModal.tsx` and `src/components/AddFlow.tsx`: display friendly errors with optional diagnostic reference IDs.
- Optional helper utilities for request IDs, elapsed timing, environment detection, and safe upstream snippets.
