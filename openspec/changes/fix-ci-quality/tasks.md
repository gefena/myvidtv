## 1. Fix e2e selector

- [x] 1.1 In `tests/e2e/app.spec.ts`, replace `await expect(page.getByText("MyVidTV")).toBeVisible()` with `await expect(page).toHaveTitle(/MyVidTV/)` in the desktop smoke test

## 2. Fix CI Node 24 action warning

- [x] 2.1 In `.github/workflows/quality.yml`, add an `env` block to the `quality` job with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"`

## 3. Implement pre-push hook with lefthook

- [x] 3.1 Add `lefthook` as a dev dependency (`npm install --save-dev lefthook`)
- [x] 3.2 Create `lefthook.yml` at the repo root with a `pre-push` hook that runs `npm run check` and a `pre-commit` hook that runs `npm run lint`
- [x] 3.3 Add `"prepare": "lefthook install || true"` to the `scripts` section of `package.json` (the `|| true` ensures CI installs don't fail if there is no `.git` directory)

## 4. Verify

- [x] 4.1 Run `npm run check` locally — all core checks pass
- [x] 4.2 Run `npm run test:e2e` locally — all four smoke tests pass (requires dev server)
- [x] 4.3 Confirm `lefthook` hook fires on a test push (or run `npx lefthook run pre-push` manually)
