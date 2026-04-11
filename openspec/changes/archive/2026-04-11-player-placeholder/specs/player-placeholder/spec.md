## ADDED Requirements

### Requirement: Player placeholder is interactive when an action is available
When no item is playing and a contextual action is available (opening the library), the player placeholder SHALL be rendered as an interactive element. When no action is available (library already visible), it SHALL remain non-interactive.

The placeholder SHALL display the MyVidTV logo icon and a label. When interactive, it SHALL have a pointer cursor and a hover state indicating it is clickable.

#### Scenario: Placeholder clicked on mobile
- **WHEN** no item is playing and the user taps the player placeholder on mobile
- **THEN** the library sheet opens

#### Scenario: Placeholder clicked on desktop with library collapsed
- **WHEN** no item is playing and the user clicks the player placeholder on desktop with the library panel collapsed
- **THEN** the library panel expands

#### Scenario: Placeholder is passive on desktop with library open
- **WHEN** no item is playing on desktop and the library panel is already open
- **THEN** the placeholder is non-interactive — no cursor change, no click action

#### Scenario: Placeholder not shown when item is playing
- **WHEN** an item is currently playing or selected
- **THEN** the placeholder is not rendered
