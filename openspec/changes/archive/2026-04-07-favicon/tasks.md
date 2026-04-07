## 1. SVG Icon

- [x] 1.1 Create `src/app/icon.svg` — `viewBox="0 0 100 100"`, dark rounded-square background (`fill=#0a0a0f`, `rx=20`), violet play triangle (`fill=#7c3aed`) centered at approximately `points="38,28 38,72 72,50"`
- [x] 1.2 Delete `src/app/favicon.ico` to ensure the SVG takes precedence in all browsers

## 2. Apple Touch Icon

- [x] 2.1 Generate `src/app/apple-icon.png` at 180×180px from the SVG (open `icon.svg` in a browser, screenshot or export via browser dev tools / Inkscape / similar) and place it at `src/app/apple-icon.png`

## 3. Verify

- [x] 3.1 Run `npm run build` and confirm no TypeScript or build errors
- [ ] 3.2 Run `npm run dev`, open the app in a browser, and confirm the tab icon shows the violet play triangle on dark background
