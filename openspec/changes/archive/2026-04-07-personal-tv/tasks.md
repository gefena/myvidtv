## 1. Project Setup

- [x] 1.1 Initialize Next.js app with TypeScript and App Router (`create-next-app`), select Tailwind when prompted
- [x] 1.2 Install additional dependencies: Framer Motion
- [x] 1.3 Create project folder structure: `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`
- [x] 1.4 Configure Tailwind — remove any `darkMode` setting; all color theming is via CSS custom properties only
- [x] 1.5 Set up CSS custom properties for dark and light themes (all color tokens) in `globals.css`
- [x] 1.6 Add inline theme-init script to `<head>` to apply stored theme before first paint (prevents flash)
- [ ] 1.7 Create GitHub repository and connect to Vercel project
- [ ] 1.8 Add `YOUTUBE_API_KEY` to `.env.local` for local development and to Vercel project environment variables

## 2. YouTube Metadata API Route

- [x] 2.1 Create `/api/youtube` route that accepts a `url` query param
- [x] 2.2 Implement URL parser to distinguish YouTube video URLs from playlist URLs
- [x] 2.3 Implement video metadata fetch (YouTube Data API v3 `videos` endpoint — id, snippet, contentDetails)
- [x] 2.4 Implement playlist metadata fetch (`playlists` endpoint)
- [x] 2.5 Implement playlist items fetch with pagination (`playlistItems` endpoint, 50 per page, return `nextPageToken`)
- [x] 2.6 Return normalized response shapes for video, playlist, and playlist items
- [x] 2.7 Add error handling for invalid URLs, missing API key, and API errors

## 3. localStorage Data Layer

- [x] 3.1 Define TypeScript types: `VideoItem`, `PlaylistChannel`, `LibraryData`
- [x] 3.2 Create `useLibrary` hook: read/write library from localStorage, expose `items`, `customTags`, `settings` (theme, libraryCollapsed, listenMode, sortOrder)
- [x] 3.3 Implement `addVideo`, `addPlaylistChannel`, `addVideos` (batch), `removeItem` operations
- [x] 3.4 Implement duplicate detection on add (by `ytId` or `ytPlaylistId`)
- [x] 3.5 Implement tag management: add custom tag, merge with predefined list

## 4. Theming System

- [x] 4.1 Create `useTheme` hook: read/write theme from localStorage, toggle between dark/light
- [x] 4.2 Apply `data-theme` attribute to `<html>` element on mount and on toggle
- [x] 4.3 Build theme toggle button component (header, minimal)

## 5. Core Layout

- [x] 5.1 Build root layout: header bar + `[player area | library panel]` flex structure
- [x] 5.2 Implement library panel collapse/expand with Framer Motion animation
- [x] 5.3 Persist collapse state in `settings.libraryCollapsed` via `useLibrary`
- [x] 5.4 Implement tablet layout: library panel moves below player (stacked, scrollable) — no drag-gesture bottom sheet in v1
- [x] 5.5 Implement mobile layout: stacked player → tags → list

## 6. Empty State

- [x] 6.1 Build cinematic empty state screen (shown when library has no items)
- [x] 6.2 Center-stage URL input with placeholder "Paste a YouTube link..."
- [x] 6.3 Wire URL input to trigger metadata fetch and open add flow

## 7. Add URL Flow

- [x] 7.1 Build URL input component (also accessible from library panel Add button)
- [x] 7.2 On submit: call `/api/youtube`, show loading state, handle errors
- [x] 7.3 Build tag picker component: predefined chips (toggle on/off) + custom tag input
- [x] 7.4 On video URL: show video preview card + tag picker, save on confirm
- [x] 7.5 On playlist URL: show playlist info + choice between "Add as Channel" / "Pick Videos"

## 8. Playlist Add Flow

- [x] 8.1 Build playlist option selector ("Add as Channel" vs "Pick Videos" cards)
- [x] 8.2 "Add as Channel" path: show tag picker, save as `playlist-channel` on confirm
- [x] 8.3 "Pick Videos" path: build paginated checklist UI with progressive loading
- [x] 8.4 Implement Select All / Clear controls for checklist
- [x] 8.5 Fetch subsequent playlist item pages as user scrolls checklist
- [x] 8.6 Save selected videos as individual `video` items with shared tags on confirm

## 9. Library Browser

- [x] 9.1 Build library panel: scrollable list of `VideoItem` and `PlaylistChannel` cards
- [x] 9.2 Build library item card: thumbnail, title, duration/video count, tag chips
- [x] 9.3 Build tag bar: "All" + one chip per unique tag in library, active state with violet underline
- [x] 9.4 Implement tag filter: clicking a tag filters the displayed list
- [x] 9.5 Add "Add" button to library panel header, wire to URL input

## 10. Playback

- [x] 10.1 Load YouTube IFrame Player API script and initialize player instance
- [x] 10.2 Create `usePlayer` hook: exposes `play`, `pause`, `skipNext`, `currentItem`, `mode`
- [x] 10.3 Wire library item click to load video or playlist into player
- [x] 10.4 Implement auto-advance: on video end, play next item in active tag view
- [x] 10.5 Build now-playing bar: thumbnail, title, channel, progress, play/pause/skip controls (progress requires polling `player.getCurrentTime()` every 500ms — no native progress event in IFrame API)
- [x] 10.6 Build watch/listen toggle in now-playing bar; persist `listenMode` to settings via `useLibrary`
- [x] 10.7 Implement listen mode: hide player via CSS (not DOM removal — that stops playback), show mini bar at bottom, audio continues
- [x] 10.8 Implement watch mode restore: show player, hide mini bar; restore `listenMode` from settings on load

## 11. Polish & Animation

- [x] 11.1 Add Framer Motion stagger to library list on initial load
- [x] 11.2 Add card hover effect: scale, violet glow ring, play button fade-in
- [x] 11.3 Add crossfade animation on tag filter switch
- [x] 11.4 Add smooth player expand/collapse when library panel toggles
- [x] 11.5 Verify light theme renders correctly across all components
- [x] 11.6 Test basic usability on mobile viewport
