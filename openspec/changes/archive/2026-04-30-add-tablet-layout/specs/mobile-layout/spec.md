## MODIFIED Requirements

### Requirement: Responsive mobile layout
The system SHALL display the mobile layout (bottom-sheet library) exclusively on phone-sized viewports (width ≤ 600px), in any orientation. Touch devices with wider viewports (601px and above) SHALL receive the tablet layout, not the mobile layout.

The YouTube iframe SHALL never be destroyed during orientation changes. This is achieved by keeping `PlayerArea` in a structurally stable position in the React tree across all layout modes, rather than by locking all touch-landscape devices into the mobile layout.

#### Scenario: Phone in portrait uses mobile layout
- **WHEN** a user opens the app on a phone in portrait orientation (viewport ≤ 600px)
- **THEN** the mobile bottom-sheet layout is rendered

#### Scenario: Phone in landscape uses mobile layout
- **WHEN** a user opens the app on a phone in landscape orientation (viewport ≤ 600px)
- **THEN** the mobile bottom-sheet layout is rendered

#### Scenario: Tablet does not use mobile layout
- **WHEN** a user opens the app on a tablet (touch device, viewport 601–1200px)
- **THEN** the tablet layout is rendered instead of the mobile bottom-sheet layout

#### Scenario: Iframe survives phone orientation change
- **WHEN** a phone user rotates the device while a video is playing
- **THEN** the video continues playing from the same position without interruption
