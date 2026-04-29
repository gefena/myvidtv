## MODIFIED Requirements

### Requirement: User can export library to a JSON file
The system SHALL allow the user to download their full library (items, archived items, custom tags, settings, and watch history) as a `.json` file with the filename `myvidtv-library-YYYY-MM-DD.json`.

#### Scenario: Export triggered from library panel
- **WHEN** the user clicks the Export button in the library panel header
- **THEN** the browser downloads a `.json` file containing the full library data

#### Scenario: Exported file is valid JSON
- **WHEN** the user opens the downloaded file
- **THEN** it contains valid JSON with `items`, `archivedItems`, `customTags`, `settings`, and `watchHistory` fields

#### Scenario: Export works with empty library
- **WHEN** the user has no items and triggers export
- **THEN** a valid JSON file is downloaded with empty `items`, `archivedItems`, `customTags`, and `watchHistory` arrays

### Requirement: User can import a library from a JSON file
The system SHALL allow the user to select a previously exported `.json` file and load it into the library, with a choice of Replace or Merge mode. Imported watch history SHALL be sanitized and pruned using the same retention rules as local watch history.

#### Scenario: Import triggered from library panel
- **WHEN** the user clicks the Import button in the library panel header
- **THEN** a file picker opens accepting `.json` files

#### Scenario: Replace mode overwrites library
- **WHEN** the user selects a valid file and chooses Replace
- **THEN** the entire library (items, archived items, custom tags, settings, and watch history) is replaced with the imported data

#### Scenario: Merge mode adds new items
- **WHEN** the user selects a valid file and chooses Merge
- **THEN** items from the file that do not already exist (by ID) are added to the library; existing items and settings are unchanged
- **AND** custom tags are merged with existing custom tags
- **AND** watch history entries are merged by `ytId`, keeping the entry with the newest `lastWatchedAt`

#### Scenario: Duplicate items are skipped in Merge
- **WHEN** an imported item has the same `ytId` or `ytPlaylistId` as an existing item
- **THEN** the existing item is kept and the imported duplicate is skipped

### Requirement: Invalid import files are rejected with an error message
The system SHALL validate imported files and display an inline error message if the file is malformed or not a MyVidTV export.

During import, individual items that fail structural validation (missing required fields such as `type`, `ytId`/`ytPlaylistId`/`channelId`, or `tags`) SHALL be silently dropped. Individual watch history entries that fail structural validation (missing required fields such as `ytId`, invalid timestamps, or invalid thumbnail URLs) SHALL be silently dropped. The import SHALL proceed with the valid items and valid watch history entries. The system SHALL NOT crash or enter an error state due to malformed individual items or watch history entries.

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

#### Scenario: Invalid watch history entries are dropped
- **WHEN** the user imports a file where some watch history entries are malformed
- **THEN** those history entries are dropped and the remaining valid import data is imported successfully

#### Scenario: Channel items are preserved through import
- **WHEN** the user exports a library that contains channel items and then imports the file
- **THEN** the channel items appear in the library after import, identical to the exported entries

#### Scenario: Duplicate channel items are skipped in Merge
- **WHEN** an imported channel item has the same `channelId` as an existing channel item
- **THEN** the existing item is kept and the imported duplicate is skipped
