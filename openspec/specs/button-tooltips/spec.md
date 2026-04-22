# button-tooltips Specification

## Purpose
Defines the hover tooltip behavior for desktop icon buttons to provide instant in-context help without cluttering the UI.

## Requirements

### Requirement: Icon buttons show a tooltip on desktop hover
On desktop viewports, icon-only buttons SHALL display a short text label in a themed tooltip bubble when the pointer hovers over them. The tooltip SHALL appear above the button, styled to match the app's dark/light theme using CSS custom properties. On mobile viewports, no tooltip SHALL be shown.

#### Scenario: Hover over loop button shows current state
- **WHEN** the user hovers over the loop button on a desktop viewport
- **THEN** a tooltip appears above the button describing the current loop state (e.g. "Loop: off", "Loop: one", "Loop: all")

#### Scenario: Hover over archive card button shows label
- **WHEN** the user hovers over the ⊟ archive button on a library card on desktop
- **THEN** a tooltip appears with the label "Archive"

#### Scenario: Hover over skip button shows label
- **WHEN** the user hovers over the ⏭ skip button in the player bar on desktop
- **THEN** a tooltip appears with the label "Skip"

#### Scenario: Hover over export/import button shows label
- **WHEN** the user hovers over the ↓ Export or ↑ Import button on a desktop viewport
- **THEN** a tooltip appears above the button with the label "Export library" or "Import library"

#### Scenario: No tooltip on mobile
- **WHEN** the user is on a mobile viewport
- **THEN** no tooltip is shown on any button hover or tap

### Requirement: Tooltip does not interfere with button interaction
The tooltip element SHALL be non-interactive (pointer-events: none) so it does not block clicks on the button or adjacent elements.

#### Scenario: Tooltip is click-through
- **WHEN** a tooltip is visible and the user clicks the button beneath it
- **THEN** the button action fires normally and the tooltip does not intercept the click

### Requirement: Desktop seek controls provide descriptive tooltips
On non-mobile layouts, the 10-second backward and forward seek controls SHALL expose descriptive tooltips so the action is clear without consuming extra horizontal label space in the control row.

#### Scenario: User hovers back-10 control on desktop
- **WHEN** the user hovers the 10-second backward control on a desktop layout
- **THEN** a tooltip describes that the control jumps backward 10 seconds

#### Scenario: User hovers forward-10 control on desktop
- **WHEN** the user hovers the 10-second forward control on a desktop layout
- **THEN** a tooltip describes that the control jumps forward 10 seconds
