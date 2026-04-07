## Why

Users currently have no way to remove videos or playlists from their library. This proposal introduces a two-stage deletion process: moving items to an archive for safety, and allowing permanent deletion from the archive.

## What Changes

- Add a "Delete" action to library items.
- Introduce an "Archive" section/view in the library panel.
- Implement "Move to Archive" logic for items.
- Add "Restore" and "Permanently Delete" actions within the Archive view.
- Update `LibraryData` to include an `archivedItems` collection.

## Capabilities

### New Capabilities
- `library-archive`: Manages the lifecycle of archived items, including restoring and permanent removal.

### Modified Capabilities
- `library-management`: Update to handle the "Move to Archive" action and filtering out archived items from the main browser.
- `library-browser`: Add navigation/toggle for the Archive view and display archived items.

## Impact

- `src/types/library.ts`: Update `LibraryData` and item types.
- `src/hooks/useLibrary.ts`: Add `archiveItem`, `restoreItem`, and `permanentlyDeleteItem` methods.
- `src/components/LibraryPanel.tsx`: UI for delete actions and Archive view toggle.
- `src/components/AppShell.tsx`: Update to support the new view state.
