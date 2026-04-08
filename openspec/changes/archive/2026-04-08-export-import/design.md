## Context

MyVidTV stores its entire state — items, archived items, custom tags, and settings — as a single JSON blob in localStorage under the key `myvidtv_library`. The `LibraryData` type is the canonical shape. The context exposes `readStorage` / `writeStorage` for persistence. There is no server, no auth, no sync mechanism. Moving a library today means manually copying localStorage, which is developer-only friction.

## Goals / Non-Goals

**Goals:**
- Export the full library as a downloadable `.json` file using native browser APIs
- Import from a previously exported file with a "replace" or "merge" choice
- Surface export/import in the library panel header (desktop) and the mobile sheet header
- Validate the file on import to avoid silently loading corrupt data

**Non-Goals:**
- Cloud sync or real-time sharing between devices
- Partial export (e.g., export one tag) — full library only for now
- Import formats other than the app's own JSON format
- Auto-backup or scheduled export

## Decisions

### File format: raw `LibraryData` JSON

**Decision**: Export the exact `LibraryData` object (`items`, `archivedItems`, `customTags`, `settings`) as pretty-printed JSON with a `.json` extension and filename `myvidtv-library-YYYY-MM-DD.json`.

**Why**: No transformation needed — the export file is the same shape as localStorage. Import simply calls `writeStorage` (after validation). Any future schema migration logic can live in `readStorage` and will apply automatically on import too. Alternative (custom export format) adds a transform layer with no user benefit.

### Export mechanism: `Blob` + `<a download>`

**Decision**: Create a `Blob` with `application/json` MIME type, generate an object URL, click a hidden `<a>` tag programmatically, then revoke the URL.

**Why**: Standard pattern, no dependencies, works in all modern browsers. Safari requires the anchor click to happen synchronously in a user gesture handler — our button's `onClick` satisfies this.

### Import mechanism: `<input type="file">` + `FileReader`

**Decision**: A hidden `<input type="file" accept=".json">` is clicked programmatically from the import button. On file selection, `FileReader.readAsText` parses the JSON and validates the shape before loading.

**Why**: Same no-dependency approach. `FileReader` is synchronous-enough for small files. Validation guards against loading an incompatible or truncated file.

### Merge vs. Replace

**Decision**: On import, show a confirmation dialog with two options: **Replace** (overwrite entire library) and **Merge** (add imported items that don't already exist by ID, keep existing items). Settings are only replaced in Replace mode.

**Why**: Replace is the "move to new device" use case. Merge is the "combine two libraries" use case. Both are legitimate. Using `window.confirm` is too limited for a two-option choice — we'll use a small inline confirmation UI in the import flow (similar to the existing delete confirm pattern).

### Where to place the UI

**Decision**: Add `↓ Export` and `↑ Import` icon buttons to the library panel header (desktop), next to the existing `+ Add` and `Archive` buttons. On mobile, add them to the sheet header row.

**Why**: These are library-level actions, so they belong in the library panel header — consistent with where `+ Add` lives. Avoid adding a separate settings page for two buttons.

### Validation

**Decision**: On import, validate that the parsed JSON has `items` (array) and at least one recognized field. Reject silently malformed files with a user-facing error message in the UI (not `alert()`).

**Why**: A corrupt import should never silently overwrite a good library. Inline error is friendlier than `alert()`.

## Risks / Trade-offs

- **Large library files**: Libraries with many high-resolution thumbnails URLs could produce large JSON, but thumbnails are just URL strings — a 500-item library is still well under 1 MB. → No mitigation needed.
- **Settings import in Replace mode**: Importing settings from another device will overwrite theme preference. → Acceptable; user chose Replace. Could be a future option to exclude settings.
- **ID collision in Merge**: Items are matched by `ytId` / `ytPlaylistId`. If the same video exists in both libraries with different tags, the existing one wins. → Simple, predictable rule.
