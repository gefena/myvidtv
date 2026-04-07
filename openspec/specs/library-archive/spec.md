# library-archive Specification

## Purpose
Defines the behavior and layout for the archived items view, allowing users to manage removed items and perform permanent deletion.

## Requirements

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

### Requirement: Empty state is archive-aware
The system SHALL display a contextually appropriate empty state when the archive contains no items, distinguishing it from the main library empty state.

#### Scenario: Archive is empty
- **WHEN** the user navigates to the Archive view and no archived items exist
- **THEN** a message specific to the archive is shown (e.g., "Your archive is empty") rather than the generic library empty state
