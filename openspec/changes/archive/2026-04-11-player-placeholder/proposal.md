## Why

When the library has items but nothing is selected, the player area shows a black screen with non-interactive text "Select something to watch." On mobile this is a large dead zone with no affordance; on desktop with a collapsed library it gives no signal about what to do. The placeholder should guide the user toward their next action rather than doing nothing.

## What Changes

- `PlayerArea` gains an optional `onPlaceholderClick` prop
- The placeholder becomes interactive (clickable, with hover state) when `onPlaceholderClick` is provided
- Visual upgrade: logo icon + label instead of plain text
- `AppShell` wires up context-aware click behavior:
  - **Mobile**: opens the library sheet
  - **Desktop, library collapsed**: expands the library panel
  - **Desktop, library open**: no handler — placeholder stays visual-only (library is already visible)

## Capabilities

### New Capabilities
- `player-placeholder`: Defines the no-item-selected state in the player area — visual design and interactive behavior

### Modified Capabilities
<!-- None — playback spec covers the playing state, not the empty state -->

## Impact

- `src/components/PlayerArea.tsx` — new `onPlaceholderClick` prop, placeholder visual and interaction
- `src/components/AppShell.tsx` — pass context-aware handler to `PlayerArea`
