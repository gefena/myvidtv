## Why

Tags can only be assigned when a video is first added. There is no way to change, add, or remove tags afterwards. This forces users to archive and re-add content just to re-categorize it — a friction that defeats the purpose of the tagging system.

## What Changes

- Add an edit button (pencil icon) to each library card alongside the archive button
- Clicking the edit button expands the card inline to show the TagPicker with the item's current tags pre-selected
- User can toggle tags on/off and confirm with a save button (✓) or discard with cancel (✗)
- On save, `updateItem` in LibraryContext persists the new tag set
- Edit mode is available in the active library view only (not in archive view)

## Capabilities

### New Capabilities

- `tag-editing`: Ability to edit an item's tags after it has been added to the library

### Modified Capabilities

- `library-browser`: Library cards gain an edit action that expands the card inline

## Impact

- `src/components/LibraryPanel.tsx` (LibraryCard) — new edit state, inline TagPicker expansion
- `src/components/TagPicker.tsx` — reused as-is
- `src/contexts/LibraryContext.tsx` — `updateItem` already exists, no changes needed
- `src/hooks/useLibrary.ts` — exposes `updateItem`, no changes needed
