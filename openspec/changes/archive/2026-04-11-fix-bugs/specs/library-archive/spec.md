## MODIFIED Requirements

### Requirement: Empty state is archive-aware
The system SHALL display a contextually appropriate empty state when the archive contains no items, distinguishing it from the main library empty state.

When the user returns from archive view to library view (via the "← Library" button), and the library has no items, the system SHALL show the full EmptyState rather than the LibraryPanel with zero items. This applies on both desktop and mobile.

#### Scenario: Archive is empty
- **WHEN** the user navigates to the Archive view and no archived items exist
- **THEN** a message specific to the archive is shown (e.g., "Your archive is empty") rather than the generic library empty state

#### Scenario: Returning to empty library from archive restores EmptyState (desktop)
- **WHEN** the user navigated to archive view from an empty library on desktop, then clicks "← Library" in the panel header
- **THEN** the EmptyState is displayed, not the LibraryPanel with zero items

#### Scenario: Returning to empty library from archive restores EmptyState (mobile)
- **WHEN** the user navigated to archive view from an empty library on mobile, then taps "← Library" in the sheet header
- **THEN** the EmptyState is displayed when the sheet is closed
