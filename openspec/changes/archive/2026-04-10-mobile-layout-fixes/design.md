## Context

The MyVidTV application has a responsive layout that switches between a mobile "bottom-sheet" player/library and a desktop "side-by-side" layout based purely on screen width (`window.innerWidth <= 600`). When a user views the application on a mobile device and rotates it to landscape, the screen width often exceeds 600px. This triggers a radical React component tree shift (from `<AppShell>`'s mobile branch to its desktop branch), destroying and remounting the YouTube iframe `<PlayerArea>`, which causes video playback to stop abruptly. 

Furthermore, the application container uses `height: "100vh"`. On mobile browsers (like Safari and Chrome for Android), `100vh` represents the maximum possible screen height, including the dynamic address bar/browser chrome. When scrolling or rotating, the chrome shifts, causing the UI to either jump abruptly or trap the player controls underneath the browser's navigation bar.

## Goals / Non-Goals

**Goals:**
- Prevent the mobile layout from switching to the desktop layout when a mobile device is rotated to landscape orientation.
- Prevent the UI from jumping or hiding beneath mobile browser navigation bars due to viewport height changes.
- Achieve these fixes without restructuring the underlying unified DOM (which is out of scope for this surgical fix).

**Non-Goals:**
- Completely rewriting the CSS layout to unify the desktop and mobile DOM trees (using CSS Grid/Flexbox instead of React branching).
- Moving the YouTube iframe out of the React tree to a global portal.

## Decisions

**1. CSS `100dvh` for Viewport Height**
- **Decision:** Replace `height: "100vh"` with `height: "100dvh"` in `AppShell.tsx` and `globals.css` (if applicable).
- **Rationale:** `100dvh` (Dynamic Viewport Height) natively accounts for the expanding/collapsing browser chrome on mobile devices, ensuring the bottom of the AppShell always perfectly hugs the top of the browser's navigation bar without requiring complex JavaScript resize observers.
- **Alternatives Considered:** Using `100svh` (Small Viewport Height) was considered, but `100dvh` provides a more fluid native feel when the chrome actually collapses. Standard `100vh` with JS calculation is notoriously flaky and slow.

**2. Augmenting `useIsMobile` with Pointer Queries**
- **Decision:** Update the `useIsMobile` hook breakpoint logic from `window.innerWidth <= 600` to `window.innerWidth <= 600 || window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches`.
- **Rationale:** A smartphone rotated to landscape will often have an `innerWidth` > 600px, but it will still have a `coarse` pointer (touchscreen) and a `landscape` orientation. Adding this heuristic explicitly traps smartphones in the "mobile layout" branch even when rotated sideways.
- **Alternatives Considered:** Removing the `resize` listener entirely so the layout locks on initial load. This was rejected because users frequently resize desktop browser windows and expect the layout to adapt responsively.

## Risks / Trade-offs

- [Risk] **Touchscreen Laptops:** A touchscreen laptop (which might match `pointer: coarse` depending on the browser) in a small window might get trapped in the mobile layout if it matches both coarse and landscape. 
  - **Mitigation:** The primary trigger (`innerWidth <= 600`) still governs narrow windows, and desktop browsers are increasingly smart about handling `pointer: coarse` accurately. The UX degradation of a touchscreen laptop getting a mobile layout in a narrow window is far less severe than the playback-breaking bug on actual mobile phones.