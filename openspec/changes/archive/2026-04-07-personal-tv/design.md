## Context

Greenfield Next.js application. No existing codebase. The user's YouTube library lives entirely in the browser — no backend database, no authentication. A single server-side API route acts as a proxy to the YouTube Data API v3, keeping the API key out of the client bundle. Deployed on Vercel from a GitHub repository.

## Goals / Non-Goals

**Goals:**
- Cinematic, distraction-free YouTube viewing experience
- Zero-friction onboarding (open site, paste a link, watch)
- Fast, reliable tag-based content browsing
- Theming system that supports dark (default) and light modes without refactoring
- Works well on desktop and tablet; usable on mobile

**Non-Goals:**
- User accounts or cross-device sync (localStorage only, v1)
- AI-powered tag suggestions (predefined list + custom is sufficient)
- Offline playback (YouTube handles streaming)
- Social features, sharing, or public profiles
- Native mobile app

## Decisions

### 1. Next.js App Router (not Pages Router)
App Router gives us React Server Components, which are useful for the metadata proxy route, and aligns with the current Next.js direction. Layouts make the persistent player + collapsible panel structure natural to implement.

**Alternative considered**: Pages Router — familiar but legacy. No benefit for this use case.

### 2. localStorage as the data layer
No backend, no auth, instant start. localStorage is sufficient for a personal library of hundreds of videos. IndexedDB would give more capacity but adds complexity with no clear need.

**Data shape:**
```ts
type VideoItem = {
  type: "video"
  ytId: string
  title: string
  channelName: string
  thumbnail: string       // maxresdefault or hqdefault URL
  duration: string        // ISO 8601 (PT12M34S)
  tags: string[]
  addedAt: number         // unix ms
}

type PlaylistChannel = {
  type: "playlist-channel"
  ytPlaylistId: string
  title: string
  channelName: string
  thumbnail: string
  videoCount: number
  tags: string[]
  addedAt: number
}

type LibraryData = {
  items: (VideoItem | PlaylistChannel)[]
  customTags: string[]
  settings: {
    theme: "dark" | "light"
    libraryCollapsed: boolean
    listenMode: boolean       // persists across sessions
    sortOrder: "addedAt_desc" // fixed for v1, newest first
  }
}
```

**Alternative considered**: Supabase with device ID — adds infrastructure and complexity without benefit for a single-device experience.

### 3. YouTube Data API v3 via Next.js API Route
The API key lives in a Vercel environment variable (`YOUTUBE_API_KEY`). The client calls `/api/youtube?url=<encoded_url>`. The route resolves whether the URL is a video or playlist, fetches metadata, and returns a normalized response. The client never touches the API key.

**Alternative considered**: Client-side fetch with API key in env — exposes the key in the browser bundle, rejected.

### 4. YouTube IFrame Player API for playback
The only legal, reliable way to play YouTube content. Loaded via the standard script tag. Gives full programmatic control: play, pause, seek, volume, events.

The "listen" mode collapses the player visually to a mini bar at the bottom while the IFrame continues playing audio. The IFrame is hidden via CSS (not removed from DOM — removing it stops playback).

### 5. CSS Custom Properties for theming (not Tailwind dark mode)
All color tokens are CSS variables on `:root[data-theme="dark"]` and `:root[data-theme="light"]`. Components reference tokens directly via `var(--bg)`, `var(--accent)`, etc. — no Tailwind `dark:` prefix classes anywhere.

Tailwind is used only for layout, spacing, and typography. `darkMode` is NOT set in the Tailwind config — the `data-theme` attribute on `<html>` drives all color switching.

Theme preference is persisted in `settings.theme` and applied before first paint (inline script in `<head>`) to avoid flash.

### 6. Layout: persistent player + collapsible library panel
```
[player area — flex-grow]  [library panel — fixed width or collapsed]
```
Panel collapse state is stored in `settings.libraryCollapsed`. On tablet, the library becomes a bottom sheet. On mobile, layout stacks vertically (player → tags → list).

### 7. Framer Motion for animation
Used for: card hover effects, panel collapse/expand, tag switching crossfade, staggered library load. Kept restrained — cinematic motion is slow and purposeful, not bouncy.

## Risks / Trade-offs

- **localStorage size limit (~5MB)** → For most users a personal library of videos (metadata only, no media) stays well under this. If needed, a future version could add export/import.
- **YouTube API quota (10,000 units/day free)** → Each video metadata fetch costs ~3 units, playlist costs ~5. A single user will not approach this limit. If the app scales to many users, a caching layer would be needed.
- **YouTube IFrame terms of service** → Embedding YouTube via the IFrame API is explicitly permitted. The site must not obscure player controls or display content in a way that violates YouTube's ToS.
- **No cross-device sync** → Accepted for v1. A future "export library as JSON / import JSON" feature would be a lightweight mitigation.
- **Playlist "Pick Videos" fetch cost** → Fetching all video details from a large playlist (e.g., 200 videos) could cost quota and take time. Mitigation: fetch playlist items in pages (max 50 per request), show a loading state, and let the user pick while items load progressively.

## Resolved Decisions

- **Watch/listen persist?** Yes — `listenMode` stored in `settings`, restored on load.
- **Default sort order?** `addedAt` descending (newest first). Simple and always correct for v1.
- **Playlist-channel progress tracking?** Not in v1 — no spec for it, adds complexity with no clear benefit yet.
