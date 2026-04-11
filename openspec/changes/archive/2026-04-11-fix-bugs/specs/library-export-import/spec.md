## MODIFIED Requirements

### Requirement: Invalid import files are rejected with an error message
The system SHALL validate imported files and display an inline error message if the file is malformed or not a MyVidTV export.

During import, individual items that fail structural validation (missing required fields such as `type`, `ytId`/`ytPlaylistId`, or `tags`) SHALL be silently dropped. The import SHALL proceed with the valid items. The system SHALL NOT crash or enter an error state due to malformed individual items.

#### Scenario: Malformed JSON file selected
- **WHEN** the user selects a file that is not valid JSON
- **THEN** the import is rejected and an error message is shown in the UI

#### Scenario: Wrong JSON structure
- **WHEN** the user selects a valid JSON file that is missing the `items` array
- **THEN** the import is rejected and an error message is shown in the UI

#### Scenario: Items with missing required fields are dropped
- **WHEN** the user imports a file where some items lack required fields (e.g., missing `type` or `ytId`)
- **THEN** those items are dropped and the remaining valid items are imported successfully
