# MyVidTV — Personal YouTube TV (agent rules, auto-loaded by agy)

[https://github.com/gefena/myvidtv](https://github.com/gefena/myvidtv) · [https://myvidtv.vercel.app](https://myvidtv.vercel.app)

A personal TV experience for curated YouTube and podcast content. Dark cinematic UI, violet accent,
no auth, no database: all data is in localStorage key `myvidtv_library`. See CLAUDE.md for the full
library data shape.

## Stack
- Next.js 16.2 (App Router). Its APIs differ from your training data, so check
  `node_modules/next/dist/docs/` before using a Next API you're unsure of.
- React 19.2 and TypeScript, with Tailwind v4 via `@tailwindcss/postcss`.
- framer-motion.
- Tests: vitest (`tests/unit`) and Playwright (`tests/e2e`, projects `chromium` and `mobile-chromium`,
  Pixel 7). There's no backend except 4 small API routes.

## File map (read only what the task needs)
- `src/components/AppShell.tsx` (~850 lines): layout (desktop, narrow, phone), the mobile library
  sheet (open/close, listen-mode behavior), modal wiring, and the next/skip glue.
- `src/components/PlayerArea.tsx` (~930): player stage, YouTube iframe wrapper, podcast `<audio>`
  stage, transport bar, now-playing view.
- `src/hooks/usePlayer.ts` (~650): YT IFrame API player, play/pause/next/loop, podcast episode
  playback and timeupdate.
- `src/components/LibraryPanel.tsx` (~900): sidebar and sheet list, tabs (library, archive),
  now-playing highlight, row actions, tags.
- `src/components/AddFlow.tsx`: Add modal (URL input, Fetch).
- `src/components/PodcastBrowseModal.tsx` and `ChannelBrowseModal.tsx`: episode and video pickers.
- `Header.tsx`, `ThemeToggle.tsx`, `ImportConfirm.tsx`, `TagPicker.tsx`, `EmptyState.tsx`.
- `src/hooks/useLayout.ts` (layout and touch detection), `useTheme.ts`, `useIsMounted.ts`.
  `src/contexts/LibraryContext.tsx` provides the library state.
- `src/lib/`:
  - `duration.ts` (parse and format episode durations)
  - `mediaItems.ts` (item ids and types, active-item matching, next episode)
  - `podcastFeedParser.ts` and `podcastRss.ts`
  - `oembed.ts`
  - `libraryLogic.ts` (watch history)
  - `importSanitizer.ts` and `exportImport.ts`
  - `constants.ts`
- `src/app/api/{podcast-feed,resolve-podcast,channel-feed,resolve-channel}/route.ts`
- `src/app/globals.css`: theme tokens and the few global classes.
- `tests/e2e/fixtures.ts`: seed helpers (`videoItem`, ...), `mockYouTubeIframeApi` (counts
  `window.__ytPlayerCreateCount`) and network mocks. `tests/e2e/app.spec.ts` is 1,300 lines, so grep
  it for a similar test instead of reading it all.

## Hard architecture rules
- Never remove or unmount the YouTube player from the DOM, and never create a second `YT.Player`.
- In listen (audio-only) mode, hide the iframe with `opacity:0; pointer-events:none` only. No
  `display:none` and no `visibility:hidden`, because mobile throttles background audio.
- When switching to a podcast, `pauseVideo()` rather than `stopVideo()`, so the resume position is kept.
- All colors come from CSS variables (`--bg --surface --surface-2 --border --violet --violet-glow
  --violet-soft --text --text-muted`). Theme is `data-theme` on `<html>` (dark default,
  `data-theme="light"` for light), and there are no Tailwind `dark:` classes.
- No API keys or env vars required: YouTube metadata is fetched client-side via oEmbed
  (`src/lib/oembed.ts`), which returns title, channel name, and thumbnail (no duration).
- Portals and `window` access must be gated on mounted state (`useIsMounted` or
  `useSyncExternalStore`). ESLint enforces the react-hooks rules, including set-state-in-effect.
- Touch targets on phone layout must be at least 44px. On desktop, compact controls stay under 40px
  tall (an e2e invariant).
- Usability first: no regressions on desktop or mobile.

## Commands
- `npm run lint`, `npm run typecheck`, `npm run test:unit`: fast, so run these yourself.
- `npm run check` (lint, typecheck, unit, build) and `CI=1 PORT=3400 npx playwright test`: slow. Don't
  run them unless the task says to, because the caller runs them.
- E2E tests mock all network calls (YouTube iframe API, oEmbed, feeds). Never hit the real network in tests.

## Git and files
- Never commit, push, reset, rebase, or check out another branch. Leave changes uncommitted on the
  current branch.
- Don't create, edit, or commit anything in `new_design/`, `myvidtv_screenshots/`, `.claude/`,
  `.codex/`, `.gemini/`, `.agents/` or `.github/`.
- Don't delete files outside the task's scope. Don't add dependencies without being asked.

## Output
- When the prompt gives an OUTPUT FILE path (outside the repo), write your result there, never inside
  the repo, at most 15 lines: STATUS, changed files, checks run, and open issues. Then reply only `see RESULT.md`.
