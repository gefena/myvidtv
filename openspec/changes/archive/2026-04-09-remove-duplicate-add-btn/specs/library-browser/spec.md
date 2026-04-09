## MODIFIED Requirements

### Requirement: Add URL accessible from the library panel
On mobile viewports, the system SHALL provide an "Add" button in the library sheet header that opens the add URL flow. On desktop viewports, the Add URL flow SHALL be accessible exclusively from the global Header button; the library panel header SHALL NOT contain a duplicate Add button.

#### Scenario: User clicks Add on mobile
- **WHEN** the user is on a mobile viewport and opens the library sheet
- **THEN** an "Add" button is visible in the sheet header and opens the add URL flow

#### Scenario: No duplicate Add on desktop
- **WHEN** the user is on a desktop viewport with the library panel expanded
- **THEN** the library panel header does NOT contain an Add button; the only Add button is in the global Header
