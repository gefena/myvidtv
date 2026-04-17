## 1. Search Logic

- [x] 1.1 Create `src/lib/youtubeSearch.ts`: define the Piped instance fallback list and implement `searchYouTube(query)` — calls `GET {instance}/search?q={query}&filter=all`, retries next instance on failure, throws if all fail
- [x] 1.2 Implement `getChannelVideos(channelId)` in the same file: calls `GET {instance}/channel/{channelId}`, retries on failure

## 2. UI Implementation (AddFlow)

- [x] 2.1 Update `AddFlow.tsx` input from `type="url"` to `type="text"` and update placeholder
- [x] 2.2 Add URL-vs-query heuristic to `handleUrlSubmit` (using existing `lib/oembed.ts` helpers) and add **350ms debounce** on omnibox input
- [x] 2.3 Implement search results list UI within `AddFlow`: thumbnail, title, uploader name; visually distinguish channels from videos
- [x] 2.4 Wire up search logic into `AddFlow`: call `searchYouTube`, handle loading/error states; on channel click call `getChannelVideos`

## 3. Refinement & Validation

- [ ] 3.1 Test URL pasting still works for single videos and playlists
- [ ] 3.2 Test generic search queries return valid results
- [ ] 3.3 Test channel selection fetches latest videos correctly
- [ ] 3.4 Verify mobile responsiveness of the search results list
- [ ] 3.5 Test fallback behavior: mock primary instance failure, confirm retry fires
