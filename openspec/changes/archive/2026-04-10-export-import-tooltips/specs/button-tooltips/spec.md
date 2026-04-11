## MODIFIED Requirements

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
