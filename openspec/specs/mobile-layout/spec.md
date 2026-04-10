# mobile-layout Specification

## Purpose
Defines the responsive layout behavior for viewports ≤600px wide — a player-first layout with a slide-up library sheet, listen mode integration, and safe-area handling for iOS devices.

## Requirements

### Requirement: Viewport renders at device width
The system SHALL include a `<meta name="viewport" content="width=device-width, initial-scale=1">` tag so mobile browsers render at the device's native width rather than scaling a desktop viewport.

#### Scenario: Page opens on a mobile device
- **WHEN** the user opens the app on a device with a viewport width of 600px or less
- **THEN** the page renders at the device's native width with no zooming or scaling applied

### Requirement: Player-first layout on small screens
On viewports ≤600px wide, the system SHALL display the YouTube player at the top of the screen in a 16:9 aspect ratio, with the now-playing controls bar directly below it, and a Library access button at the bottom. The Library access button SHALL be visible regardless of the current playback mode (watch or listen). Tag filter buttons in the library sheet SHALL have a minimum tap target height of 44px.

#### Scenario: Player visible on mobile in watch mode
- **WHEN** the user is on a small screen with an item playing in watch mode
- **THEN** the player occupies the full width at 16:9 ratio, followed by the now-playing bar, followed by a Library peek button at the bottom

#### Scenario: Nothing playing on mobile
- **WHEN** the user is on a small screen and no item is selected
- **THEN** the library sheet is shown pre-expanded so the user can browse immediately

#### Scenario: Library button visible in listen mode
- **WHEN** the user is on a small screen and listen mode is active
- **THEN** the Library peek button is still visible so the user can open the library sheet and switch tracks

#### Scenario: Tag bar buttons are tappable on mobile
- **WHEN** the user views the tag filter bar on a small screen
- **THEN** each tag button has a minimum tap target height of 44px

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
On small screens in listen mode, the system SHALL display the mini listen bar pinned at the bottom, and the Library peek button SHALL remain accessible above it so users can browse and switch tracks without leaving listen mode.

#### Scenario: Listen mode on mobile
- **WHEN** the user is on a small screen and switches to listen mode
- **THEN** the mini listen bar is fixed at the bottom with appropriate safe-area padding, and the Library peek button is visible above it

#### Scenario: User opens library while in listen mode
- **WHEN** the user taps the Library button while in listen mode on mobile
- **THEN** the library sheet opens and the user can select a different track; audio continues uninterrupted

### Requirement: Safe area insets respected
The system SHALL apply `env(safe-area-inset-bottom)` padding to all fixed bottom elements (listen bar, library sheet handle area) so they do not overlap the iOS home indicator or browser chrome.

#### Scenario: Fixed bottom element on iOS
- **WHEN** a fixed bottom element (listen bar or library sheet) is visible on an iOS device with a home indicator
- **THEN** the element's content is not obscured by the home indicator

### Requirement: Responsive mobile layout
The system SHALL display the mobile layout (bottom-sheet library) on mobile devices regardless of viewport orientation (portrait or landscape). The mobile layout SHALL prevent React component tree unmounting of the YouTube iframe during orientation changes by locking the device into the mobile view.

#### Scenario: Device rotated to landscape
- **WHEN** a user viewing the application on a mobile device rotates it from portrait to landscape
- **THEN** the layout remains locked in the mobile bottom-sheet configuration instead of shifting to the side-by-side desktop layout, preventing iframe destruction.

### Requirement: Dynamic viewport height adaptation
The root layout containers SHALL use dynamic viewport height (`100dvh`) to ensure the application UI properly scales to fit the available screen space without jumping or hiding behind dynamic browser navigation chrome.

#### Scenario: Mobile browser address bar shifts
- **WHEN** a mobile user scrolls down causing the browser's navigation bar to collapse
- **THEN** the application container smoothly adjusts its height to fill the newly available space.
