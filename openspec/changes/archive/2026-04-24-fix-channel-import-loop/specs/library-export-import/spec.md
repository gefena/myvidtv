## MODIFIED Requirements

### Requirement: Invalid import files are rejected with an error message
The system SHALL validate imported files and display an inline error message if the file is malformed or not a MyVidTV export.

During import, individual items that fail structural validation (missing required fields such as `type`, `ytId`/`ytPlaylistId`/`channelId`, or `tags`) SHALL be silently dropped. The import SHALL proceed with the valid items. The system SHALL NOT crash or enter an error state due to malformed individual items.

Valid item types are `"video"` (requires `ytId`), `"playlist-channel"` (requires `ytPlaylistId`), and `"channel"` (requires `channelId`). Items with an unrecognized `type` are dropped.

#### Scenario: Malformed JSON file selected
- **WHEN** the user selects a file that is not valid JSON
- **THEN** the import is rejected and an error message is shown in the UI

#### Scenario: Wrong JSON structure
- **WHEN** the user selects a valid JSON file that is missing the `items` array
- **THEN** the import is rejected and an error message is shown in the UI

#### Scenario: Items with missing required fields are dropped
- **WHEN** the user imports a file where some items lack required fields (e.g., missing `type` or `ytId`)
- **THEN** those items are dropped and the remaining valid items are imported successfully

#### Scenario: Channel items are preserved through import
- **WHEN** the user exports a library that contains channel items and then imports the file
- **THEN** the channel items appear in the library after import, identical to the exported entries

#### Scenario: Duplicate channel items are skipped in Merge
- **WHEN** an imported channel item has the same `channelId` as an existing channel item
- **THEN** the existing item is kept and the imported duplicate is skipped
