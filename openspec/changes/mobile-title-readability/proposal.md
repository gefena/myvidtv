## Why

Long video titles become unreadable on mobile because the now-playing bars currently force the title into a single ellipsized line. The recent two-row mobile control layout solved action crowding, but it still leaves too little room for metadata to be meaningfully scanned while choosing whether to keep listening or switch tracks.

## What Changes

- Allow the mobile now-playing title to use up to two lines before truncating in both watch and listen bars.
- Preserve the channel name as a separate secondary metadata line below the title.
- Keep the action controls on their own row with the same touch-accessible targets and without collapsing them back into the metadata row.
- Permit modest metadata-row height growth on mobile so title readability takes priority over preserving the current compact bar height.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mobile-layout`: change the mobile now-playing metadata behavior so titles remain readable instead of being constrained to a single narrow ellipsized line.

## Impact

- Affected code: `src/components/PlayerArea.tsx`
- Affected UX: mobile watch bar, mobile listen bar
- No backend, API, or data-model changes
