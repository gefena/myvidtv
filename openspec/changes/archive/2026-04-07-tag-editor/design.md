## Context

Library items have a `tags: string[]` field. Tags are set at add-time via `TagPicker` inside `AddFlow`. After saving, tags are displayed as read-only chips on `LibraryCard`. `LibraryContext` already exposes `updateItem(id, partial)` which can persist tag changes — the data layer is complete. The gap is purely UI.

`LibraryCard` currently shows:
- Thumbnail, title, channel, tag chips (read-only)
- Top-right action button: `×` (archive) in library view; `↺` + `🗑` in archive view

## Goals / Non-Goals

**Goals:**
- Let users edit tags on any active library item
- Inline UX — no new modal, editing expands the card in-place
- Reuse `TagPicker` exactly as-is
- Custom tags added during editing persist to `customTags` in LibraryContext

**Non-Goals:**
- Editing tags on archived items (archive is read-only by design)
- Renaming the item title (separate concern, not in scope)
- Bulk tag editing across multiple items

## Decisions

**Decision: inline card expansion, not a modal**
The edit UI opens by expanding the card vertically to reveal a `TagPicker`. The card's `motion.div` already has the `layout` prop (Framer Motion), so the expansion animates automatically. A modal would be a heavier pattern for a small action and would obscure the rest of the library.

Card states:
```
Normal state:
┌──────────────────────────────────────────────┐
│ [thumb]  Title                    [✎]  [×]  │
│          Channel                             │
│          [tag] [tag]                         │
└──────────────────────────────────────────────┘

Edit state (expanded):
┌──────────────────────────────────────────────┐
│ [thumb]  Title                    [✓]  [✗]  │
│          Channel                             │
│  ┌─────────────────────────────────────────┐ │
│  │ [music✓] [tech] [news] [+ custom tag]  │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Decision: edit state is local to the card**
`editing: boolean` lives as `useState` inside `LibraryCard`. No state lifting required. Only one card should be in edit mode at a time — opening a second card's editor doesn't need to close the first (unlikely scenario, not worth the complexity).

**Decision: save on ✓ click, cancel on ✗ click; no auto-save**
Auto-saving on every tag toggle would fire `updateItem` rapidly. Explicit save keeps the write clear and lets the user discard changes. On save: call `updateItem(id, { tags: editTags })` and call `addCustomTag` for any new custom tags. On cancel: reset `editTags` to the original tags and exit edit mode.

**Decision: ✎ button placement alongside archive button**
The edit button sits to the left of the archive `×` button. Same style (opacity-based hover reveal on desktop, always visible on mobile, 44px touch target on mobile). On mobile, `isMobile` prop is already threaded to `LibraryCard`.

**Decision: edit mode hidden in archive view**
`isArchive` is already a prop on `LibraryCard`. When `isArchive` is true, the edit button is not rendered.

## Risks / Trade-offs

- [Tag chip overflow] In edit mode, the TagPicker with many tags could make the card very tall. Acceptable — the scrollable list handles variable heights.
- [Custom tag persistence] If the user adds a custom tag during editing then cancels, the custom tag is still registered in `customTags` (via `addCustomTag`). This is a minor leak but consistent with how `AddFlow` works.

## Open Questions

_(none)_
