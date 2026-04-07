## Why

There's no good way to consolidate personal YouTube content into a single, beautiful, distraction-free viewing experience. YouTube's own interface is cluttered, algorithm-driven, and not designed for curated personal libraries. This builds a personal TV — clean, cinematic, yours.

## What Changes

- New Next.js application (greenfield) deployed on Vercel
- YouTube Data API v3 proxied through a server-side API route to fetch video/playlist metadata
- All user data stored in localStorage (no auth, no backend database)
- Users can add YouTube video URLs and playlist URLs to their personal library
- Playlists can be added as a "channel" (sequential playback) or expanded to pick individual videos
- Videos and playlist-channels are tagged using a predefined list + custom entry
- Library is browsable by tag, acting as personal TV channels
- YouTube IFrame Player API used for playback with watch/listen toggle
- Dark cinematic theme (violet accent) with a light theme toggle, powered by CSS custom properties

## Capabilities

### New Capabilities

- `library-management`: Add, tag, and store YouTube videos and playlist-channels in localStorage; predefined + custom tags
- `youtube-metadata`: Server-side API route that proxies YouTube Data API v3 to fetch video/playlist metadata safely
- `playlist-add-flow`: Two-step playlist add UX — choose "Add as Channel" or "Pick Videos" from a checklist
- `playback`: YouTube IFrame Player integration with watch/listen (audio-only mini bar) toggle
- `library-browser`: Tag-based channel browsing, collapsible library panel, video grid/list view
- `theming`: CSS custom property theming system with dark cinematic (default) and light editorial themes

### Modified Capabilities

## Impact

- New repository on GitHub, deployed to Vercel
- Requires `YOUTUBE_API_KEY` environment variable in Vercel (server-side only)
- Dependencies: Next.js, Tailwind CSS, Framer Motion, YouTube IFrame Player API
- No database, no auth service — localStorage is the data layer
- Desktop and tablet primary experience; basic responsive layout for mobile
