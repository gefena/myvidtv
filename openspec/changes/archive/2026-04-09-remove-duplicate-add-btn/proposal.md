## Why

The desktop UI shows two identical `+ Add` buttons simultaneously — one in the global Header and one in the LibraryPanel header. Two buttons doing the same thing on the same screen is redundant and implies they might behave differently, which they don't.

## What Changes

- Remove the `+ Add` button from the LibraryPanel desktop header
- The Header `+ Add` remains as the single primary action
- The `onAdd` prop on `LibraryPanel` is no longer needed for this button (it's still used by mobile sheet, so the prop stays)

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `library-browser`: The desktop panel header no longer contains an Add button; the global header is the sole add entry point

## Impact

- `src/components/LibraryPanel.tsx` — remove the `+ Add` button from the desktop panel header (the `!isMobile && !isArchive` section)
- No prop removals needed; `onAdd` is still used on mobile
