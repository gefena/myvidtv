## MODIFIED Requirements

### Requirement: Channel browse modal
Clicking a channel card SHALL open a modal overlay that fetches and displays the channel's most recent videos via YouTube's public RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`). The modal SHALL show video title, thumbnail, and published date for each entry. The RSS feed provides approximately 15 most recent videos. The modal SHALL always open from the top of the list (no scroll state is preserved between openings). The modal MAY be triggered from sources other than a channel card click (e.g. a back-to-channel affordance in the player) — it SHALL behave identically regardless of trigger.

When a fetched channel video has a matching watch history entry with `lastWatchedRatio` greater than 0, the modal row SHALL display a thin progress indicator for that video. Selecting a channel video SHALL use watch history to resume playback when a matching entry exists, and playback SHALL create or update watch history without adding the video to the library.

On small screens, the scrolling video list in the channel browse modal SHALL render each video title across up to two readable lines before truncating instead of forcing a single-line ellipsis. The published date SHALL remain visible as separate metadata beneath the title, and the row SHALL remain a single tap target for playback.

#### Scenario: Browse modal opens and loads videos
- **WHEN** the user clicks a channel card
- **THEN** the channel browse modal opens and fetches the RSS feed, displaying the list of recent videos from the top

#### Scenario: Browse modal reopened from player back-to-channel affordance
- **WHEN** the user activates the back-to-channel control while a channel video is playing
- **THEN** the channel browse modal opens for the source channel, fetching fresh data from the top of the list

#### Scenario: Video selected for playback
- **WHEN** the user clicks a video in the channel browse modal
- **THEN** the video begins playing in the player and the modal closes; the video is NOT added to the library

#### Scenario: Channel row shows history progress
- **WHEN** a channel browse video has a matching watch history entry with `lastWatchedRatio` greater than 0
- **THEN** the modal row displays a thin progress indicator proportional to `lastWatchedRatio`

#### Scenario: Channel video resumes from history
- **WHEN** the user selects a channel browse video with a matching watch history entry that has `lastPosition` greater than 0
- **THEN** playback starts from the saved history position

#### Scenario: Channel video updates history
- **WHEN** the user starts playback of a video selected from the channel browse modal
- **THEN** the system creates or updates the matching watch history entry without adding the video to the library

#### Scenario: Channel video records source context
- **WHEN** the user starts playback of a video selected from the channel browse modal
- **THEN** the matching watch history entry records the source channel context

#### Scenario: RSS fetch fails
- **WHEN** the RSS feed cannot be fetched
- **THEN** the modal displays an error message and offers a retry option

#### Scenario: Mobile channel list shows more readable titles
- **WHEN** the user browses a channel on a small screen and a video has a long title
- **THEN** the title visibly renders across up to two lines before truncating instead of being forced to a single line
- **AND** the published date remains visible beneath the title

#### Scenario: Mobile channel row remains a single tap target
- **WHEN** the user taps anywhere on a video row in the mobile channel browse list
- **THEN** the system selects that video for playback using the same row-level interaction as before
