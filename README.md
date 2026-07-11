# MyVidTV — Your Personal TV

A dark, cinematic personal media experience for your curated YouTube and podcast content. No account required — your library lives on your device.

**Live:** [https://myvidtv.vercel.app](https://myvidtv.vercel.app)

## Features

- Add YouTube videos, YouTube channels, playlists, and podcast feeds to your personal library
- Tag-based filtering to organize your content
- Watch mode (full player) and Listen mode (audio-focused mini bar)
- Auto-advance to the next item in a tag or playlist
- Archive items you've finished with
- Collapsible library panel for distraction-free watching
- Mobile-first responsive layout with slide-up library sheet
- Dark and light themes
- No sign-in, no API key — everything stored in your browser

## Stack

- [Next.js 16](https://nextjs.org) App Router
- [Framer Motion](https://www.framer.com/motion/) for animations
- YouTube IFrame Player API and HTML audio playback
- YouTube oEmbed for metadata (no API key needed)
- RSS/Atom parsing for podcast feeds
- `localStorage` for persistence

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run check
npm run test:e2e
npm run check:all
```

Unit tests cover deterministic app logic. Browser smoke tests cover first-party desktop/mobile UI behavior and intentionally avoid real YouTube iframe playback, resume timing, and embedded player internals; those remain manual checks when changed.

## Deployment

Deployed on [Vercel](https://vercel.com). No environment variables required.
