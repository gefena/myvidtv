## Why

Long video titles become unreadable on mobile because the now-playing bars currently force the title into a single ellipsized line. An initial attempt to improve this did not reliably produce two visible lines on real mobile devices in production, so the change needs to cover both the intended behavior and a rendering approach that actually works in the browsers we care about.

## What Changes

- Make the mobile now-playing title visibly render as up to two readable lines before truncating in both watch and listen bars on the mobile browsers the app targets.
- Preserve the channel name as a separate secondary metadata line below the title.
- Keep the action controls on their own row with the same touch-accessible targets and without collapsing them back into the metadata row.
- Permit modest metadata-row height growth on mobile so title readability takes priority over preserving the current compact bar height.
- Replace browser-fragile title truncation behavior with a more reliable rendering approach if needed.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mobile-layout`: change the mobile now-playing metadata behavior so titles remain readable instead of being constrained to a single narrow ellipsized line.

## Impact

- Affected code: `src/components/PlayerArea.tsx`
- Affected UX: mobile watch bar, mobile listen bar
- No backend, API, or data-model changes
