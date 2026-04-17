## 1. URL Detection

- [x] 1.1 Update `isChannelUrl` in `src/lib/channelRss.ts` to return `true` for `youtube.com/c/<name>` and `youtube.com/user/<name>` paths
- [x] 1.2 Update `resolveChannelId` to extract the correct path segment for each URL format (`@handle` → `@handle`, `/c/name` → `c/name`, `/user/name` → `user/name`) and send it as `?path=` to the server route
- [x] 1.3 Update `/api/resolve-channel/route.ts` to read `?path=` instead of `?handle=` and fetch `https://www.youtube.com/${path}` (removing the hardcoded `@` prefix)

## 2. Error Messages

- [x] 2.1 Update `/api/resolve-channel/route.ts` to return distinct status codes: `404` when YouTube returns 404, `422` when page loads but channel ID cannot be parsed, `502` on network/fetch failure
- [x] 2.2 Update `resolveChannelId` in `channelRss.ts` to map those status codes to specific error messages: "Channel not found. Check the URL and try again." / "Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly." / "Could not reach YouTube. Check your connection and try again."

## 3. Channel Thumbnail

- [x] 3.1 Update `fetchChannelFeed` to return the first video's thumbnail as `channelThumbnail` on the `ChannelFeed` type
- [x] 3.2 Update `handleUrlSubmit` in `AddFlow.tsx` to pass `feed.channelThumbnail` into `handleChannelSave`
- [x] 3.3 Update `handleChannelSave` and `addChannel` call to include the thumbnail value

## 4. Validation

- [x] 4.1 Test `youtube.com/c/<name>` URL — resolves correctly, card shows thumbnail
- [x] 4.2 Test `youtube.com/user/<name>` URL — resolves correctly
- [x] 4.3 Test non-existent handle — shows "Channel not found" error
- [x] 4.4 Test `youtube.com/@handle` and `/channel/UCxxx` still work (regression)
- [x] 4.5 Curl-test `/api/resolve-channel` with `/c/` and `/user/` handles locally before push, then on Vercel after push
