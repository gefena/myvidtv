# Backlog Features Specification

## Purpose
Defines upcoming features and UI/UX improvements for MyVidTV, including enhanced playback looping, visual progress tracking, new branding, and content discovery.

## Requirements

### Requirement: Improved "No Video Selected" State
The system SHALL replace the current static YouTube icon placeholder with a functional or more informative empty state that prevents the user from getting "stuck" when no video is active.

#### Scenario: User clicks placeholder
- **WHEN** no video is selected and the placeholder is visible
- **THEN** clicking it SHOULD NOT lead to a broken state or "stuck" UI; it MAY open the Library or Add Flow.

### Requirement: Video Card Progress Bar
Each video item in the library list SHALL display a persistent visual progress bar indicating how much of the video has been watched.

#### Scenario: User watches part of a video
- **WHEN** a user plays a video and then stops
- **THEN** the library card for that video displays a progress bar reflecting the last saved position.

### Requirement: Playback Looping (Single & Tag)
The system SHALL support looping for both individual items and entire tag collections.

#### Scenario: Loop a single video
- **WHEN** the "Loop" mode is active for a single video
- **THEN** the video restarts automatically when it reaches the end.

#### Scenario: Loop a tag collection
- **WHEN** the "Loop" mode is active for a tag view
- **THEN** after the last video in the tag finishes, the first video in that tag begins playing automatically.

### Requirement: Predefined "Focus" Tag
The system SHALL include "Focus" as a predefined tag in the library.

#### Scenario: User views tag list
- **WHEN** the user opens the tag picker or filter list
- **THEN** "Focus" is available as a standard category alongside "music", "tech", etc.

### Requirement: Suggested Videos List
The system SHALL provide a "Suggested" list of videos to help users discover content or quickly add popular/relevant videos to their library.

#### Scenario: User views suggestions
- **WHEN** the user opens the "Add" flow or a dedicated discovery panel
- **THEN** a list of recommended YouTube videos is displayed.

### Requirement: New Custom Logo
The system SHALL feature a new custom-designed logo that reflects the MyVidTV brand identity, replacing the current placeholder/SVG triangle.

#### Scenario: Logo is displayed in header
- **WHEN** the user views the application
- **THEN** the new branded logo is visible in the header and favicon.

### Requirement: Vercel Analytics
The system SHALL integrate Vercel Analytics to track page views and basic usage patterns, with no auth or user identity involved.

#### Scenario: App is deployed on Vercel
- **WHEN** the app is deployed to Vercel
- **THEN** Vercel Analytics is active and reporting page views to the Vercel dashboard

### Requirement: Improved Overall Design
The system SHALL implement a refined UI/UX design, focusing on cinematic aesthetics, improved spacing, and polished interactions.

#### Scenario: Interface update
- **WHEN** the user navigates the app
- **THEN** the typography, color palette (violet accents), and layout transitions feel more premium and cohesive.
