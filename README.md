# MyTV — Your Personal TV

A dark, cinematic personal TV experience for your curated YouTube content. No account required — your library lives on your device.

**Live:** [https://mytv-black-mu.vercel.app](https://mytv-black-mu.vercel.app)

## Features

- Add YouTube videos and playlist channels to your personal library
- Tag-based filtering to organize your content
- Watch mode (full player) and Listen mode (audio-only mini bar)
- Auto-advance to the next item in a tag or playlist
- Archive items you've finished with
- Collapsible library panel for distraction-free watching
- Mobile-first responsive layout with slide-up library sheet
- Dark and light themes
- No sign-in, no API key — everything stored in your browser

## Stack

- [Next.js 16](https://nextjs.org) App Router
- [Framer Motion](https://www.framer.com/motion/) for animations
- YouTube IFrame Player API for playback
- YouTube oEmbed for metadata (no API key needed)
- `localStorage` for persistence

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on [Vercel](https://vercel.com). No environment variables required.
