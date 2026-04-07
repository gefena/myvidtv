# favicon Specification

## Purpose
Defines the browser tab icon and Apple touch icon representing the MyTV brand.

## Requirements

### Requirement: Browser tab displays branded favicon
The system SHALL serve a custom MyTV favicon as an SVG file at `src/app/icon.svg`. Next.js App Router SHALL automatically surface this as the browser tab icon without requiring any explicit `<link>` tag.

#### Scenario: User opens the app in a browser tab
- **WHEN** the user navigates to the MyTV URL
- **THEN** the browser tab displays a dark rounded-square icon with a violet play triangle

#### Scenario: Icon renders at small sizes
- **WHEN** the favicon is displayed at 16×16px (standard browser tab size)
- **THEN** the play triangle and background are both clearly visible with no visual artifacts

### Requirement: iOS home screen bookmark uses Apple touch icon
The system SHALL serve a 180×180px PNG at `src/app/apple-icon.png` as the Apple touch icon for iOS home screen bookmarks.

#### Scenario: User bookmarks the app to iOS home screen
- **WHEN** the user adds MyTV to their iOS home screen
- **THEN** the home screen icon displays the branded dark/violet icon at full resolution
