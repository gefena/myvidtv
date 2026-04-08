## ADDED Requirements

### Requirement: Video card displays watch progress bar
Each `VideoItem` card in the library list SHALL display a thin progress bar below the thumbnail row indicating how much of the video has been watched. The bar SHALL reflect the last saved watch ratio (`lastWatchedRatio`). Cards with no watch history (ratio is 0 or undefined) SHALL show no bar.

#### Scenario: User has partially watched a video
- **WHEN** a video card is displayed and `lastWatchedRatio` is greater than 0
- **THEN** a thin horizontal bar is rendered at the bottom of the card, filled proportionally to `lastWatchedRatio`

#### Scenario: User has not watched a video
- **WHEN** a video card is displayed and `lastWatchedRatio` is 0 or undefined
- **THEN** no progress bar is rendered on the card

#### Scenario: User has fully watched a video
- **WHEN** a video has been watched to completion (position reset to 0 by the >95% rule)
- **THEN** no progress bar is shown (ratio is 0, same as unwatched)

#### Scenario: Playlist-channel cards show no progress bar
- **WHEN** a playlist-channel card is displayed
- **THEN** no progress bar is rendered (progress tracking only applies to individual videos)
