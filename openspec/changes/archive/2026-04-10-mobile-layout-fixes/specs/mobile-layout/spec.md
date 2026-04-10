## MODIFIED Requirements

### Requirement: Responsive mobile layout
The system SHALL display the mobile layout (bottom-sheet library) on mobile devices regardless of viewport orientation (portrait or landscape). The mobile layout SHALL prevent React component tree unmounting of the YouTube iframe during orientation changes by locking the device into the mobile view.

#### Scenario: Device rotated to landscape
- **WHEN** a user viewing the application on a mobile device rotates it from portrait to landscape
- **THEN** the layout remains locked in the mobile bottom-sheet configuration instead of shifting to the side-by-side desktop layout, preventing iframe destruction.

### Requirement: Dynamic viewport height adaptation
The root layout containers SHALL use dynamic viewport height (`100dvh`) to ensure the application UI properly scales to fit the available screen space without jumping or hiding behind dynamic browser navigation chrome.

#### Scenario: Mobile browser address bar shifts
- **WHEN** a mobile user scrolls down causing the browser's navigation bar to collapse
- **THEN** the application container smoothly adjusts its height to fill the newly available space.
