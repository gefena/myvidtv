## 1. Export/Import logic

- [x] 1.1 Create `src/lib/exportImport.ts` with an `exportLibrary(data: LibraryData): void` function that serializes to JSON, creates a Blob, triggers a download with filename `myvidtv-library-YYYY-MM-DD.json`, and revokes the object URL
- [x] 1.2 Add `importLibrary(file: File): Promise<LibraryData>` to `exportImport.ts` that reads the file with `FileReader`, parses JSON, validates presence of `items` array, and throws a descriptive error if invalid

## 2. Context methods

- [x] 2.1 Add `exportLibrary(): void` method to `LibraryContext.tsx` that calls `exportLibrary(state.library)` from `exportImport.ts`
- [x] 2.2 Add `importLibrary(data: LibraryData, mode: "replace" | "merge"): void` method to `LibraryContext.tsx`: in replace mode call `writeStorage(data)` and `setState`; in merge mode merge items by ID (skip duplicates) and keep existing settings
- [x] 2.3 Expose both methods in the `LibraryContextValue` type

## 3. Import UI (inline merge/replace confirmation)

- [x] 3.1 Create `src/components/ImportConfirm.tsx` — a small inline panel showing the imported item count and two buttons: "Replace library" and "Merge (add new items)"; also shows an error state if import failed
- [x] 3.2 Wire `ImportConfirm` to call the context's `importLibrary` on button click and close itself on completion

## 4. Library panel controls

- [x] 4.1 Add `onExport` and `onImport` props to `LibraryPanel` and its desktop header, place `↓` (export) and `↑` (import) icon buttons next to the existing `+ Add` button in the panel header (desktop only, hidden in archive view)
- [x] 4.2 In `AppShell.tsx`, add state for `importConfirmOpen` and `pendingImportData`; pass `onExport` (calls context export directly) and `onImport` (opens file picker, on file selected sets pending data and opens confirm) to `LibraryPanel`
- [x] 4.3 Add the hidden `<input type="file" accept=".json">` ref in `AppShell.tsx`, wired to the import flow
- [x] 4.4 Render `<ImportConfirm>` in `AppShell.tsx` when `importConfirmOpen` is true, passing pending data, mode handlers, and a dismiss handler
- [x] 4.5 Add export/import buttons to the mobile sheet header in `AppShell.tsx` (the header row rendered above `LibraryPanel` when `librarySheetOpen` is true)

## 5. Validation and error display

- [x] 5.1 In `ImportConfirm`, display the error message returned from `importLibrary` parsing if the file is invalid, with a "Try another file" action that re-opens the file picker
