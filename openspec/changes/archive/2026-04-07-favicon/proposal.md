## Why

The browser tab currently shows the default Next.js favicon, which looks generic and breaks the cinematic MyVidTV identity. A custom icon makes the app recognizable when multiple tabs are open and creates a polished first impression.

## What Changes

- Add `src/app/icon.svg` — a violet play triangle on a dark rounded square, served automatically by Next.js as the tab favicon
- Add `src/app/apple-icon.png` — the same icon rasterized at 180×180px for iOS home screen bookmarks
- Remove the default `src/app/favicon.ico` placeholder

## Capabilities

### New Capabilities

- `favicon`: Browser tab icon and Apple touch icon representing the MyVidTV brand

### Modified Capabilities

_(none)_

## Impact

- `src/app/` — new icon files, removal of default favicon.ico
- `src/app/layout.tsx` — no changes needed; Next.js auto-detects icon.svg/apple-icon.png
