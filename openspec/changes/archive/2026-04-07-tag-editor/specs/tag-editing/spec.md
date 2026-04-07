## ADDED Requirements

### Requirement: User can edit tags on a library item
The system SHALL allow users to edit the tags of any item in the active library. The edit interface SHALL appear inline on the library card without opening a modal. Editing SHALL NOT be available on archived items.

#### Scenario: User opens tag editor
- **WHEN** the user clicks the edit (✎) button on a library card in the active library
- **THEN** the card expands inline to reveal a TagPicker showing the item's current tags pre-selected

#### Scenario: User adds a tag
- **WHEN** the user selects a tag in the inline TagPicker and clicks the save (✓) button
- **THEN** the new tag is added to the item and the card returns to its normal display state

#### Scenario: User removes a tag
- **WHEN** the user deselects a tag in the inline TagPicker and clicks the save (✓) button
- **THEN** the tag is removed from the item and the card returns to its normal display state

#### Scenario: User cancels editing
- **WHEN** the user clicks the cancel (✗) button while the card is in edit mode
- **THEN** the card collapses back to its normal state with the original tags unchanged

#### Scenario: Edit button not shown in archive view
- **WHEN** the user is viewing the archive
- **THEN** no edit button is present on any archived card
