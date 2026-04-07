## ADDED Requirements

### Requirement: Archive view displays archived items only
The system SHALL display archived items in a list similar to the library browser but with "Restore" and "Permanently Delete" actions.

#### Scenario: Archive view list
- **WHEN** the user is in the Archive view
- **THEN** archived items are shown with their thumbnail, title, and archive management controls

### Requirement: Permanent deletion requires confirmation
The system SHALL prompt the user for confirmation before permanently deleting an item from the archive.

#### Scenario: User confirms permanent deletion
- **WHEN** the user clicks the "Permanently Delete" button and confirms the dialog
- **THEN** the item is removed from localStorage

#### Scenario: User cancels permanent deletion
- **WHEN** the user clicks the "Permanently Delete" button and cancels the dialog
- **THEN** the item remains in the archive
