## 1. PlayerArea — ControlBtn tooltip

- [x] 1.1 Add `useState` for `showTooltip` to `ControlBtn` in `src/components/PlayerArea.tsx`
- [x] 1.2 Wrap the `<button>` in a `<div style={{ position: "relative", display: "inline-flex" }}>` with `onMouseEnter`/`onMouseLeave` controlling `showTooltip`
- [x] 1.3 Render the tooltip bubble above the button when `showTooltip && !isMobile`: `position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: var(--surface-2); border: 1px solid var(--border); borderRadius: 4px; color: var(--text-muted); fontSize: 11px; padding: 3px 7px; whiteSpace: nowrap; pointerEvents: none; zIndex: 10`
- [x] 1.4 Update loop button label in PlayerArea to show current state clearly: "Loop: off" / "Loop: one" / "Loop: all"

## 2. LibraryPanel — card action button tooltips

- [x] 2.1 Add `useState` for tooltip visibility to `LibraryCard` in `src/components/LibraryPanel.tsx` (one state per action button: archiveTooltip, restoreTooltip, deleteTooltip, tagsTooltip)
- [x] 2.2 Wrap each action button (⊟, ↺, 🗑, # Tags) in a `position: relative` div with `onMouseEnter`/`onMouseLeave`, render tooltip bubble above (same style as ControlBtn), only when `!isMobile`
- [x] 2.3 Set tooltip text: ⊟ → "Archive", ↺ restore → "Restore", 🗑 → "Delete", # Tags → "Edit tags"

## 3. LibraryPanel — panel header button tooltips

- [x] 3.1 Add tooltip to the ◀ collapse button (label: "Collapse") and the Archive/← Library toggle button in the desktop panel header, using same inline pattern

## 4. Verify

- [x] 4.1 Build passes with no TypeScript errors
- [x] 4.2 Tooltips appear on hover for all targeted buttons on desktop
- [x] 4.3 No tooltips visible on mobile (isMobile guard working)
- [x] 4.4 Loop button tooltip reflects current state correctly across all three states
