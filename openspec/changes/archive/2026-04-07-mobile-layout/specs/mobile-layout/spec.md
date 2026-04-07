## ADDED Requirements

### Requirement: Viewport renders at device width
The system SHALL include a `<meta name="viewport" content="width=device-width, initial-scale=1">` tag so mobile browsers render at the device's native width rather than scaling a desktop viewport.

#### Scenario: Page opens on a mobile device
- **WHEN** the user opens the app on a device with a viewport width of 600px or less
- **THEN** the page renders at the device's native width with no zooming or scaling applied

### Requirement: Player-first layout on small screens
On viewports ≤600px wide, the system SHALL display the YouTube player at the top of the screen in a 16:9 aspect ratio, with the now-playing controls bar directly below it, and a Library access button at the bottom.

#### Scenario: Player visible on mobile in watch mode
- **WHEN** the user is on a small screen with an item playing in watch mode
- **THEN** the player occupies the full width at 16:9 ratio, followed by the now-playing bar, followed by a Library peek button at the bottom

#### Scenario: Nothing playing on mobile
- **WHEN** the user is on a small screen and no item is selected
- **THEN** the library sheet is shown pre-expanded so the user can browse immediately

### Requirement: Slide-up library sheet on mobile
On small screens, the system SHALL provide a full-width bottom sheet that slides up over the player when the user taps the Library button. The sheet SHALL contain the full library panel (tag filter, item list, archive toggle, Add button). Tapping an item SHALL play it and close the sheet.

#### Scenario: User opens the library sheet
- **WHEN** the user taps the Library button on a small screen
- **THEN** the library sheet animates up from the bottom, covering the player

#### Scenario: User selects an item from the sheet
- **WHEN** the user taps a library item in the open sheet
- **THEN** the item begins playing and the sheet closes

#### Scenario: User dismisses the sheet without selecting
- **WHEN** the user taps the close (×) button on the open library sheet
- **THEN** the sheet slides back down and the player is visible again

### Requirement: Listen mode fills full screen on mobile
On small screens in listen mode, the system SHALL display the library as a full-screen scrollable list (player hidden), with the mini listen bar pinned at the bottom respecting safe-area-inset-bottom.

#### Scenario: Listen mode on mobile
- **WHEN** the user is on a small screen and switches to listen mode
- **THEN** the library list fills the available screen, and the mini listen bar is fixed at the bottom with appropriate safe-area padding

### Requirement: Safe area insets respected
The system SHALL apply `env(safe-area-inset-bottom)` padding to all fixed bottom elements (listen bar, library sheet handle area) so they do not overlap the iOS home indicator or browser chrome.

#### Scenario: Fixed bottom element on iOS
- **WHEN** a fixed bottom element (listen bar or library sheet) is visible on an iOS device with a home indicator
- **THEN** the element's content is not obscured by the home indicator
