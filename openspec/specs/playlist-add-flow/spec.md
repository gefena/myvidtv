# playlist-add-flow Specification

## Purpose
Defines the flow for adding a YouTube playlist to the library. Playlists are always added as a named channel — there is no option to pick individual videos.

## Requirements

### Requirement: Playlist add flow is name + channel only
When a playlist URL is detected, the system SHALL prompt the user to enter a name for the playlist, then save it as a playlist-channel. No option to pick individual videos.

#### Scenario: Playlist URL detected
- **WHEN** the user pastes a YouTube playlist URL
- **THEN** the system parses the playlist ID from the URL and shows a name input field

#### Scenario: User names and saves the playlist
- **WHEN** the user types a name and confirms
- **THEN** the playlist is saved as a `playlist-channel` item with the user-supplied name

### Requirement: Tags applied to playlist add flow
Tags selected during the playlist add flow SHALL be applied to the playlist-channel item being saved.

#### Scenario: Tags applied to playlist-channel
- **WHEN** the user selects tags and saves a playlist-channel
- **THEN** the saved playlist-channel item carries those tags
