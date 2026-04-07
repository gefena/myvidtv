## MODIFIED Requirements

### Requirement: User can remove an item from their library
The system SHALL allow the user to archive any video or playlist-channel from their library instead of immediate permanent deletion.

#### Scenario: Item moved to archive
- **WHEN** the user clicks the delete control on an item in the library
- **THEN** the item is moved to the archived items collection and no longer appears in the main library view

## ADDED Requirements

### Requirement: User can restore an item from the archive
The system SHALL allow the user to restore an archived item back to their active library.

#### Scenario: Item restored
- **WHEN** the user clicks the restore control on an archived item
- **THEN** the item is moved from the archived items collection back to the main library items collection

### Requirement: User can permanently delete an item from the archive
The system SHALL allow the user to permanently remove an archived item from localStorage.

#### Scenario: Item permanently deleted
- **WHEN** the user clicks the permanent delete control on an archived item
- **THEN** the item is removed from the archived items collection and deleted from localStorage
