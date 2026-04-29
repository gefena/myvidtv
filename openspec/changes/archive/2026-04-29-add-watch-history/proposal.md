## Why

Channel-browsed videos are playable today but their progress is not retained because they are not saved as library video items. A general watch history solves that gap and also gives users a way to return to recently watched videos regardless of whether they came from the library, a saved channel, or another entry point.

## What Changes

- Add a persistent, local watch history that records recently watched YouTube videos by `ytId`.
- Store enough metadata for history rows to be useful: title, channel name, thumbnail, playback position, watched ratio, and watch timestamps.
- Retain only bounded history: the most recent 50 watched videos and only entries watched within the last 180 days.
- Update playback progress saving so every individual video writes to watch history, including transient channel videos.
- Keep saved `VideoItem` progress behavior intact, while synchronizing matching history progress when the same video is saved in the library.
- Add a History view where users can browse and replay recent watched videos without adding them to the library.
- Show watch progress for channel browse modal rows when those videos exist in history.
- Preserve watch history in export/import flows.
- No breaking changes.

## Capabilities

### New Capabilities
- `watch-history`: Records, retains, displays, and replays recently watched videos independent of library membership.

### Modified Capabilities
- `playback-resume`: Individual video playback resumes from saved library progress or watch history when no library item progress exists.
- `channel-browsing`: Channel modal rows display progress from watch history and selected channel videos update history while playing.
- `library-browser`: The library panel gains a History view alongside existing library/archive browsing.
- `library-export-import`: Exports and imports include watch history data.
- `mobile-layout`: The mobile library sheet includes History access and keeps history rows/actions touch-friendly.

## Impact

- `src/types/library.ts`: Add watch history types and extend `LibraryData`.
- `src/contexts/LibraryContext.tsx`: Read, write, prune, merge, and expose watch history; update progress writes.
- `src/hooks/usePlayer.ts`: Save progress for transient videos and resume from history when appropriate.
- `src/components/AppShell.tsx`: Pass channel/history context into playback and add History view wiring.
- `src/components/LibraryPanel.tsx`: Surface History view and render history rows with progress.
- `src/components/ChannelBrowseModal.tsx`: Merge fetched channel videos with local watch history progress.
- `src/lib/exportImport.ts`: Sanitize and preserve watch history during import/export.
- Mobile and responsive UI states: history navigation, row layout, remove action, and channel modal progress indicators must remain usable on small screens, touch devices, and desktop.
