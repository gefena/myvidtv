@AGENTS.md

# MyVidTV — Personal YouTube TV

[https://github.com/gefena/myvidtv](https://github.com/gefena/myvidtv)

A personal TV experience for curated YouTube content. Dark cinematic UI, violet accent, no auth.

## Project Structure

```
src/
  app/           Next.js App Router pages and API routes
  components/    React components
  hooks/         Custom React hooks (useLibrary, usePlayer, useTheme)
  lib/           Utility functions and constants (predefined tags, localStorage keys)
  types/         TypeScript type definitions
openspec/        Design artifacts (proposal, design, specs, tasks)
```

## Key Architecture Decisions

- **No auth, no database** — all user data lives in `localStorage` under the key `myvidtv_library`
- **User = device** — the site is personal to whoever opens it on that device
- **YouTube IFrame Player API** for playback — never remove the player from the DOM in listen mode (stops audio)
- **CSS custom properties for ALL colors** — no Tailwind `dark:` classes. Theme is driven by `data-theme` on `<html>`
- **No API key required** — metadata fetched via YouTube oEmbed (`src/lib/oembed.ts`) directly from the client. No server route needed.
- **oEmbed returns**: title, channel name, thumbnail. Duration is not available and not displayed.

## Theme Tokens

All colors use CSS variables defined in `src/app/globals.css`:
- `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--border)`
- `var(--violet)`, `var(--violet-glow)`, `var(--violet-soft)`
- `var(--text)`, `var(--text-muted)`

Dark theme is the default. Light theme applied via `data-theme="light"` on `<html>`.

## Environment Variables

None required. No API keys needed.

## Predefined Tags

music, tech, news, comedy, documentary, sports, education, art, gaming, cooking, fitness, talk, focus

## LocalStorage Shape

```ts
// Key: "myvidtv_library"
type LibraryData = {
  items: (VideoItem | PlaylistChannel)[]
  archivedItems: (VideoItem | PlaylistChannel)[]
  customTags: string[]
  settings: {
    theme: "dark" | "light"
    libraryCollapsed: boolean
    listenMode: boolean
    sortOrder: "addedAt_desc"
    loopMode: "off" | "one" | "all"
  }
}
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint
```

## Testing Before and After Push

**Always before push:**
- Run `npm run build` — catches TypeScript errors and build failures.

**When API routes changed (`src/app/api/`):**
- Before push: curl-test each new or modified route locally (`http://localhost:3000/api/...`). Cover the happy path and at least one error case (missing param, bad input).
- After push: re-run the same curl tests against `https://myvidtv.vercel.app/api/...` once Vercel redeploys. Verify the full end-to-end flow for the feature that was changed.

**When UI changed:**
- Test the affected flow in the browser at `http://localhost:3000` before pushing. Client-side behavior (rendering, state, interactions) cannot be verified with curl — note this limitation explicitly if you cannot test it.

**Vercel URL:** `https://myvidtv.vercel.app`
