## Context

The current mobile watch and listen bars already split metadata and controls into separate rows, but the title itself still uses single-line truncation. On narrow phones this often leaves only a few visible words, especially when a thumbnail or listen icon also occupies horizontal space. The relevant implementation is localized to `src/components/PlayerArea.tsx`, and the existing mobile-layout spec already states that the metadata row must not be compressed until title and channel text become unusable.

An initial implementation attempt used a clamp-style approach, but the live result on an actual mobile device still showed a single-line title. That makes rendering reliability part of the design problem, not just title-readability intent.

## Goals / Non-Goals

**Goals:**
- Improve mobile title readability in the now-playing watch bar
- Improve mobile title readability in the fixed listen bar
- Preserve a distinct secondary line for the channel name
- Keep the transport controls on their own row with current touch-target expectations

**Non-Goals:**
- Redesign desktop now-playing layout
- Change library card title behavior
- Add scrolling marquees, tap-to-expand state, or modal title reveals
- Change player metadata sources or playback behavior

## Decisions

### Use a rendering approach that visibly produces two title lines on target mobile browsers
Mobile now-playing titles will be allowed to wrap to two lines before truncating instead of remaining on a single `nowrap` line, but the implementation must prefer predictable browser behavior over a styling combination that can silently collapse back to one line in production.

Alternative considered:
- Keep one line and add marquee or tap-to-expand behavior. Rejected because it hides readability behind animation or interaction and adds complexity to a UI that should stay glanceable.
- Keep the current clamp implementation and assume the production result was a cache artifact. Rejected because the reported mobile output is the strongest validation signal available and should be treated as a real failure.

### Preserve the channel line as separate secondary metadata
The channel name will remain visible beneath the title rather than being merged into a single text block. This keeps source context readable even when the title uses both available lines.

Alternative considered:
- Collapse title and channel into one combined block. Rejected because it makes scanning harder and weakens the channel affordance.

### Keep the action row unchanged
The transport controls will remain on their own row and continue to prioritize touchability. The metadata row is allowed to grow vertically, but the control row should not lose space to compensate.

Alternative considered:
- Reduce control sizing to preserve the current bar height. Rejected because the recent mobile controls change explicitly protected tap target usability.

## Risks / Trade-offs

- [Risk] Mobile bars become noticeably taller on very small phones → Mitigation: limit the title to two lines rather than fully unbounded wrapping
- [Risk] The listen bar may feel heavier because it is fixed to the bottom → Mitigation: keep the channel line compact and avoid adding any new controls or metadata
- [Risk] Long unbroken strings may still overflow awkwardly → Mitigation: rely on standard wrapping/truncation behavior and keep final truncation in place after two lines
- [Risk] A browser-fragile technique may appear correct locally but fail on real mobile devices → Mitigation: favor simpler layout rules and verify the rendered result on actual mobile behavior before archiving
