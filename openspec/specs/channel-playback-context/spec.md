# channel-playback-context Specification

## Purpose
Defines the channel context state retained during playback of a channel video, the ended state flag, and the back-to-channel affordances in the desktop now-playing and listen bars.

## Requirements

### Requirement: Channel context is retained while a channel video plays
When a video that originated from a channel browse is playing, the system SHALL retain the source channel identity (`channelId` and `title`) in application state. This context SHALL be cleared when the user explicitly selects a non-channel item from the library, or when auto-advance moves to a library item after the channel video ends.

Auto-advance SHALL NOT clear channel context as a side effect of loop-all wrap-around for items not in the library queue. Only an actual advance to a different, queued library item SHALL clear the context.

#### Scenario: Channel video selected from browse modal
- **WHEN** the user picks a video from the channel browse modal
- **THEN** the channel context is set to that channel's `channelId` and `title`, and the video begins playing

#### Scenario: User selects a library item while channel context is active
- **WHEN** channel context is set and the user taps a non-channel library item
- **THEN** the channel context is cleared and the new item plays

#### Scenario: Auto-advance clears channel context
- **WHEN** a channel video ends and auto-advance moves to a library item
- **THEN** the channel context is cleared

#### Scenario: Channel context preserved when channel video ends with no auto-advance
- **WHEN** a channel-browse video finishes and no auto-advance occurs (e.g. loop-all with out-of-queue item, or last item with loop off)
- **THEN** the channel context remains set and the "More from [Channel]" nudge is shown

### Requirement: Ended state distinguishes natural video completion from pause
The system SHALL expose a boolean `ended` state that is `true` only after a video finishes playing naturally (YouTube player state `ENDED`). It SHALL be reset to `false` when a new video begins playing.

#### Scenario: Video finishes playing
- **WHEN** the YouTube player fires its `ENDED` state event
- **THEN** the `ended` flag becomes `true` and `playing` becomes `false`

#### Scenario: New video starts after previous ended
- **WHEN** a new video begins playing after the `ended` state was `true`
- **THEN** `ended` resets to `false`

#### Scenario: User pauses a video
- **WHEN** the user pauses a video that has not reached its end
- **THEN** `playing` is `false` but `ended` remains `false`

### Requirement: Desktop now-playing bar shows a back-to-channel button
When channel context is active and a channel video is playing in watch mode, the system SHALL render the channel name in the now-playing bar as a tappable button. Activating it SHALL reopen the channel browse modal for the source channel. The button SHALL be visually distinct from plain text (e.g. underline or icon).

#### Scenario: Channel name is clickable during channel video playback
- **WHEN** a channel video is playing in watch mode on desktop and channel context is set
- **THEN** the channel name sub-line in the now-playing bar is rendered as a button

#### Scenario: Clicking channel name reopens browse modal
- **WHEN** the user clicks the channel name button in the now-playing bar
- **THEN** the channel browse modal opens for the source channel

#### Scenario: Non-channel video playing
- **WHEN** a library video with no channel context is playing
- **THEN** the channel name sub-line is plain text (not interactive)

### Requirement: Desktop listen bar shows a back-to-channel button
When channel context is active and a channel video is playing in listen mode, the system SHALL render the channel name in the mini listen bar as a tappable button with the same behavior as the watch mode bar.

#### Scenario: Channel name is clickable in listen bar
- **WHEN** a channel video is playing in listen mode on desktop and channel context is set
- **THEN** the channel name in the mini listen bar is rendered as a button that reopens the browse modal
