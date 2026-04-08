## Context

Three independent fixes with no shared state. All are low-risk, targeted changes.

## Goals / Non-Goals

**Goals:**
- Library sheet reachable from listen mode on mobile
- Tag filter buttons meet 44px tap target height
- No desktop layout flash on first mobile load

**Non-Goals:**
- Redesigning the listen mode mobile UX beyond making the library button visible
- Changing the visual size of tag buttons (padding-based expansion only)
- SSR rendering of the correct layout (hydration-only fix)

## Decisions

### Library button visible in listen mode

**Decision**: Remove the `!settings.listenMode` guard entirely from the Library peek button in `AppShell`. The mini listen bar is `position: fixed` at the bottom — the Library button sits above it in the flow, so it doesn't conflict visually. The user needs library access regardless of mode.

**Alternative considered**: Show a different trigger (e.g., a floating button). Rejected — the existing peek button is sufficient and already in the right place.

### Tag bar touch targets — padding wrapper

**Decision**: Add `minHeight: 44px` and vertical centering to tag bar buttons directly. The visual underline indicator stays at the bottom via `alignItems: flex-end` with inner text having the original padding. This expands the tap area without moving the visual underline.

**Simpler alternative**: Just add `paddingTop: 18px` to reach 44px. Accepted — even simpler, the underline border is on the button element itself so it moves with the button. The visual result is acceptable.

### `useIsMobile` SSR fix — `undefined` initial state

**Decision**: Change initial state from `false` to `undefined`. The hook returns `boolean | undefined`. Callers (`AppShell`) treat `undefined` as "render nothing" (return `null` while `!hydrated` already covers this) — or more practically, treat `undefined` the same as `false` (desktop layout) but suppress the layout until `hydrated` is true. Since `AppShell` already returns `null` when `!hydrated`, the flash is already partially mitigated. The real fix is ensuring `useIsMobile` sets state synchronously on mount before first paint — using `useLayoutEffect` instead of `useEffect`.

**Decision revised**: Switch `useIsMobile` from `useEffect` to `useLayoutEffect` for the initial check. This runs synchronously after DOM paint, before the browser has a chance to display the wrong layout. The resize listener stays on `useEffect` (no SSR issue there).
