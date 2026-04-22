## Context

The player UI already exposes play/pause, skip-next, loop, and watch/listen controls from a shared `usePlayer` hook and a shared `PlayerArea` component. Desktop has enough horizontal space to absorb two additional fixed-step seek controls, but the mobile now-playing bars are already dense because they must preserve the thumbnail, title, channel metadata, and minimum tap target sizes.

This change spans both playback behavior and responsive layout. The new controls need a shared playback implementation, while the mobile presentation needs an intentional structural change rather than tighter spacing.

## Goals / Non-Goals

**Goals:**
- Add 10-second backward and forward seek controls for video playback
- Keep desktop controls on one row
- Rework the mobile player bars into two rows so metadata and controls both remain usable
- Preserve mobile touch target sizing and readability

**Non-Goals:**
- Redesign the desktop player bar beyond accommodating the new controls
- Add keyboard shortcuts or gesture controls in this change
- Change queue navigation semantics for playlists or skip-next
- Rework non-player surfaces such as library cards or browse modals

## Decisions

Add fixed-step seek behavior in the player hook, not in the UI layer.
Rationale: `usePlayer` already owns the YouTube player instance, progress state, and seek behavior. Keeping 10-second jumps there avoids duplicating player-specific logic across watch and listen layouts.
Alternative considered: calculating seek targets directly in `PlayerArea`. Rejected because that would spread playback logic into presentation code and make watch/listen controls diverge over time.

Keep desktop controls on a single row and use compact labels/tooltips there.
Rationale: desktop has enough horizontal room, and the user explicitly prefers tooltips on desktop rather than structural changes.
Alternative considered: making desktop two-row as well for consistency. Rejected because it adds vertical weight without solving a real desktop constraint.

Use two rows for mobile player bars: metadata first, actions second.
Rationale: the title/channel block and thumbnail need stable room, while the action cluster needs reliable 44px targets. Separating them into rows prevents cramped layouts and uncontrolled wrapping.
Alternative considered: squeezing all controls into one mobile row. Rejected because the row would either truncate metadata too aggressively or reduce touch target quality.

Show 10-second controls whenever the current playback surface can reliably seek within a video timeline, and hide or disable them otherwise.
Rationale: the user wants the controls available whenever watching a video, but not exposed with ambiguous behavior when fixed-step seeking is not guaranteed to work.
Alternative considered: always rendering the controls and allowing them to no-op. Rejected because a visible control that sometimes does nothing is harder to understand than an intentionally unavailable state.

## Risks / Trade-offs

[Mobile control bar becomes taller] -> Keep the split intentional with a metadata row and a compact action row, and preserve safe-area padding in the bottom bar.

[Seek jumps may not persist playback position promptly] -> Implement fixed-step seek in the hook and trigger position refresh logic after jump actions for video items.

[Control density still feels heavy on very small screens] -> Keep the metadata row free of transport controls so the second row can focus on tappable actions with predictable spacing.
