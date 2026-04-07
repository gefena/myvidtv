## 1. LibraryCard — Edit State

- [x] 1.1 In `src/components/LibraryPanel.tsx`, add `editing` boolean state (default `false`) and `editTags` string array state (initialized from `item.tags`) inside `LibraryCard`
- [x] 1.2 Add an edit button (✎) to the card's action button row, to the left of the archive button; apply the same hover-reveal style as the archive button (opacity 0.3 desktop, full opacity + 44px touch target on mobile); hide the button when `isArchive` is true
- [x] 1.3 On edit button click: set `editing = true` and set `editTags` to a copy of `item.tags`

## 2. Inline TagPicker Expansion

- [x] 2.1 When `editing` is true, render a `TagPicker` below the info row inside the card, passing `editTags` as `selected` and `customTags` from `useLibrary()` as `customTags`; wire `onChange` to update `editTags` local state
- [x] 2.2 When `editing` is true, replace the ✎ and archive buttons with a save (✓) button and a cancel (✗) button, styled consistently with other action buttons
- [x] 2.3 On save (✓) click: call `updateItem(id, { tags: editTags })`; call `addCustomTag` for any tags in `editTags` not already in `customTags` or `PREDEFINED_TAGS`; set `editing = false`
- [x] 2.4 On cancel (✗) click: set `editing = false` (editTags will be reset on next open via task 1.3)

## 3. Hook Wiring

- [x] 3.1 In `LibraryCard`, destructure `updateItem` and `addCustomTag` from `useLibrary()` (they already exist in `LibraryContext`)

## 4. Verify

- [x] 4.1 Run `npm run build` and confirm no TypeScript errors
- [ ] 4.2 Manually verify: open the library, click ✎ on a card, toggle tags, save — confirm the card updates immediately and persists after page reload
- [ ] 4.3 Manually verify: open the library, click ✎, then cancel — confirm original tags are unchanged
- [ ] 4.4 Manually verify: in archive view, confirm no ✎ button is present
