## 1. Data Model & Context Updates

- [x] 1.1 Add `lastPosition?: number` to `VideoItem` type in `src/types/library.ts`
- [x] 1.2 Implement `updateVideoPosition(id: string, position: number)` in `LibraryContext.tsx`
- [x] 1.3 Ensure `updateVideoPosition` handles the 95% reset guard (save 0 if near end)

## 2. usePlayer Hook Updates

- [x] 2.1 Pass `lastPosition` as `startSeconds` to `loadVideoById` when loading a video item
- [x] 2.2 Add periodic progress saving (every 10 seconds) inside the existing `progressIntervalRef` effect
- [x] 2.3 Add immediate progress saving when the `pause` method is called
- [x] 2.4 Add immediate progress saving when the `skipNext` or `advanceQueue` methods are called (save 0 for the item being skipped)

## 3. Verification

- [x] 3.1 Confirm video resumes from the saved position after page reload
- [x] 3.2 Confirm video resumes from the saved position after switching to another video and back
- [x] 3.3 Confirm video resets to the beginning if stopped after the 95% mark
