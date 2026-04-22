## MODIFIED Requirements

### Requirement: Channel browse modal
Clicking a channel card SHALL open a modal overlay that fetches and displays the channel's most recent videos via YouTube's public RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`). The modal SHALL show video title, thumbnail, and published date for each entry. The RSS feed provides approximately 15 most recent videos. The modal SHALL always open from the top of the list (no scroll state is preserved between openings). The modal MAY be triggered from sources other than a channel card click (e.g. a back-to-channel affordance in the player) — it SHALL behave identically regardless of trigger.

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
