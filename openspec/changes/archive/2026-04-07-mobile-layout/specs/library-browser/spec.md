## ADDED Requirements

### Requirement: Library action buttons always visible on mobile
On viewports ≤600px wide, the system SHALL display archive, restore, and permanent-delete action buttons on library cards at full opacity and with touch-accessible sizing. The hover-reveal pattern (opacity: 0.3, reveal on mouseEnter) SHALL only apply on non-touch (desktop) viewports.

#### Scenario: Archive button visible on mobile
- **WHEN** the user is on a small screen and the library panel is open
- **THEN** the archive button on each library card is fully visible without requiring hover

#### Scenario: Restore and delete buttons visible in archive on mobile
- **WHEN** the user is on a small screen viewing the archive
- **THEN** the restore and permanently delete buttons on each archived card are fully visible without requiring hover
