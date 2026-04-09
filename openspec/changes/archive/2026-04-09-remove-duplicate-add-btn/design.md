## Context

The desktop `LibraryPanel` header contains a `+ Add` button that calls `onAdd` — the same handler wired to the `+ Add` button in the global `Header`. Both buttons open `AddFlow`. The duplication is a UI residue from when the panel header was the primary navigation surface; the global header CTA was later added but the panel button was never removed.

The `onAdd` prop on `LibraryPanel` is also used by the mobile sheet header, so it cannot be removed — only the desktop rendering path is affected.

## Goals / Non-Goals

**Goals:**
- Single `+ Add` entry point on desktop (the Header button)
- Cleaner panel header with fewer controls

**Non-Goals:**
- Changing mobile behaviour (mobile sheet keeps its own Add button)
- Removing `onAdd` prop from `LibraryPanel` (still needed for mobile)
- Any changes to `AddFlow`, `Header`, or `AppShell`

## Decisions

**Remove button from desktop panel header only.**
The `LibraryPanel` already branches on `isMobile`. The `+ Add` button sits inside the `!isMobile` block, guarded by `!isArchive`. Removing it from that block is the minimal, correct change.

Alternative considered — remove `onAdd` prop entirely and let `AppShell` handle add from Header only. Rejected because mobile sheet uses `onAdd` directly inside `LibraryPanel`; removing the prop would require lifting that button out of the panel and into `AppShell`'s mobile sheet JSX, which is more churn for no gain.

## Risks / Trade-offs

- None significant. This is a pure removal of a redundant element with no data or state implications.
- The Header `+ Add` is always visible on desktop (even when library is collapsed), so no user flow is broken.
