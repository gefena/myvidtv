## 1. Remove Desktop Add Button from LibraryPanel

- [x] 1.1 In `src/components/LibraryPanel.tsx`, remove the `+ Add` button from the desktop panel header (the `!isArchive && !isMobile` guarded block inside the `!isMobile` header section)

## 2. Verify

- [x] 2.1 Confirm the desktop library panel header no longer shows `+ Add` in both library and archive views
- [x] 2.2 Confirm the mobile sheet header still shows `+ Add` in library view
- [x] 2.3 Confirm the global Header `+ Add` opens the add flow correctly on desktop
