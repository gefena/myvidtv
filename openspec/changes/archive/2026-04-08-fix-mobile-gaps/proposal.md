## Why

Three mobile usability gaps identified during a cross-feature audit: users can't access their library while in listen mode on mobile (they're stuck), tag bar buttons are far too small to tap reliably, and the mobile/desktop layout flash on first load creates a jarring experience.

## What Changes

- **Library accessible in listen mode on mobile** — show the Library sheet trigger button even when in listen mode; it was incorrectly hidden
- **Tag bar 44px touch targets** — wrap tag buttons to meet the minimum tap target height without changing the visual design
- **`useIsMobile` SSR fix** — initialize to `undefined` (unknown) instead of `false` to avoid rendering desktop layout on mobile during hydration

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `mobile-layout`: "Listen mode fills full screen on mobile" — library must remain accessible; "Player-first layout" — tag bar touch targets must meet 44px minimum

## Impact

- `src/components/AppShell.tsx` — remove `!settings.listenMode` guard from the library peek button
- `src/components/LibraryPanel.tsx` — add `minHeight: 44px` and vertical padding to tag bar buttons
- `src/hooks/useIsMobile.ts` — initialize state to `undefined`, return `boolean | undefined`; callers treat `undefined` as "not yet known" and defer layout decision
