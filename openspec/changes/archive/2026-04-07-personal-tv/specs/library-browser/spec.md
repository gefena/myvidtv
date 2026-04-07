## ADDED Requirements

### Requirement: Empty state shown on first visit
When the library contains no items, the system SHALL display a cinematic empty state with a single input for adding a YouTube URL.

#### Scenario: First visit with no library data
- **WHEN** the user opens the site and localStorage contains no library items
- **THEN** a full-screen empty state is shown with a YouTube URL input field

### Requirement: Library panel displays all items
When the library contains items, the system SHALL display them in the collapsible library panel as a scrollable list with thumbnail, title, duration, and tags.

#### Scenario: Library has items
- **WHEN** the library contains one or more items
- **THEN** all items are shown in the library panel with thumbnail, title, and tag chips

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

### Requirement: Add URL accessible from the library panel
The system SHALL provide a persistent "Add" button in the library panel header that opens the add URL flow.

#### Scenario: User clicks Add
- **WHEN** the user clicks the Add button in the library panel
- **THEN** a URL input dialog or inline field is presented
