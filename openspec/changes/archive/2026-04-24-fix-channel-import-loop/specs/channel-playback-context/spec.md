## MODIFIED Requirements

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
