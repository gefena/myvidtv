## ADDED Requirements

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
