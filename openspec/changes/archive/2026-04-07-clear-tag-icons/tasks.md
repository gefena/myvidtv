## 1. Edit Trigger Button

- [x] 1.1 In `src/components/LibraryPanel.tsx` `LibraryCard`, replace the ✎ glyph button with a text button reading `# Tags`; keep `aria-label="Edit tags"`; set `fontSize: "11px"`, `padding: isMobile ? "8px 10px" : "2px 6px"`, and retain the same hover-reveal opacity style (0.3 at rest, 1 on hover on desktop; always 0.7 on mobile)

## 2. Save / Cancel Buttons

- [x] 2.1 Replace the ✓ glyph button with a text button reading `Save`; style as a small pill (`borderRadius: "20px"`, `background: "var(--violet)"`, `color: "#fff"`, `fontSize: "11px"`, `padding: "3px 10px"`, `border: "none"`); keep `aria-label="Save tags"` and `onClick={handleSave}`
- [x] 2.2 Replace the ✗ glyph button with a text button reading `Cancel`; style as a small pill (`borderRadius: "20px"`, `background: "none"`, `border: "1px solid var(--border)"`, `color: "var(--text-muted)"`, `fontSize: "11px"`, `padding: "3px 10px"`); keep `aria-label="Cancel editing"` and `onClick={handleCancel}`
- [x] 2.3 Remove the `isMobile`-conditional sizing from the Save and Cancel buttons — they are always rendered as text pills with no mobile-specific overrides needed

## 3. Verify

- [x] 3.1 Run `npm run build` and confirm no TypeScript errors
- [ ] 3.2 Manually verify on desktop: hover a card — "# Tags" appears; click it — "Save" and "Cancel" pills appear with the TagPicker
- [ ] 3.3 Manually verify on mobile: "# Tags" is visible without hover; tapping it shows "Save" and "Cancel" as readable pill buttons
