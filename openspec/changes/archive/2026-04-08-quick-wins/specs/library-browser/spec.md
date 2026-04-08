## MODIFIED Requirements

### Requirement: Library panel displays all items
When the library contains items, the system SHALL display them in the collapsible library panel as a scrollable list with thumbnail, title, channel name, tags, and — for video items with watch history — a progress bar.

#### Scenario: Library has items
- **WHEN** the library contains one or more items
- **THEN** all items are shown in the library panel with thumbnail, title, channel name, and tag chips

#### Scenario: Video card with watch history shows progress bar
- **WHEN** a video item with a `lastWatchedRatio` greater than 0 is displayed in the library panel
- **THEN** a thin progress bar is shown at the bottom of the card indicating how much has been watched
