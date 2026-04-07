## 1. Type & Data Model Updates

- [x] 1.1 Update `LibraryData` in `src/types/library.ts` to include `archivedItems: LibraryItem[]`
- [x] 1.2 Update initial library state in `src/hooks/useLibrary.ts` to initialize `archivedItems` as an empty array

## 2. useLibrary Hook Methods

- [x] 2.1 Implement `archiveItem(id: string)` method: move item from `items` to `archivedItems`
- [x] 2.2 Implement `restoreItem(id: string)` method: move item from `archivedItems` to `items`
- [x] 2.3 Implement `permanentlyDeleteItem(id: string)` method: remove item from `archivedItems`
- [x] 2.4 Update `addVideo` and `addPlaylistChannel` duplication detection to check both `items` and `archivedItems`

## 3. LibraryPanel UI - Archive View

- [x] 3.1 Add `view` state ("library" | "archive") to `LibraryPanel.tsx`
- [x] 3.2 Add "Archive" button/toggle in the library header to switch views
- [x] 3.3 Add "Back" button in Archive view to return to main library
- [x] 3.4 Conditionally render items from `items` or `archivedItems` based on `view` state
- [x] 3.5 Hide tag filter bar when in Archive view (or filter `archivedItems` as well)

## 4. Item Card Actions

- [x] 4.1 In main library view: change "Remove" icon/button behavior to call `archiveItem`
- [x] 4.2 In Archive view: show "Restore" (↺) and "Permanently Delete" (🗑) buttons on cards
- [x] 4.3 Add confirmation dialog for "Permanently Delete" action

## 5. Verification

- [x] 5.1 Confirm archiving an item removes it from the main list and moves it to the Archive view
- [x] 5.2 Confirm restoring an item moves it back to the main list
- [x] 5.3 Confirm permanent deletion removes the item from localStorage
- [x] 5.4 Confirm duplicate detection works for items already in the archive
- [x] 5.5 Confirm auto-advance doesn't pick up items from the archive
