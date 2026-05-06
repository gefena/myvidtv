# metadata-strip Specification

## Purpose
Defines the visual treatment of the now-playing bar shown below the YouTube player in watch mode.

## Requirements

### Requirement: Now-playing bar has elevated visual treatment
The now-playing bar shown below the YouTube player in watch mode SHALL use a visually elevated surface: `--surface-3` background (instead of `--surface`), and a 2px `--border-hi` top border so it feels distinct from the player above.

#### Scenario: Video is playing in watch mode
- **WHEN** a video item is playing and the player is in watch mode (not listen mode)
- **THEN** the now-playing bar below the player shows `--surface-3` background and a 2px violet-tinted top border

#### Scenario: Nothing is playing
- **WHEN** no item is selected and the player shows the placeholder
- **THEN** no now-playing bar is rendered
