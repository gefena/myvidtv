## MODIFIED Requirements

### Requirement: Player-first layout on small screens
On viewports ≤600px wide, the system SHALL display the YouTube player at the top of the screen in a 16:9 aspect ratio, with the now-playing controls bar directly below it, and a Library access button at the bottom. The Library access button SHALL be visible regardless of the current playback mode (watch or listen). Tag filter buttons in the library sheet SHALL have a minimum tap target height of 44px.

When a channel video is playing and channel context is active, the Library access button SHALL display "← [Channel Name]" instead of "☰ Library". Tapping it SHALL open the channel browse modal directly, bypassing the library sheet. When channel context is active and the video has ended naturally, the button label SHALL display "← More from [Channel Name]" as a nudge.

On mobile, the now-playing UI SHALL use two rows whenever playback metadata and transport actions are both shown: the first row for thumbnail and text metadata, and the second row for playback actions. The system MUST NOT compress the metadata row so aggressively that the title and channel text become unusable in order to fit extra controls.

#### Scenario: Player visible on mobile in watch mode
- **WHEN** the user is on a small screen with an item playing in watch mode
- **THEN** the player occupies the full width at 16:9 ratio, followed by the now-playing bar, followed by a Library peek button at the bottom

#### Scenario: Nothing playing on mobile
- **WHEN** the user is on a small screen and no item is selected
- **THEN** the library sheet is shown pre-expanded so the user can browse immediately

#### Scenario: Library button visible in listen mode
- **WHEN** the user is on a small screen and listen mode is active
- **THEN** the Library peek button is still visible so the user can open the library sheet and switch tracks

#### Scenario: Tag bar buttons are tappable on mobile
- **WHEN** the user views the tag filter bar on a small screen
- **THEN** each tag button has a minimum tap target height of 44px

#### Scenario: Peek bar shows back-to-channel while channel video plays
- **WHEN** a channel video is playing on a small screen and channel context is set
- **THEN** the peek bar displays "← [Channel Name]" instead of "☰ Library"

#### Scenario: Tapping back-to-channel peek bar opens channel browse
- **WHEN** the user taps the peek bar showing "← [Channel Name]"
- **THEN** the channel browse modal opens for that channel; the library sheet does NOT open

#### Scenario: Peek bar shows nudge after channel video ends
- **WHEN** a channel video has finished playing naturally and channel context is still set
- **THEN** the peek bar displays "← More from [Channel Name]"

#### Scenario: Peek bar reverts to Library after channel context cleared
- **WHEN** channel context is cleared (user picks a library item or auto-advance fires)
- **THEN** the peek bar displays "☰ Library" again

#### Scenario: Mobile watch bar splits metadata and actions into two rows
- **WHEN** a video is playing on a small screen in watch mode
- **THEN** the now-playing area shows thumbnail and metadata on the first row and transport controls on the second row

#### Scenario: Mobile listen bar splits metadata and actions into two rows
- **WHEN** a video is playing on a small screen in listen mode
- **THEN** the fixed mini bar shows metadata on the first row and transport controls on the second row
