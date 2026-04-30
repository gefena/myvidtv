# tablet-layout Specification

## Purpose
Defines the layout behavior for tablet-sized touch viewports (601–1200px wide, `pointer: coarse`). Tablets receive a purpose-built layout: always-visible library panel, orientation-adaptive split, 16:9 player sizing, and a structurally stable `PlayerArea` that survives orientation changes without iframe destruction.

## Requirements

### Requirement: Tablet layout detected by touch screen and width range
The system SHALL detect the tablet layout when `pointer: coarse` is true and viewport width is between 601px and 1200px inclusive, regardless of orientation. Devices outside this range SHALL receive the phone layout (≤600px) or desktop layout (>1200px or `pointer: fine`).

#### Scenario: Portrait tablet detected
- **WHEN** the user opens the app on a touch device with a viewport width between 601px and 1200px in portrait orientation
- **THEN** the system renders the tablet layout

#### Scenario: Landscape tablet detected
- **WHEN** the user opens the app on a touch device with a viewport width between 601px and 1200px in landscape orientation
- **THEN** the system renders the tablet layout

#### Scenario: Phone in landscape not treated as tablet
- **WHEN** a phone user rotates to landscape and the viewport width remains 600px or below
- **THEN** the phone layout is used, not the tablet layout

#### Scenario: Large touch laptop not treated as tablet
- **WHEN** a touch-enabled laptop with viewport width above 1200px opens the app
- **THEN** the desktop layout is used

### Requirement: Tablet layout adapts orientation without switching layouts
The tablet layout SHALL use CSS `orientation` media queries to adapt its flex direction between portrait (column) and landscape (row). No JavaScript state change, component remount, or layout branch switch SHALL occur when the device rotates.

#### Scenario: Device rotates from portrait to landscape while video plays
- **WHEN** a tablet user rotates the device from portrait to landscape while a video is playing
- **THEN** the layout reflows from column to row without interrupting playback and without any page error

#### Scenario: Device rotates from landscape to portrait while video plays
- **WHEN** a tablet user rotates the device from landscape to portrait while a video is playing
- **THEN** the layout reflows from row to column without interrupting playback

### Requirement: Library always visible on tablet
On tablet viewports, the library panel SHALL be permanently visible — no bottom sheet, no hamburger button, no collapse toggle. In portrait orientation the library SHALL appear below the player at full container width. In landscape orientation the library SHALL appear beside the player at a fixed width of approximately 280px.

#### Scenario: Library visible in portrait without interaction
- **WHEN** a tablet user opens the app in portrait orientation
- **THEN** the library panel is visible below the player without any tap or gesture required

#### Scenario: Library visible in landscape without interaction
- **WHEN** a tablet user opens the app in landscape orientation
- **THEN** the library panel is visible beside the player without any tap or gesture required

#### Scenario: No Library button or sheet on tablet
- **WHEN** a tablet user views the app
- **THEN** there is no "☰ Library" bottom bar button, no slide-up sheet, and no collapse toggle button on the library panel

### Requirement: Player occupies 16:9 at full width in portrait tablet
In portrait orientation on tablet, the player SHALL render at 16:9 aspect ratio spanning the full container width, with the library panel filling the remaining vertical space below it as a scrollable list. When no item is selected, the player area SHALL display the same placeholder used on desktop (clickable area prompting the user to select something), and the library SHALL remain visible and scrollable below it.

#### Scenario: Player proportions in portrait tablet
- **WHEN** a tablet user views the app in portrait orientation with a video selected
- **THEN** the player spans the full container width at 16:9 ratio and the library is scrollable below it

#### Scenario: Nothing playing in portrait tablet
- **WHEN** a tablet user views the app in portrait orientation and no item is selected
- **THEN** the player area shows the placeholder and the library is visible and scrollable below it

### Requirement: Player and library share horizontal space in landscape tablet
In landscape orientation on tablet, the player SHALL flex to fill the available width while the library panel occupies a fixed sidebar of approximately 280px on the right. The player SHALL render at 16:9 aspect ratio based on its container width, with the now-playing controls appearing below the video in the remaining vertical space. The player area SHALL NOT stretch to fill the full container height.

#### Scenario: Side-by-side layout in landscape tablet
- **WHEN** a tablet user views the app in landscape orientation with a video selected
- **THEN** the player and library sit side by side, with the library as a fixed-width right panel

#### Scenario: Player height in landscape is width-driven not height-driven
- **WHEN** a tablet user views the app in landscape orientation
- **THEN** the video renders at 16:9 based on the player container's width, and any remaining vertical space below the video is used by the now-playing controls

#### Scenario: Nothing playing in landscape tablet
- **WHEN** a tablet user views the app in landscape orientation and no item is selected
- **THEN** the player area shows the placeholder and the library is visible and scrollable beside it

### Requirement: YouTube iframe is never destroyed during tablet orientation change
The tablet layout SHALL keep `PlayerArea` in a structurally stable position in the React component tree so that rotating the device does not unmount or remount the YouTube iframe.

#### Scenario: Iframe survives portrait-to-landscape rotation
- **WHEN** a tablet user rotates from portrait to landscape while a video is playing
- **THEN** the video continues playing from the same position with no reload or interruption

#### Scenario: Iframe survives landscape-to-portrait rotation
- **WHEN** a tablet user rotates from landscape to portrait while a video is playing
- **THEN** the video continues playing from the same position with no reload or interruption

### Requirement: Listen mode does not change tablet layout structure
On tablet, activating listen mode SHALL show the audio-only player treatment in the existing player area. The library SHALL remain visible in its normal position. No fixed overlay or layout shift SHALL occur.

#### Scenario: Listen mode on tablet
- **WHEN** a tablet user activates listen mode
- **THEN** the same audio-only treatment used in desktop listen mode appears in the player area, the library remains visible, and the overall layout structure does not change

### Requirement: Touch targets meet minimum size on tablet
All interactive controls in the tablet layout SHALL meet a minimum tap target size of 44×44px.

#### Scenario: Library item tap targets on tablet
- **WHEN** a tablet user views the library panel
- **THEN** each item row is tall enough to be comfortably tapped

#### Scenario: Library header button tap targets on tablet
- **WHEN** a tablet user views the library panel header
- **THEN** the Add, Export, Import, History, and Archive buttons each meet the 44×44px minimum tap target size
