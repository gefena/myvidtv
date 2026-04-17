## Context

Channel cards currently show a blank grey box because `ChannelItem.thumbnail` is always saved as `""`. The RSS feed used at add-time does not expose a channel avatar URL. Additionally, `isChannelUrl` only recognises `/channel/` and `/@` paths — legacy YouTube URL formats (`/c/` and `/user/`) are silently unrecognised and fall through to the video oEmbed path, which then fails with a confusing error.

## Goals / Non-Goals

**Goals:**
- Channel cards display a real thumbnail image after save
- `/c/<name>` and `/user/<name>` URLs are accepted and resolved to a channel ID
- Errors for unresolvable channel URLs tell the user what went wrong and what to try

**Non-Goals:**
- Fetching a high-resolution channel banner or profile photo
- Keeping the thumbnail updated after save (it's captured once at add-time)
- Supporting `youtu.be` channel links (no such format exists)

## Decisions

### Thumbnail source: `https://i.ytimg.com/vi/{firstVideoId}/hqdefault.jpg` as proxy

YouTube does not expose a channel avatar in the RSS feed. Options considered:

| Option | Pros | Cons |
|---|---|---|
| YouTube Data API (channel endpoint) | Returns official avatar | Requires API key |
| `https://yt3.ggpht.com/...` (avatar URL) | Official source | URL is not derivable without API |
| First video thumbnail from RSS feed | Already in hand, no extra request | Represents a video, not the channel brand |

**Decision:** Use the first video's thumbnail from the RSS feed as the channel card image. It's always available, requires no extra request, and gives the card visual texture that's clearly "this channel's content." Already fetched as part of `fetchChannelFeed`.

### Legacy URL resolution: update route param from `handle` to `path`

`/c/<name>` and `/user/<name>` URLs redirect to the canonical `/@handle` or `/channel/UCxxx` page on YouTube. The existing `/api/resolve-channel` route parses the channel ID from the RSS link in `<head>` — this logic works for any YouTube page that carries that link, including legacy redirects.

However, the current route hardcodes `@` when constructing the fetch URL:
```ts
fetch(`https://www.youtube.com/@${handle}`)
```
Passing `c/somename` as the handle would produce `youtube.com/@c/somename`, which doesn't exist.

**Decision:** Rename the query param from `handle` to `path` (the URL path segment without leading slash). The server constructs `https://www.youtube.com/${path}`, which works for all formats:
```
/@mkbhd   → path=@mkbhd   → youtube.com/@mkbhd   ✓
/c/name   → path=c/name   → youtube.com/c/name   ✓
/user/x   → path=user/x   → youtube.com/user/x   ✓
```

**Decision:** Update `isChannelUrl` to return `true` for `/c/` and `/user/` paths so they enter the channel flow rather than falling through to video detection.

**Decision:** Update `resolveChannelId` to extract the correct `path` value for each URL format and send it to the route.

### Error messages: specific over generic

Current error: `"Could not resolve channel. Try using a youtube.com/channel/UCxxx URL instead."`

This is shown for any failure — including cases where the URL format was valid but the channel doesn't exist, or the fetch timed out. Distinguish:
- **Unresolvable handle/name** (404 from YouTube): `"Channel not found. Check the URL and try again."`
- **Parse failure** (page loaded but no RSS link): `"Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly."`
- **Network failure**: `"Could not reach YouTube. Check your connection and try again."`

The route handler already returns distinct status codes (404 vs 500) — the client can use these to show targeted messages.

## Risks / Trade-offs

- **First-video thumbnail mismatch**: The thumbnail shown on the channel card is from a specific video, not the channel's brand identity. A user might find it slightly confusing. Acceptable given no better option without an API key.
- **Legacy URL redirects**: YouTube may change how `/c/` and `/user/` paths resolve over time. If they stop including the RSS link in the redirected page, these URLs would fall back to the parse-failure error, which is still graceful.
- **Error granularity**: The improved error messages depend on HTTP status codes from the proxy route. If YouTube returns a 200 with an error page (soft 404), the client would still see the parse-failure message — acceptable.
