## MODIFIED Requirements

### Requirement: Slide-up library sheet on mobile
On small screens, the system SHALL provide a full-width bottom sheet that slides up over the player when the user taps the Library button. The sheet SHALL contain the full library panel, including tag filter, item list, archive toggle, History entry point, and Add button. Tapping a library item or history entry SHALL play it and close the sheet.

When the sheet is showing History, history rows SHALL use mobile-appropriate row layout with stable thumbnail dimensions, readable two-line title truncation, visible channel metadata, and touch-accessible actions. History navigation and remove-from-history controls SHALL NOT rely on hover.

#### Scenario: User opens the library sheet
- **WHEN** the user taps the Library button on a small screen
- **THEN** the library sheet animates up from the bottom, covering the player

#### Scenario: User selects an item from the sheet
- **WHEN** the user taps a library item in the open sheet
- **THEN** the item begins playing and the sheet closes

#### Scenario: User selects a history entry from the sheet
- **WHEN** the user taps a history entry in the open sheet
- **THEN** the history video begins playing and the sheet closes

#### Scenario: User dismisses the sheet without selecting
- **WHEN** the user taps the close (×) button on the open library sheet
- **THEN** the sheet slides back down and the player is visible again

#### Scenario: History controls are touch-accessible in mobile sheet
- **WHEN** the user views History in the mobile library sheet
- **THEN** history navigation and remove controls are visible and touch-accessible without hover
