## 1. Detect Current Lint Issues

- [x] 1.1 Run `npm run lint` and capture the current set of failures and warnings
- [x] 1.2 Group findings by file and fix type so behavior-sensitive areas are identified before editing

## 2. Apply Safe Cleanup Fixes

- [x] 2.1 Fix lint issues in the affected files using the smallest code changes that satisfy the existing rules
- [x] 2.2 Avoid feature work, API contract changes, or UI behavior changes while resolving lint findings

## 3. Verify Cleanliness And Safety

- [x] 3.1 Re-run `npm run lint` and confirm the workspace is clean
- [x] 3.2 Perform targeted sanity checks for any touched runtime code and summarize any residual risks
