## Context

The current `LibraryData` structure in `localStorage` only has an `items` array. We need a way to store items that have been "deleted" by the user but are kept in an archive before permanent removal.

## Goals / Non-Goals

**Goals:**
- Update the data model to support archived items.
- Provide a clear UI path to move items to the archive and manage them there.
- Ensure archived items do not appear in the main library or during auto-advance.

**Non-Goals:**
- Undo functionality (Archive serves as the "recycle bin").
- Bulk archive/restore in v1.
- Searching within the archive.

## Decisions

### 1. Data Model Change: Separate `archivedItems` array
- **Decision:** Add `archivedItems: (VideoItem | PlaylistChannel)[]` to the `LibraryData` type.
- **Rationale:** Keeping archived items in a separate array makes it trivial to ensure they never leak into the main library logic (filtering, auto-advance, etc.) without needing to add `if (!item.isArchived)` checks everywhere.
- **Alternatives:** Add an `isArchived: boolean` flag to each item. This would require updating all existing library filtering and player queue logic to exclude archived items.

### 2. UI: Archive View state in `LibraryPanel`
- **Decision:** Add a local `view` state ("library" | "archive") to `LibraryPanel`.
- **Rationale:** It allows reusing the list rendering logic while switching the data source and the available action buttons on the cards.

### 3. "Delete" becomes "Archive" in the main view
- **Decision:** The existing "remove" button on library cards will now call `archiveItem`.
- **Rationale:** Align with the new two-stage deletion process.

### 4. Player behavior
- **Decision:** If an item currently playing is archived, it will continue playing until the end, but the next item will be pulled from the *active* library queue.
- **Rationale:** Simplest implementation that avoids jarring playback stops while still removing the item from the active rotation.

## Risks / Trade-offs

- [Risk] → **Data Bloat**: Users might archive many videos and forget to permanently delete them, filling up `localStorage` (5MB limit).
- Mitigation → The Archive view will clearly show the number of items and encourage permanent deletion.
- [Risk] → **ID Collisions**: If an item is archived and then the same item is added back to the library from a URL.
- Mitigation → `useLibrary` already has duplicate detection. We will extend it to check both `items` and `archivedItems`. If it exists in the archive, we can either block it or (better) offer to restore it. For v1, we will just treat the archive as "exists" and block re-adding.
