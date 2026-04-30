import { expect, test } from "@playwright/test";
import { channelItem, seedLibrary, watchHistoryEntry } from "./fixtures";

test("desktop shell renders without unhandled page errors", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only smoke test");
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await page.goto("/");

  await expect(page.getByText("MyVidTV")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile library sheet is reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only smoke test");
  await seedLibrary(page, { items: [channelItem()] });

  await page.getByRole("button", { name: /library/i }).click();

  await expect(page.getByText("Seeded Channel")).toBeVisible();
});

test("history view displays seeded history", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only history smoke test");
  await seedLibrary(page, { watchHistory: [watchHistoryEntry()] });

  await page.getByRole("button", { name: "View history" }).click();

  await expect(page.getByText("Seeded History Video")).toBeVisible();
});

test("mobile history selection closes the sheet and keeps controls reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only smoke test");
  await seedLibrary(page, { watchHistory: [watchHistoryEntry()] });

  await page.getByRole("button", { name: /library/i }).click();
  await page.getByRole("button", { name: "History" }).click();
  await page.getByText("Seeded History Video").click();

  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByText("Seeded History Video")).toBeVisible();
});
