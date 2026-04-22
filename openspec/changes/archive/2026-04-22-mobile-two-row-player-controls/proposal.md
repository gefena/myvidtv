## Why

The current player controls fit comfortably on desktop, but adding 10-second back and forward actions would overcrowd the mobile now-playing bar. This change is needed so users can make small seek adjustments without sacrificing readable metadata or reliable touch targets on smaller screens.

## What Changes

- Add fixed-step playback actions to jump backward 10 seconds and forward 10 seconds while watching a video.
- Update the mobile now-playing layout to use two rows: one row for thumbnail and metadata, and a second row for playback actions.
- Keep desktop controls in a single row, where there is enough horizontal space for the additional actions.
- Preserve minimum mobile tap target sizes and avoid shrinking the title/channel area to fit more icons.

## Capabilities

### New Capabilities

### Modified Capabilities
- `playback`: add 10-second backward and forward seek controls to the player controls surface.
- `mobile-layout`: define a two-row mobile now-playing layout so metadata and actions remain usable when the extra controls are present.
- `button-tooltips`: require desktop tooltips for the new fixed-step seek controls.

## Impact

- Affected code: `src/hooks/usePlayer.ts`, `src/components/PlayerArea.tsx`
- Affected UX: desktop now-playing bar, mobile now-playing bar, mobile listen bar
- Risk area: mobile control density, touch target sizing, and playback state consistency after fixed-step seeking
