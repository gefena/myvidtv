## Why

In a recent update, custom themed hover tooltips were introduced for desktop icon buttons to replace the unstyled, delayed native browser tooltips (`title` attribute). However, the Export (`↓`) and Import (`↑`) buttons located in the `LibraryPanel` header and the mobile sheet header in `AppShell` were overlooked and still rely on the native browser tooltips. This creates an inconsistent UX on desktop viewports.

## What Changes

- Add custom themed hover tooltips to the Export and Import buttons.
- Remove the native `title` attributes from these buttons.
- Ensure the tooltips only appear on non-mobile viewports to prevent blocking mobile interactions.

## Capabilities

### New Capabilities

### Modified Capabilities
- `button-tooltips`: Extend the existing tooltip requirement to explicitly cover the Export and Import utility buttons in the library headers.

## Impact

- `src/components/LibraryPanel.tsx` — Add tooltip state and wrapper to header buttons.
- `src/components/AppShell.tsx` — Add tooltip state and wrapper to the mobile sheet header buttons (which are sometimes visible on larger viewports depending on the state).