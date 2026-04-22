## Why

Channel video titles are hard to scan on mobile because the scrolling channel browse list currently truncates each title to a single line. When only a few words are visible, users cannot reliably distinguish videos while browsing a channel, so the modal needs to expose more of each title without redesigning the whole flow.

## What Changes

- Update the mobile channel browse list so each video title can render across up to two readable lines before truncating.
- Keep the change scoped to the scrolling channel browse modal on small screens; desktop behavior does not need to change in this pass.
- Preserve the existing row structure with thumbnail, title, and published date so the list remains easy to scan and tap.

## Capabilities

### New Capabilities

### Modified Capabilities
- `channel-browsing`: change the mobile channel browse modal requirements so long video titles in the scrolling list remain readable instead of being forced to a single-line truncation.

## Impact

- Affected code: `src/components/ChannelBrowseModal.tsx`
- Affected UX: mobile channel browse modal scrolling list
- No API, backend, or data-model changes
