import { expect, test } from "@playwright/test";
import { channelItem, mockPodcastFeed, podcastFeed, podcastItem, readLibrary, seedLibrary, watchHistoryEntry } from "./fixtures";

test("desktop shell renders without unhandled page errors", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only smoke test");
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await page.goto("/");

  await expect(page).toHaveTitle(/MyVidTV/);
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

  await page.getByRole("button", { name: "history" }).click();

  await expect(page.getByText("Seeded History Video")).toBeVisible();
});

test("history view supports podcast entries with external artwork", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only history smoke test");
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await seedLibrary(page, {
    watchHistory: [
      watchHistoryEntry({
        mediaType: "podcast",
        ytId: "podcast-episode-1",
        title: "Seeded Podcast Episode",
        channelName: "Seeded Podcast",
        thumbnail: "https://podcast-cdn.example.test/artwork.jpg",
        source: {
          type: "podcast",
          feedUrl: "https://example.test/feed.xml",
          audioUrl: "https://example.test/audio.mp3",
        },
      }),
    ],
  });

  await page.getByRole("button", { name: "history" }).click();

  await expect(page.getByText("Seeded Podcast Episode")).toBeVisible();
  await expect(page.getByText("POD", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("add flow saves a podcast feed into the shared library", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only add flow smoke test");
  await mockPodcastFeed(page, podcastFeed());

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add" }).click();
  await page.locator('input[placeholder="Paste a YouTube or podcast link..."]').last().fill("https://example.test/feed.xml");
  await page.getByRole("button", { name: "Fetch" }).click();

  await expect(page.getByText("Seeded Podcast")).toBeVisible();
  await expect(page.getByText("Seeded Host · 1 episodes")).toBeVisible();

  await page.getByRole("button", { name: "Add Podcast" }).click();

  await expect(page.getByText("Seeded Podcast")).toBeVisible();
  const library = await readLibrary(page);
  expect(library.items.some((item) => item.type === "podcast" && item.title === "Seeded Podcast")).toBe(true);
});

test("podcast library item opens episodes, plays one, and writes history", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast smoke test");
  await mockPodcastFeed(page, podcastFeed());
  await seedLibrary(page, { items: [podcastItem()] });

  await page.getByText("Seeded Podcast", { exact: true }).click();
  await expect(page.getByText("Seeded Podcast Episode")).toBeVisible();

  await page.getByText("Seeded Podcast Episode").click();

  await expect(page.getByText("Seeded Podcast Episode").first()).toBeVisible();
  await page.getByRole("button", { name: "history" }).click();
  await expect(page.getByText("Seeded Podcast Episode").first()).toBeVisible();

  const library = await readLibrary(page);
  expect(library.watchHistory.some((entry) => entry.mediaType === "podcast" && entry.ytId === "seeded-episode-1")).toBe(true);
});

test("podcast browse reports empty and failed feeds", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast smoke test");
  await mockPodcastFeed(page, podcastFeed({ episodeCount: 2, episodes: [] }));
  await seedLibrary(page, { items: [podcastItem()] });

  await page.getByText("Seeded Podcast", { exact: true }).click();
  await expect(page.getByText("No playable audio episodes found.")).toBeVisible();

  await page.getByRole("button", { name: "×" }).click();
  await page.unroute("**/api/podcast-feed?**");
  await mockPodcastFeed(page, podcastFeed(), 502);

  await page.getByText("Seeded Podcast", { exact: true }).click();
  await expect(page.getByText("Podcast feed failed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("podcast player surfaces audio load failures", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast smoke test");
  await mockPodcastFeed(page, podcastFeed());
  await seedLibrary(page, { items: [podcastItem()] });

  await page.getByText("Seeded Podcast", { exact: true }).click();
  await page.getByText("Seeded Podcast Episode").click();
  await page.locator("audio").evaluate((audio) => audio.dispatchEvent(new Event("error")));

  await expect(page.getByText("Could not play podcast audio")).toBeVisible();
});

test("mobile history selection closes the sheet and keeps controls reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only smoke test");
  await seedLibrary(page, { watchHistory: [watchHistoryEntry()] });

  await page.getByRole("button", { name: /library/i }).click();
  await page.getByRole("button", { name: "history" }).click();
  await page.getByText("Seeded History Video").click();

  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByText("Seeded History Video").first()).toBeVisible();
});
