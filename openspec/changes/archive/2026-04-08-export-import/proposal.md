## Why

MyVidTV stores everything in localStorage, which is device-specific — there's no way to move a curated library to a new device, share it with yourself, or back it up. Export/import solves this by letting users serialize their library to a file and restore it anywhere.

## What Changes

- **Export**: A button that downloads the user's full library (items, custom tags, settings) as a JSON file
- **Import**: A button that lets the user pick a JSON file and load it into the library, with a merge or replace choice
- **No new external dependencies** — native browser `Blob` / `FileReader` APIs only

## Capabilities

### New Capabilities
- `library-export-import`: Export the full library to a JSON file and import from a previously exported file, enabling cross-device portability

### Modified Capabilities
- none

## Impact

- `src/components/LibraryPanel.tsx` or a new `ExportImport.tsx` component — export/import UI controls
- `src/hooks/useLibrary.ts` — export and import methods
- `src/lib/exportImport.ts` (new) — serialization / deserialization logic
- No API changes, no new dependencies, no server-side work
