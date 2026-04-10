## Why

Several desktop buttons use icon-only or ambiguous glyph labels (↺, ⊟, ♪, ↺1, ↺∞) with no visible explanation. A hover tooltip provides instant in-context help without cluttering the UI, and is especially valuable for the loop mode button whose label changes across three states.

## What Changes

- Add a small shared `Tooltip` component — a CSS-positioned label that appears above a button on hover
- Apply it to all desktop icon buttons in `PlayerArea` (via `ControlBtn`) and in `LibraryPanel` card actions
- Tooltip text is dynamic for state-driven buttons (loop mode, play/pause)
- No external library; no change to mobile behaviour

## Capabilities

### New Capabilities
- `button-tooltips`: hover tooltip behaviour for desktop icon buttons

### Modified Capabilities

## Impact

- `src/components/Tooltip.tsx` — new shared component (~40 lines)
- `src/components/PlayerArea.tsx` — `ControlBtn` gains optional tooltip rendering
- `src/components/LibraryPanel.tsx` — card action buttons (⊟, ↺, 🗑, # Tags) gain tooltips
