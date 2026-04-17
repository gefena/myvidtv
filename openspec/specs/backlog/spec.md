# Backlog Features Specification

## Purpose
Defines upcoming features and UI/UX improvements for MyVidTV.

## Requirements

### Future: Native YouTube search within the app

Allow users to search for YouTube videos and channels by text query directly inside the app, without leaving.

**Why it was deferred:** All viable no-API-key search backends (ytsr, Piped public instances, Invidious public instances) were found to be deprecated, archived, or offline as of April 2026. The feature requires either the YouTube Data API v3 (server-side env var key, 100 searches/day free) or a self-hosted Piped/Invidious backend. Neither was acceptable for the initial scope.

**When to revisit:** If the user is willing to add a `YOUTUBE_API_KEY` env var to Vercel, a server-side `/api/search` route using the official API is the cleanest path. Alternatively, watch for a stable, actively-maintained Piped fork.
