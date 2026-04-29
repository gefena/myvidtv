# library-browser Specification

## Purpose
Defines the browsing experience for the user's library — the empty state, the library panel, tag-based channel filtering, and the collapsible panel layout.
## Requirements
### Requirement: Empty state shown on first visit
When the library contains no items, the system SHALL display a cinematic empty state with a single input for adding a YouTube URL.

#### Scenario: First visit with no library data
- **WHEN** the user opens the site and localStorage contains no library items
- **THEN** a full-screen empty state is shown with a YouTube URL input field

### Requirement: Library panel displays all items
When the library contains items, the system SHALL display them in the collapsible library panel as a scrollable list with thumbnail, title, channel name, tags, and — for video items with watch history — a progress bar.

#### Scenario: Library has items
- **WHEN** the library contains one or more items
- **THEN** all items are shown in the library panel with thumbnail, title, channel name, and tag chips

#### Scenario: Video card with watch history shows progress bar
- **WHEN** a video item with a `lastWatchedRatio` greater than 0 is displayed in the library panel
- **THEN** a thin progress bar is shown at the bottom of the card indicating how much has been watched

### Requirement: Tag-based channel filtering
The system SHALL display a tag bar above the library list. Selecting a tag filters the library to only items with that tag. An "All" option shows the full library.

#### Scenario: User selects a tag
- **WHEN** the user clicks a tag in the tag bar
- **THEN** the library list updates to show only items tagged with that tag

#### Scenario: User selects All
- **WHEN** the user clicks "All" in the tag bar
- **THEN** all library items are shown regardless of tags

### Requirement: Library panel is collapsible
The system SHALL allow the user to collapse the library panel to give the player full width, and expand it again.

#### Scenario: User collapses the library
- **WHEN** the user clicks the collapse toggle
- **THEN** the library panel slides out of view and the player expands to fill the space

#### Scenario: User expands the library
- **WHEN** the user clicks the expand toggle while the library is collapsed
- **THEN** the library panel slides back into view

#### Scenario: Collapse state persists
- **WHEN** the user reloads the page
- **THEN** the library panel is in the same collapsed or expanded state as before

### Requirement: User can access the Archive view
The system SHALL provide a toggle or navigation link in the library panel to switch between active items and archived items.

#### Scenario: User opens Archive view
- **WHEN** the user clicks the "Archive" button in the library panel
- **THEN** the library list switches to show only archived items

#### Scenario: User returns to Active view
- **WHEN** the user clicks the "Back to Library" button from the Archive view
- **THEN** the library list switches back to show active items

### Requirement: Add URL accessible from the library panel
On mobile viewports, the system SHALL provide an "Add" button in the library sheet header that opens the add URL flow. On desktop viewports, the Add URL flow SHALL be accessible exclusively from the global Header button; the library panel header SHALL NOT contain a duplicate Add button.

#### Scenario: User clicks Add on mobile
- **WHEN** the user is on a mobile viewport and opens the library sheet
- **THEN** an "Add" button is visible in the sheet header and opens the add URL flow

#### Scenario: No duplicate Add on desktop
- **WHEN** the user is on a desktop viewport with the library panel expanded
- **THEN** the library panel header does NOT contain an Add button; the only Add button is in the global Header

### Requirement: Library action buttons always visible on mobile
On viewports ≤600px wide, the system SHALL display archive, restore, and permanent-delete action buttons on library cards at full opacity and with touch-accessible sizing. The hover-reveal pattern (opacity: 0.3, reveal on mouseEnter) SHALL only apply on non-touch (desktop) viewports.

#### Scenario: Archive button visible on mobile
- **WHEN** the user is on a small screen and the library panel is open
- **THEN** the archive button on each library card is fully visible without requiring hover

#### Scenario: Restore and delete buttons visible in archive on mobile
- **WHEN** the user is on a small screen viewing the archive
- **THEN** the restore and permanently delete buttons on each archived card are fully visible without requiring hover

### Requirement: Library cards provide an edit action in active view
In the active library view, each library card SHALL display a labeled "# Tags" button alongside the archive button. On desktop, the button SHALL follow the hover-reveal pattern (opacity 0.3 at rest, full opacity on mouseEnter). On mobile (viewport ≤600px), the button SHALL be fully visible with a minimum 44px touch target.

#### Scenario: Edit button visible on desktop hover
- **WHEN** the user hovers over a library card on a desktop viewport
- **THEN** the "# Tags" button becomes fully visible at full opacity

#### Scenario: Edit button visible on mobile
- **WHEN** the user views a library card on a mobile viewport (≤600px)
- **THEN** the "# Tags" button is visible at full opacity without requiring hover

#### Scenario: Edit button label is self-describing
- **WHEN** a user sees the "# Tags" button for the first time
- **THEN** the visible text label makes its purpose clear without requiring a tooltip or hover state

### Requirement: User can access the History view
The system SHALL provide a toggle or navigation link in the library panel to switch to the History view. The History entry point SHALL be available in both the desktop library panel and the mobile library sheet. The History view SHALL display watch history entries and SHALL NOT replace or modify the active library or archive views.

#### Scenario: User opens History view
- **WHEN** the user clicks the "History" button in the library panel
- **THEN** the library panel switches to show watch history entries

#### Scenario: User opens History view on mobile
- **WHEN** the user opens the library sheet on a small screen
- **THEN** a History entry point is visible in the sheet
- **AND** tapping it switches the sheet to show watch history entries

#### Scenario: User returns from History view
- **WHEN** the user leaves the History view
- **THEN** the library panel switches back to the selected non-history view without changing library contents

#### Scenario: History view does not show tag filter as item filter
- **WHEN** the user is viewing History
- **THEN** active library tag filtering does not hide watch history entries

