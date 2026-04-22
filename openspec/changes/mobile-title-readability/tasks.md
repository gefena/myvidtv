## 1. Update Mobile Now-Playing Layout

- [x] 1.1 Rework the mobile watch-bar title rendering so long titles visibly occupy up to two lines on real mobile devices
- [x] 1.2 Rework the mobile listen-bar title rendering so long titles visibly occupy up to two lines on real mobile devices
- [x] 1.3 Preserve the separate channel-name line beneath the title in both mobile bars while allowing the metadata row to grow vertically

## 2. Protect Mobile Controls Usability

- [x] 2.1 Keep the watch-bar action row visually separate from metadata after the title readability change
- [x] 2.2 Keep the listen-bar action row visually separate from metadata after the title readability change
- [ ] 2.3 Verify the mobile control buttons still preserve usable tap targets after the taller metadata row

## 3. Verify Layout Behavior

- [ ] 3.1 Verify long titles in mobile watch mode actually display across two readable lines instead of a single-line fallback
- [ ] 3.2 Verify long titles in mobile listen mode actually display across two readable lines instead of a single-line fallback
- [x] 3.3 Run lint and build after the follow-up mobile title fix
