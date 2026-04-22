## 1. Add Fixed-Step Seek Behavior

- [x] 1.1 Extend the player hook with 10-second backward and forward seek actions for video playback
- [x] 1.2 Clamp fixed-step seeks to the valid timeline range and preserve playback/progress state correctly after jumps
- [x] 1.3 Hide or disable the fixed-step seek controls when reliable timeline seeking is not available

## 2. Update Player Controls UI

- [x] 2.1 Add back-10 and forward-10 controls to the desktop player bars without changing the single-row desktop layout
- [x] 2.2 Add desktop tooltips for the new back-10 and forward-10 controls
- [x] 2.3 Rework the mobile watch and listen bars into two rows: metadata first, actions second
- [x] 2.4 Ensure the mobile action row preserves usable tap targets and does not crowd the metadata row

## 3. Verify Playback And Layout

- [x] 3.1 Verify fixed-step seek behavior in watch and listen modes for video playback
- [x] 3.2 Verify unavailable-state behavior for the new controls when reliable seeking is not supported
- [x] 3.3 Verify the mobile two-row layout keeps thumbnail, title, and controls readable on small screens
- [x] 3.4 Run lint and build after the UI and playback changes
