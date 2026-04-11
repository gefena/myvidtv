## 1. AppShell Mobile Sheet Header

- [x] 1.1 In `src/components/AppShell.tsx`, add `exportTooltip` and `importTooltip` state variables to the component (`const [exportTooltip, setExportTooltip] = useState(false);`, etc.)
- [x] 1.2 Wrap the Export button (`<button onClick={exportLibrary}>...`) in `<div style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setExportTooltip(true)} onMouseLeave={() => setExportTooltip(false)}>`
- [x] 1.3 Add the absolute positioned tooltip `div` inside the Export wrapper, rendered when `exportTooltip && !isMobile`
- [x] 1.4 Remove the native `title="Export library"` from the Export button
- [x] 1.5 Repeat steps 1.2 - 1.4 for the Import button (`<button onClick={handleImportClick}>...`) using `importTooltip` state

## 2. LibraryPanel Header

- [x] 2.1 In `src/components/LibraryPanel.tsx`, add `exportTooltip` and `importTooltip` state variables alongside the existing `viewTooltip` and `collapseTooltip` states
- [x] 2.2 Wrap the Export button (`<button onClick={onExport}>...`) in the hover-controlled inline-flex `div` and append the conditional absolute tooltip `div` (`exportTooltip && !isMobile`)
- [x] 2.3 Remove the native `title="Export library"` from the Export button
- [x] 2.4 Repeat steps 2.2 - 2.3 for the Import button (`<button onClick={onImport}>...`) using `importTooltip` state

## 3. Verify

- [x] 3.1 Build passes with no TypeScript errors
- [x] 3.2 Tooltips appear on hover for the ↓ and ↑ buttons on desktop viewports
- [x] 3.3 No tooltips appear on mobile viewports (or simulated mobile in dev tools)