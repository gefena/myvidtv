## Why

The tag editing controls use Unicode glyphs (✎, ✓, ✗) that are ambiguous without context — ✎ is not universally understood as "edit tags", and tiny ✓/✗ buttons give no indication they mean "save" or "cancel". On mobile, where there are no hover tooltips, users have no way to discover what these buttons do.

## What Changes

- Replace the ✎ edit button with a text label **"Tags"** (with a small tag glyph prefix `#`) so its purpose is immediately clear
- Replace ✓ (save) with the text **"Save"** and ✗ (cancel) with **"Cancel"** during edit mode — both styled as small pill buttons so they read as actions, not symbols
- Keep all touch target sizes (44px min on mobile) unchanged
- Keep the archive (×), restore (↺), and delete (🗑) buttons unchanged — their icons are more universally understood

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `tag-editing`: Edit, save, and cancel controls change from icon-only to labeled buttons
- `library-browser`: Edit action button on library cards changes from ✎ glyph to labeled "# Tags" button

## Impact

- `src/components/LibraryPanel.tsx` (LibraryCard) — update button content and styling for ✎, ✓, ✗
