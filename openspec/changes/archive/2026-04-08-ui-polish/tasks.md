## 1. Logo fix

- [x] 1.1 In `Header.tsx`, add `color: "var(--text-muted)"` to the `<svg>` wrapper style and change the `<rect>` stroke from `"rgba(255,255,255,0.75)"` to `"currentColor"`

## 2. Light theme tokens

- [x] 2.1 In `globals.css`, update light theme: `--bg` to `#eeeef8`, `--surface` to `#f7f6ff`, `--surface-2` to `#ebe8ff`, `--border` to `#d5d0f5`

## 3. Card hover elevation

- [x] 3.1 In `LibraryPanel.tsx` `LibraryCard`, update `onMouseEnter` to also apply `transform: translateY(-1px)` and `boxShadow: "0 4px 16px rgba(124,58,237,0.12)"` alongside the background change
- [x] 3.2 Update `onMouseLeave` to reset `transform` and `boxShadow` back to default

## 4. Active card accent bar

- [x] 4.1 In `LibraryCard`, add `borderLeft: isActive ? "3px solid var(--violet)" : "3px solid transparent"` to the card div style, and adjust `paddingLeft` from `"8px"` to `isActive ? "5px" : "8px"` to prevent layout shift

## 5. Action button visibility

- [x] 5.1 In `LibraryCard`, change the `# Tags` button desktop resting opacity from `0.3` to `0.55`
- [x] 5.2 In `actionBtnStyle`, change the `desktopOpacity` default from `0.3` to `0.55`
- [x] 5.3 Update corresponding `onMouseLeave` handlers to restore to `0.55` (not `0.3`)

## 6. Icon fixes

- [x] 6.1 In `LibraryPanel.tsx`, change the collapse button label from `▶` to `◀`
- [x] 6.2 In `LibraryCard`, change the archive action button content from `×` to `⊟`
- [x] 6.3 Update the `aria-label` for the archive button from `"Archive"` to `"Archive item"` for clarity
