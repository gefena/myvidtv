## Context

LibraryCard has three edit-related buttons implemented as icon-only Unicode glyphs:
- **✎** — opens inline tag editor (aria-label: "Edit tags")
- **✓** — saves tag changes (aria-label: "Save tags")
- **✗** — cancels editing (aria-label: "Cancel editing")

These rely entirely on the aria-label for semantics, with no visible text. On desktop, the hover-reveal pattern at least signals "something is here", but on mobile all three are always visible with no explanation of their meaning.

## Goals / Non-Goals

**Goals:**
- Make all three controls self-describing via visible text labels
- Work well at both desktop (compact) and mobile (larger touch targets) sizes
- Keep the visual weight proportional — these are secondary actions, not primary

**Non-Goals:**
- Redesigning the archive (×), restore (↺), or delete (🗑) buttons
- Adding tooltips or popovers
- Changing the 44px mobile touch target requirement

## Decisions

**Decision: "# Tags" text button for the edit trigger**
The `#` prefix is a widely understood shorthand for tags/hashtags. Combined with the word "Tags", the button is unambiguous. On desktop it renders small (12px, muted color, same hover-reveal opacity pattern). On mobile it's slightly larger with the same always-visible style.

Alternatives considered:
- Keep ✎ glyph — fails the clarity test on mobile
- "Edit" alone — doesn't convey *what* is being edited
- 🏷️ emoji — inconsistent rendering across platforms, no text fallback

**Decision: "Save" / "Cancel" pill buttons in edit mode**
During editing, replace ✓/✗ with short text labels styled as small pill buttons (border-radius: 20px, same size as tag chips). This makes the affordance explicit — users immediately recognize "Save" and "Cancel" as actions.

```
Normal:                        Edit mode:
[# Tags] [×]                   [Save] [Cancel]
```

Pill styling reuses the existing tag chip visual language (border-radius: 20px) so it feels native to the tag-editing context.

**Decision: no change to desktop hover-reveal behavior**
The "# Tags" button retains the same opacity-based hover reveal on desktop (opacity 0.3 at rest, full on hover). This keeps desktop UX uncluttered — the label only appears on interaction, same as before.

## Risks / Trade-offs

- ["# Tags" takes more horizontal space than ✎] The card action area will be slightly wider in edit-closed state. The card uses `position: relative` with the actions as a flex row; the extra ~30px is within the card's right padding. Monitor on very narrow mobile screens.
- [Text buttons in edit mode are taller than glyphs] "Save"/"Cancel" pill buttons may be slightly taller than the ✓/✗ glyphs. Since cards expand vertically in edit mode anyway (TagPicker is below), this is not a layout issue.
