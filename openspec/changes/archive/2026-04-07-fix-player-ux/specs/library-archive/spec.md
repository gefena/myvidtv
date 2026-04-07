## ADDED Requirements

### Requirement: Empty state is archive-aware
When the active library is empty but archived items exist, the system SHALL display a message indicating that archived items are available, with a control to navigate to the archive view. The generic "add your first video" call-to-action SHALL NOT be shown exclusively when items are in the archive.

#### Scenario: Empty library with archived items
- **WHEN** the user has no active library items but has at least one archived item
- **THEN** the empty state shows a message such as "Your library is empty" with an additional prompt like "You have archived items — view archive →" and a clickable control to open the archive view

#### Scenario: Truly empty library
- **WHEN** the user has no active items and no archived items
- **THEN** the standard empty state is shown with the "Add your first video" prompt
