## 1. Dynamic Viewport Adjustments

- [x] 1.1 In `src/components/AppShell.tsx`, change the root container's `height` from `100vh` to `100dvh`
- [x] 1.2 Verify if `globals.css` contains any `100vh` references on html/body and update them to `100dvh` if present

## 2. Mobile Layout Persistence

- [x] 2.1 Open `src/hooks/useIsMobile.ts`
- [x] 2.2 Update the `setIsMobile` lazy initializer function to include the pointer/orientation media query: `() => typeof window !== "undefined" && (window.innerWidth <= 600 || window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches)`
- [x] 2.3 Update the `check` function inside `useEffect` to use the same logic: `setIsMobile(window.innerWidth <= 600 || window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches)`

## 3. Validation

- [x] 3.1 Run TypeScript build to ensure no errors
- [x] 3.2 Verify layout does not shift to desktop when simulating a wide but "coarse" (touch) device in Chrome dev tools (landscape orientation)