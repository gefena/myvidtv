## Context

The channel browse modal already works functionally, but its list rows force each video title onto a single ellipsized line. That is especially limiting on mobile, where the modal is narrow and long titles collapse to only a few visible words. The user wants a focused readability improvement without redesigning channel browsing more broadly.

## Goals / Non-Goals

**Goals:**
- Make channel video titles more readable on mobile while scrolling the channel browse list.
- Preserve the existing thumbnail, title, and published-date row structure.
- Keep the change scoped to the channel browse modal so the rest of the library and player UI remain untouched.

**Non-Goals:**
- Changing desktop title behavior.
- Adding a per-row expand/collapse interaction or a separate details panel.
- Redesigning the channel browse modal layout, metadata model, or feed loading logic.

## Decisions

Use a mobile-only two-line title clamp in the channel browse list.
Rationale: this directly addresses the readability problem with the smallest behavioral change. It preserves fast scanning and avoids introducing new interactions.

Keep the published date as a separate line beneath the title.
Rationale: the date remains useful browsing metadata, and separating it from the title avoids a mixed multi-line block that is harder to scan.

Keep row selection behavior unchanged.
Rationale: users already tap anywhere in the row to play a video, and readability does not require new controls or state.

Do not change desktop rows in this pass.
Rationale: the current complaint is mobile-specific, and limiting the scope reduces regression risk while we validate whether two lines are enough.

## Risks / Trade-offs

- Taller mobile rows reduce list density slightly -> Limit the title to two lines rather than allowing unrestricted wrapping.
- CSS line clamping can behave differently across browsers -> Prefer a simple approach that degrades to readable wrapped text rather than reverting to one-line truncation.
- Very long titles may still truncate after two lines -> Accept this for now because the goal is improved scanning, not full-title display.

## Migration Plan

No data migration is required. Ship the mobile UI adjustment, verify the channel browse modal on a real phone viewport, and revert the row styling if it causes unacceptable density or touch-target regressions.

## Open Questions

- None for this first pass. If two lines still feel too tight, a follow-up change can explore an explicit "show more" affordance.
