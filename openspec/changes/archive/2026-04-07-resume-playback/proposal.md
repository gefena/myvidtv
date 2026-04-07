## Why

Currently, when a user leaves a video and returns to it later, they have to manually find where they left off. This proposal introduces automatic playback resumption for individual videos to provide a more seamless and "cinematic" user experience.

## What Changes

- Update `VideoItem` type to include a `lastPosition` field (seconds).
- Automatically resume videos from the last saved position.
- Save playback progress every 10 seconds and on pause.
- Reset playback progress if the user is 95% or more through the video (marking it as finished).

## Capabilities

### New Capabilities
- `playback-resume`: Automatically saves and resumes playback position for individual videos.

### Modified Capabilities
<!-- None -->

## Impact

- `src/types/library.ts`: Update `VideoItem` type.
- `src/hooks/usePlayer.ts`: Implement progress tracking and resumption logic.
- `src/contexts/LibraryContext.tsx`: Add method to update video playback progress.
