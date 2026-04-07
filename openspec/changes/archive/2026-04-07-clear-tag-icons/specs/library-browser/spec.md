## MODIFIED Requirements

### Requirement: Library cards provide an edit action in active view
In the active library view, each library card SHALL display a labeled "# Tags" button alongside the archive button. On desktop, the button SHALL follow the hover-reveal pattern (opacity 0.3 at rest, full opacity on mouseEnter). On mobile (viewport ≤600px), the button SHALL be fully visible with a minimum 44px touch target.

#### Scenario: Edit button visible on desktop hover
- **WHEN** the user hovers over a library card on a desktop viewport
- **THEN** the "# Tags" button becomes fully visible at full opacity

#### Scenario: Edit button visible on mobile
- **WHEN** the user views a library card on a mobile viewport (≤600px)
- **THEN** the "# Tags" button is visible at full opacity without requiring hover

#### Scenario: Edit button label is self-describing
- **WHEN** a user sees the "# Tags" button for the first time
- **THEN** the visible text label makes its purpose clear without requiring a tooltip or hover state
