## Context

During a recent update, custom themed tooltips were introduced to replace unstyled native browser `title` attributes for most icon buttons in the desktop layout. However, the Export (`↓`) and Import (`↑`) buttons located in the `LibraryPanel` header and `AppShell` mobile sheet header were overlooked.

## Goals / Non-Goals

**Goals:**
- Provide a consistent tooltip experience across all utility icon buttons.
- Replace the native `title` attribute on Export/Import buttons with the existing custom tooltip implementation pattern.

**Non-Goals:**
- Refactoring the entire tooltip system into a standalone `<Tooltip>` wrapper component (this is out of scope for a quick fix).
- Adding tooltips to text-labeled buttons.

## Decisions

**1. Reusing the Inline Tooltip Pattern**
- **Decision:** Use the same inline `div` wrapper and state pattern already established in `LibraryPanel.tsx` (for the Archive and Collapse buttons).
- **Rationale:** Keeps the implementation fast and consistent with the immediate surrounding code without triggering a broader refactor. The wrapper `div` uses `position: relative` and `display: inline-flex`, and the tooltip is an absolutely positioned `div` conditionally rendered via a local `useState` boolean controlled by `onMouseEnter` and `onMouseLeave`.

## Risks / Trade-offs

- **Code Duplication:** The inline style object for the tooltip is duplicated across every button. This is an accepted trade-off to match the existing pattern implemented in the previous PR. If the number of tooltips grows significantly in the future, a shared generic `<Tooltip>` component should be considered.