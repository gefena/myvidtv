## ADDED Requirements

### Requirement: User is presented with playlist add options
When a playlist URL is detected, the system SHALL show the user two options before saving: "Add as Channel" or "Pick Videos".

#### Scenario: Add as Channel selected
- **WHEN** the user selects "Add as Channel"
- **THEN** the playlist is stored as a single `playlist-channel` item with tags applied to the whole playlist

#### Scenario: Pick Videos selected
- **WHEN** the user selects "Pick Videos"
- **THEN** the system presents a paginated checklist of all videos in the playlist

### Requirement: Pick Videos checklist loads progressively
The system SHALL fetch playlist video details in pages of 50 and display them as they load, allowing the user to begin selecting before all items have loaded.

#### Scenario: Checklist opens for large playlist
- **WHEN** the user opens the Pick Videos checklist for a playlist with more than 50 videos
- **THEN** the first 50 videos are shown immediately and additional pages load as the user scrolls

#### Scenario: User selects individual videos
- **WHEN** the user checks or unchecks videos in the checklist
- **THEN** only the checked videos are added to the library as individual `video` items

### Requirement: Select All and Clear controls
The checklist SHALL provide "Select All" and "Clear" controls to bulk-manage selection.

#### Scenario: Select All clicked
- **WHEN** the user clicks "Select All"
- **THEN** all loaded videos in the checklist are checked

#### Scenario: Clear clicked
- **WHEN** the user clicks "Clear"
- **THEN** all checked videos are unchecked

### Requirement: Tags applied to playlist add flow
Tags selected during the playlist add flow SHALL be applied to all videos selected from the checklist, or to the playlist-channel item.

#### Scenario: Tags applied to picked videos
- **WHEN** the user adds videos via Pick Videos with tags selected
- **THEN** each saved video item carries those tags
