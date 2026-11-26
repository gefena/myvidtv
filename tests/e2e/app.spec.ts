import { expect, test } from "@playwright/test";
import { channelItem, mockPodcastFeed, mockPodcastResolve, mockYouTubeIframeApi, mockYouTubeOEmbed, podcastFeed, podcastItem, readLibrary, seedLibrary, videoItem, watchHistoryEntry } from "./fixtures";

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

  await page.getByTestId("phone-open-library").click();

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
  await mockPodcastResolve(page, { status: "resolved", feedUrl: "https://example.test/feed.xml", source: "direct" });
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

test("add flow lets users choose between resolved podcast feeds", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only add flow smoke test");
  await mockPodcastResolve(page, {
    status: "choices",
    source: "html",
    choices: [
      {
        title: "Wrong Feed",
        author: "Other Host",
        feedUrl: "https://example.test/wrong.xml",
        thumbnail: "https://podcast-cdn.example.test/wrong.jpg",
      },
      {
        title: "Seeded Podcast",
        author: "Seeded Host",
        feedUrl: "https://example.test/feed.xml",
        thumbnail: "https://podcast-cdn.example.test/artwork.jpg",
      },
    ],
  });
  await mockPodcastFeed(page, podcastFeed());

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add" }).click();
  await page.locator('input[placeholder="Paste a YouTube or podcast link..."]').last().fill("https://example.test/podcast");
  await page.getByRole("button", { name: "Fetch" }).click();

  await expect(page.getByText("Choose the podcast feed")).toBeVisible();
  await page.getByText("Seeded Podcast", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Podcast" })).toBeVisible();
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

  await page.getByRole("button", { name: "Close" }).click();
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

  await page.getByTestId("phone-open-library").click();
  await page.getByRole("button", { name: "history" }).click();
  await page.getByText("Seeded History Video").click();

  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByText("Seeded History Video").first()).toBeVisible();
});

test("mobile layout renders full-width 16:9 player, single-row >=40px controls, Escape sheet close, and theme toggle", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only layout test");
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  await mockYouTubeIframeApi(page);

  await seedLibrary(page, { items: [videoItem()] });
  await expect(page.getByTestId("player-video-stage")).toBeVisible();

  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });

    const measureInitial = () =>
      page.evaluate(() => {
        const stage = document.querySelector('[data-testid="player-video-stage"]')?.getBoundingClientRect();
        const frame = document.querySelector(".player-yt-frame")?.getBoundingClientRect();
        return {
          innerWidth: window.innerWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          stageWidth: stage?.width ?? 0,
          stageHeight: stage?.height ?? 0,
          frameWidth: frame?.width ?? 0,
          frameHeight: frame?.height ?? 0,
          hasDesktopCollapse: Boolean(document.querySelector('button[aria-label="Collapse library"]')),
        };
      });

    await expect.poll(async () => Math.abs((await measureInitial()).stageWidth - width)).toBeLessThanOrEqual(2);
    const initialMetrics = await measureInitial();

    expect(initialMetrics.scrollWidth).toBeLessThanOrEqual(initialMetrics.clientWidth);
    expect(initialMetrics.scrollWidth).toBeLessThanOrEqual(initialMetrics.innerWidth);
    expect(Math.abs(initialMetrics.stageWidth - width)).toBeLessThanOrEqual(2);
    expect(initialMetrics.stageWidth / initialMetrics.stageHeight).toBeCloseTo(16 / 9, 1);
    expect(Math.abs(initialMetrics.frameWidth - width)).toBeLessThanOrEqual(2);
    expect(initialMetrics.frameWidth / initialMetrics.frameHeight).toBeCloseTo(16 / 9, 1);
    expect(initialMetrics.hasDesktopCollapse).toBe(false);
  }

  // Short portrait height (420x430): max-height cap preserves 16:9 letterboxed frame without distortion
  await page.setViewportSize({ width: 420, height: 430 });
  const measureShortPortrait = () =>
    page.evaluate(() => {
      const stage = document.querySelector('[data-testid="player-video-stage"]')?.getBoundingClientRect();
      const frame = document.querySelector(".player-yt-frame")?.getBoundingClientRect();
      return {
        stageHeight: stage?.height ?? 0,
        stageWidth: stage?.width ?? 0,
        frameWidth: frame?.width ?? 0,
        frameHeight: frame?.height ?? 0,
      };
    });
  await expect.poll(async () => (await measureShortPortrait()).stageHeight).toBeLessThanOrEqual(192);
  const shortPortrait = await measureShortPortrait();
  expect(shortPortrait.stageHeight).toBeGreaterThanOrEqual(150);
  expect(shortPortrait.stageHeight).toBeLessThanOrEqual(192);
  expect(shortPortrait.frameWidth / shortPortrait.frameHeight).toBeCloseTo(16 / 9, 1);
  expect(shortPortrait.frameWidth).toBeLessThan(shortPortrait.stageWidth);

  await page.setViewportSize({ width: 390, height: 844 });

  // Open library sheet: focus moves into sheet, background becomes inert, Escape closes and restores focus
  const libraryTrigger = page.getByTestId("phone-open-library");
  await libraryTrigger.click();
  const closeBtn = page.getByRole("button", { name: "Close library" });
  await expect(closeBtn).toBeVisible();
  await expect(closeBtn).toBeFocused();
  await expect(page.locator("header")).toHaveAttribute("inert", "");

  // Opening AddFlow over the sheet: sheet becomes inert, Escape closes ONLY AddFlow and restores focus into sheet
  const sheetAddBtn = page.getByRole("dialog", { name: "Library" }).getByRole("button", { name: "+ Add" });
  await sheetAddBtn.click();
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).not.toBeAttached();
  await expect(closeBtn).toBeVisible();
  await expect(sheetAddBtn).toBeFocused();

  // Second Escape closes the library sheet and restores focus to trigger
  await page.keyboard.press("Escape");
  await expect(closeBtn).not.toBeAttached();
  await expect(page.locator("header")).not.toHaveAttribute("inert", "");
  await expect(libraryTrigger).toBeFocused();

  // Sheet header must not overflow at 320px and keeps >=40px tap targets
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByTestId("phone-open-library").click();
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  const sheet320 = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const btns = Array.from(dialog?.querySelectorAll("button") ?? []).slice(0, 5).map((b) => {
      const r = b.getBoundingClientRect();
      return { left: r.left, right: r.right, height: r.height };
    });
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      btns,
    };
  });
  expect(sheet320.scrollWidth).toBeLessThanOrEqual(sheet320.innerWidth);
  for (const b of sheet320.btns) {
    expect(b.height).toBeGreaterThanOrEqual(40);
    expect(b.right).toBeLessThanOrEqual(sheet320.innerWidth + 1);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();

  await page.setViewportSize({ width: 390, height: 844 });

  // Re-open library, select video, verify controls are in one row with >=40x40px targets
  await page.getByTestId("phone-open-library").click();
  await page.getByText("Seeded Long Video Title For Mobile Layout Verification").click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();

  await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();

  const playingMetrics = await page.evaluate(() => {
    const labels = [
      "Back 10 seconds",
      "Pause",
      "Play",
      "Forward 10 seconds",
      "Skip",
      "Loop: off",
      "Listen",
    ];
    const buttons = labels
      .map((label) => {
        const el = document.querySelector(`button[aria-label="${label}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { label, left: r.left, right: r.right, top: r.top, width: r.width, height: r.height };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);

    return {
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      buttons,
    };
  });

  expect(playingMetrics.scrollWidth).toBeLessThanOrEqual(playingMetrics.clientWidth);
  expect(playingMetrics.scrollWidth).toBeLessThanOrEqual(playingMetrics.innerWidth);
  expect(playingMetrics.buttons.length).toBe(6);

  const firstTop = playingMetrics.buttons[0].top;
  for (let i = 0; i < playingMetrics.buttons.length; i++) {
    const btn = playingMetrics.buttons[i];
    expect(btn.width).toBeGreaterThanOrEqual(44);
    expect(btn.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(btn.top - firstTop)).toBeLessThanOrEqual(2);
    expect(btn.left).toBeGreaterThanOrEqual(0);
    expect(btn.right).toBeLessThanOrEqual(playingMetrics.innerWidth);
    if (i > 0) {
      expect(btn.left).toBeGreaterThanOrEqual(playingMetrics.buttons[i - 1].right - 1);
    }
  }

  // Theme toggle also meets 44px touch target minimum on phone
  const themeToggleBox = await page.getByRole("button", { name: /switch to light theme/i }).boundingBox();
  expect(themeToggleBox).toBeTruthy();
  expect(themeToggleBox!.width).toBeGreaterThanOrEqual(44);
  expect(themeToggleBox!.height).toBeGreaterThanOrEqual(44);

  // Activate Loop so we can verify active Loop button contrast in both themes
  await page.getByRole("button", { name: "Loop: off" }).click();
  await expect(page.getByRole("button", { name: "Loop: one" })).toBeVisible();

  // Verify readable WCAG contrast (alpha-composited) on watch bar, active Loop, subtitle,
  // sheet header, listen bar (active Watch & Loop), and --text-dim >= --text-muted in both themes
  const measureElementContrast = (selector: string) =>
    page.evaluate((sel) => {
      const parseRgba = (css: string): [number, number, number, number] => {
        const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return [0, 0, 0, 0];
        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
      };
      const composite = (fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] => {
        const a = fg[3];
        return [
          fg[0] * a + bg[0] * (1 - a),
          fg[1] * a + bg[1] * (1 - a),
          fg[2] * a + bg[2] * (1 - a),
        ];
      };
      const lum = ([r, g, b]: [number, number, number]) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      const ratio = (c1: [number, number, number], c2: [number, number, number]) => {
        const l1 = Math.max(lum(c1), lum(c2));
        const l2 = Math.min(lum(c1), lum(c2));
        return (l1 + 0.05) / (l2 + 0.05);
      };
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return 0;
      const chain: Array<[number, number, number, number]> = [];
      let cur: HTMLElement | null = el;
      while (cur) {
        const bg = parseRgba(getComputedStyle(cur).backgroundColor);
        if (bg[3] > 0) chain.push(bg);
        if (bg[3] === 1) break;
        cur = cur.parentElement;
      }
      let effectiveBg: [number, number, number] = [0, 0, 0];
      for (let i = chain.length - 1; i >= 0; i--) {
        effectiveBg = composite(chain[i], effectiveBg);
      }
      const fgRgba = parseRgba(getComputedStyle(el).color);
      const effectiveFg = composite(fgRgba, effectiveBg);
      return ratio(effectiveFg, effectiveBg);
    }, selector);

  const checkDimVsMutedTokens = () =>
    page.evaluate(() => {
      const resolveColor = (varName: string) => {
        const probe = document.createElement("span");
        probe.style.color = `var(${varName})`;
        document.body.appendChild(probe);
        const css = getComputedStyle(probe).color;
        probe.remove();
        const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] as [number, number, number, number] : [0, 0, 0, 1] as [number, number, number, number];
      };
      const composite = (fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] => [
        fg[0] * fg[3] + bg[0] * (1 - fg[3]),
        fg[1] * fg[3] + bg[1] * (1 - fg[3]),
        fg[2] * fg[3] + bg[2] * (1 - fg[3]),
      ];
      const lum = ([r, g, b]: [number, number, number]) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      const ratio = (c1: [number, number, number], c2: [number, number, number]) => {
        const l1 = Math.max(lum(c1), lum(c2));
        const l2 = Math.min(lum(c1), lum(c2));
        return (l1 + 0.05) / (l2 + 0.05);
      };
      const dim = resolveColor("--text-dim");
      const muted = resolveColor("--text-muted");
      const surface = resolveColor("--surface").slice(0, 3) as [number, number, number];
      const surface3 = resolveColor("--surface-3").slice(0, 3) as [number, number, number];
      return {
        dimOnSurface: ratio(composite(dim, surface), surface),
        mutedOnSurface: ratio(composite(muted, surface), surface),
        dimOnSurface3: ratio(composite(dim, surface3), surface3),
        mutedOnSurface3: ratio(composite(muted, surface3), surface3),
      };
    });

  const assertThemeContrast = async () => {
    const tokens = await checkDimVsMutedTokens();
    expect(tokens.dimOnSurface).toBeGreaterThanOrEqual(tokens.mutedOnSurface);
    expect(tokens.dimOnSurface3).toBeGreaterThanOrEqual(tokens.mutedOnSurface3);
    expect(tokens.dimOnSurface).toBeGreaterThanOrEqual(4.5);
    expect(tokens.dimOnSurface3).toBeGreaterThanOrEqual(4.5);

    // Watch bar: inactive control, active Loop button, subtitle
    await expect.poll(() => measureElementContrast('button[aria-label="Back 10 seconds"]')).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => measureElementContrast('button[aria-label="Loop: one"]')).toBeGreaterThanOrEqual(3);
    await expect.poll(() => measureElementContrast('[data-testid="now-playing-subtitle"]')).toBeGreaterThanOrEqual(4.5);

    // Switch to Listen mode: sheet opens; check sheet header, listen bar inactive/active Loop/Watch, subtitle
    await page.getByRole("button", { name: "Listen", exact: true }).click();
    await expect(page.getByRole("button", { name: "Watch", exact: true })).toBeVisible();
    await expect.poll(() => measureElementContrast('[data-testid="sheet-header-title"]')).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => measureElementContrast('button[aria-label="Back 10 seconds"]')).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => measureElementContrast('button[aria-label="Loop: one"]')).toBeGreaterThanOrEqual(3);
    await expect.poll(() => measureElementContrast('button[aria-label="Watch"]')).toBeGreaterThanOrEqual(3);
    await expect.poll(() => measureElementContrast('[data-testid="listen-bar-subtitle"]')).toBeGreaterThanOrEqual(4.5);

    // Return to Watch mode
    await page.getByRole("button", { name: "Watch", exact: true }).click();
    await expect(page.getByRole("button", { name: "Listen", exact: true })).toBeVisible();
  };

  await assertThemeContrast();

  // Theme toggle works on mobile and maintains readable contrast in light theme
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await assertThemeContrast();

  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  expect(errors).toEqual([]);
});

test("mobile landscape viewports (844x390, 667x375, 568x320) keep controls and library reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only landscape test");
  await mockYouTubeIframeApi(page);
  await seedLibrary(page, { items: [videoItem()] });

  // 844x390 and 667x375 coarse-pointer landscape: side-by-side layout with visible controls and library
  for (const vp of [
    { width: 844, height: 390 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(vp);
    await expect(page.getByText("Seeded Long Video Title For Mobile Layout Verification").first()).toBeVisible();
    await page.getByText("Seeded Long Video Title For Mobile Layout Verification").first().click();
    await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();

    const metrics = await page.evaluate(() => {
      const player = document.querySelector(".tablet-player")?.getBoundingClientRect();
      const library = document.querySelector(".tablet-library")?.getBoundingClientRect();
      const exportBtn = document.querySelector('button[aria-label="Export library"]')?.getBoundingClientRect();
      const importBtn = document.querySelector('button[aria-label="Import library"]')?.getBoundingClientRect();
      const titleEl = Array.from(document.querySelectorAll(".tablet-library div")).find(
        (el) => el.childElementCount === 0 && el.textContent?.trim() === "Seeded Long Video Title For Mobile Layout Verification"
      );
      const titleRect = titleEl?.getBoundingClientRect();
      const labels = ["Back 10 seconds", "Pause", "Play", "Forward 10 seconds", "Skip", "Loop: off", "Listen"];
      const controls = labels
        .map((label) => {
          const el = document.querySelector(`button[aria-label="${label}"]`);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { label, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null);
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        player,
        library,
        exportBtn,
        importBtn,
        titleRect,
        controls,
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    expect(metrics.player).toBeTruthy();
    expect(metrics.library).toBeTruthy();
    // Side-by-side: library sits to the right of the player
    expect(metrics.library!.left).toBeGreaterThanOrEqual(metrics.player!.right - 2);
    // Sidebar header utility buttons are not clipped outside the sidebar or viewport
    expect(metrics.exportBtn).toBeTruthy();
    expect(metrics.importBtn).toBeTruthy();
    expect(metrics.exportBtn!.right).toBeLessThanOrEqual(metrics.library!.right + 1);
    expect(metrics.importBtn!.right).toBeLessThanOrEqual(metrics.library!.right + 1);
    // Card title has ample readable width (not squished by inline action buttons)
    expect(metrics.titleRect).toBeTruthy();
    expect(metrics.titleRect!.width).toBeGreaterThanOrEqual(100);
    expect(metrics.controls.length).toBe(6);
    for (const c of metrics.controls) {
      expect(c.top).toBeGreaterThanOrEqual(0);
      expect(c.bottom).toBeLessThanOrEqual(metrics.innerHeight + 1);
      expect(c.left).toBeGreaterThanOrEqual(0);
      expect(c.right).toBeLessThanOrEqual(metrics.player!.right + 1);
    }
  }

  // 568x320 short landscape phone: video stage stays >=150px tall while controls & peek bar fit inside viewport
  await page.setViewportSize({ width: 568, height: 320 });
  await expect(page.getByTestId("phone-open-library")).toBeVisible();
  await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();
  const measureShortPhone = () =>
    page.evaluate(() => {
      const stage = document.querySelector('[data-testid="player-video-stage"]')?.getBoundingClientRect();
      const frame = document.querySelector(".player-yt-frame")?.getBoundingClientRect();
      const labels = ["Back 10 seconds", "Pause", "Play", "Forward 10 seconds", "Skip", "Loop: off", "Listen"];
      const controls = labels
        .map((label) => {
          const el = document.querySelector(`button[aria-label="${label}"]`);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { label, top: r.top, bottom: r.bottom, right: r.right };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null);
      const openLib = document.querySelector('[data-testid="phone-open-library"]')?.getBoundingClientRect();
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        stageWidth: stage?.width ?? 0,
        stageHeight: stage?.height ?? 0,
        frameWidth: frame?.width ?? 0,
        frameHeight: frame?.height ?? 0,
        controls,
        openLib,
      };
    });
  await expect.poll(async () => Math.abs((await measureShortPhone()).stageWidth - 568)).toBeLessThanOrEqual(2);
  const shortPhone = await measureShortPhone();
  expect(shortPhone.scrollWidth).toBeLessThanOrEqual(shortPhone.innerWidth);
  expect(shortPhone.stageHeight).toBeGreaterThanOrEqual(150);
  expect(shortPhone.frameWidth / shortPhone.frameHeight).toBeCloseTo(16 / 9, 1);
  expect(shortPhone.controls.length).toBe(6);
  for (const c of shortPhone.controls) {
    expect(c.bottom).toBeLessThanOrEqual(shortPhone.innerHeight + 1);
    expect(c.right).toBeLessThanOrEqual(shortPhone.innerWidth + 1);
  }
  expect(shortPhone.openLib).toBeTruthy();
  expect(shortPhone.openLib!.bottom).toBeLessThanOrEqual(shortPhone.innerHeight + 1);
});

test("mobile listen mode keeps sheet open on pick, reopens on auto-advance, and clears measured bottom inset", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only listen mode test");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(page, podcastFeed());

  const longTitle = "Extremely Long Three Line Video Title To Verify Measured ResizeObserver Listen Bar Bottom Inset Without Overlapping The Final Library Row";
  const filler = Array.from({ length: 10 }, (_, idx) =>
    videoItem({ ytId: `vid-${idx + 2}`, title: `Library Filler Item ${idx + 2}` })
  );
  await seedLibrary(page, {
    items: [
      videoItem({ ytId: "vid-1", title: longTitle }),
      podcastItem(),
      ...filler,
    ],
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("phone-open-library").click();
  await page.getByText(longTitle).click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();

  // Switch to listen mode -> sheet opens automatically (non-modal: Header stays reachable, focus not stolen)
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeFocused();
  await expect(page.locator("header")).not.toHaveAttribute("inert", "");

  // Theme toggle in Header stays reachable while non-modal listen-mode sheet is open
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // Real modal (AddFlow) over non-modal listen sheet DOES make Header inert
  await page.getByRole("dialog", { name: "Library" }).getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).toBeVisible();
  await expect(page.locator("header")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).not.toBeAttached();
  await expect(page.locator("header")).not.toHaveAttribute("inert", "");

  // Measured CSS variable is set, listen-mode controls stay in one >=40px row, and last item clears the bar
  const insetCheck = await page.evaluate(() => {
    const varVal = getComputedStyle(document.documentElement).getPropertyValue("--phone-listen-bar-height").trim();
    const dialog = document.querySelector('[role="dialog"]');
    const scrollArea = Array.from(dialog?.querySelectorAll("div") ?? []).find(
      (el) => getComputedStyle(el).overflowY === "auto"
    ) as HTMLElement | undefined;
    if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
    const lastCard = Array.from(scrollArea?.querySelectorAll("div") ?? []).find(
      (el) => el.textContent?.includes("Library Filler Item 11") && el.children.length > 0
    );
    const watchBtn = document.querySelector('button[aria-label="Watch"]');
    let listenBar: HTMLElement | null = watchBtn?.parentElement ?? null;
    while (listenBar && getComputedStyle(listenBar).position !== "fixed") {
      listenBar = listenBar.parentElement;
    }
    const controlLabels = ["Back 10 seconds", "Pause", "Play", "Forward 10 seconds", "Skip", "Loop: off", "Watch"];
    const controls = controlLabels
      .map((label) => {
        const el = document.querySelector(`button[aria-label="${label}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { label, left: r.left, right: r.right, top: r.top, width: r.width, height: r.height };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      varPx: Number.parseInt(varVal, 10) || 0,
      lastCardBottom: lastCard?.getBoundingClientRect().bottom ?? 0,
      listenBarTop: listenBar?.getBoundingClientRect().top ?? 0,
      controls,
    };
  });
  expect(insetCheck.scrollWidth).toBeLessThanOrEqual(insetCheck.clientWidth);
  expect(insetCheck.varPx).toBeGreaterThan(100);
  expect(insetCheck.lastCardBottom).toBeLessThanOrEqual(insetCheck.listenBarTop + 2);
  expect(insetCheck.controls.length).toBe(6);
  const listenFirstTop = insetCheck.controls[0].top;
  for (let i = 0; i < insetCheck.controls.length; i++) {
    const c = insetCheck.controls[i];
    expect(c.width).toBeGreaterThanOrEqual(40);
    expect(c.height).toBeGreaterThanOrEqual(40);
    expect(Math.abs(c.top - listenFirstTop)).toBeLessThanOrEqual(2);
    expect(c.right).toBeLessThanOrEqual(insetCheck.clientWidth + 1);
    if (i > 0) {
      expect(c.left).toBeGreaterThanOrEqual(insetCheck.controls[i - 1].right - 1);
    }
  }

  // Pick a podcast episode from browse modal in listen mode -> sheet stays open (PR #3 behavior)
  await page.getByRole("dialog", { name: "Library" }).getByText("Seeded Podcast", { exact: true }).click();
  await expect(page.getByText("Seeded Podcast Episode")).toBeVisible();
  await page.getByText("Seeded Podcast Episode").click();
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Watch", exact: true })).toBeVisible();

  // Pick video 1 in listen mode -> sheet stays open; YT wrapper stays visibility:visible (opacity:0)
  await page.getByRole("dialog", { name: "Library" }).getByText(longTitle).click();
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  const ytWrapper = page.getByTestId("yt-player-wrapper");
  await expect(ytWrapper).toHaveCSS("visibility", "visible");
  await expect(ytWrapper).toHaveCSS("opacity", "0");
  await expect(ytWrapper).toHaveCSS("pointer-events", "none");

  // Manually closing the sheet reveals the listen-mode now-playing stage
  await page.getByRole("button", { name: "Close library" }).click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByTestId("listen-stage")).toBeVisible();
  await expect(page.getByTestId("listen-stage-title")).toHaveText(longTitle);

  const watchBtn = page.getByRole("button", { name: "Watch", exact: true });
  await watchBtn.focus();
  await expect(watchBtn).toBeFocused();

  // Auto-advance in listen mode reopens the sheet WITHOUT stealing focus from Watch
  await page.evaluate(() => {
    (window as unknown as { __ytTriggerEnded?: () => void }).__ytTriggerEnded?.();
  });
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await expect(watchBtn).toBeFocused();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeFocused();

  // Switching back to Watch mode closes the library sheet so the 16:9 video is visible
  await watchBtn.click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByRole("button", { name: "Listen", exact: true })).toBeVisible();
});

test("mobile add flow saves a YouTube video link and a podcast into the library", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only add flow test");
  await mockYouTubeOEmbed(page, { title: "Mobile Added YouTube Video", author_name: "Mobile YT Channel" });
  await mockPodcastResolve(page, { status: "resolved", feedUrl: "https://example.test/feed.xml", source: "direct" });
  await mockPodcastFeed(page, podcastFeed());

  await page.goto("/");

  // Short landscape empty state & AddFlow remain scrollable and reachable at 568x320
  await page.setViewportSize({ width: 568, height: 320 });
  const emptyInput = page.locator('input[placeholder="Paste a YouTube or podcast link..."]').first();
  await emptyInput.scrollIntoViewIfNeeded();
  await expect(emptyInput).toBeVisible();

  // Save a YouTube link (even at 568x320 short landscape height, dialog scrolls so Save button is clickable)
  await page.getByRole("button", { name: "+ Add" }).click();
  await page.locator('input[placeholder="Paste a YouTube or podcast link..."]').last().fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Fetch" }).click();
  await expect(page.getByText("Mobile Added YouTube Video")).toBeVisible();
  const saveBtn = page.getByRole("button", { name: "Save to MyVidTV" });
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click();

  await page.setViewportSize({ width: 390, height: 844 });

  let library = await readLibrary(page);
  expect(library.items.some((item) => item.type === "video" && item.title === "Mobile Added YouTube Video")).toBe(true);

  await page.getByTestId("phone-open-library").click();
  await expect(page.getByText("Mobile Added YouTube Video")).toBeVisible();

  // Also save a podcast from the sheet's + Add button
  await page.getByRole("dialog", { name: "Library" }).getByRole("button", { name: "+ Add" }).click();
  await page.locator('input[placeholder="Paste a YouTube or podcast link..."]').last().fill("https://example.test/feed.xml");
  await page.getByRole("button", { name: "Fetch" }).click();
  await expect(page.getByText("Seeded Podcast")).toBeVisible();
  await page.getByRole("button", { name: "Add Podcast" }).click();

  library = await readLibrary(page);
  expect(library.items.some((item) => item.type === "podcast" && item.title === "Seeded Podcast")).toBe(true);
  await expect(page.getByText("Seeded Podcast")).toBeVisible();
});

test("desktop window resizes preserve 601px+ desktop mode, keep phone sheet closed on entry, handle non-touch 360-430px, and never remount YT.Player", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only resize test");
  await mockYouTubeIframeApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await seedLibrary(page, { items: [videoItem()] });

  // Desktop starts with sidebar physically beside player at 1280x800 and wrapping card subtitles
  await expect(page.getByRole("button", { name: "Collapse library" })).toBeVisible();
  const desktopGeometry = await page.evaluate(() => {
    const player = document.getElementById("yt-player")?.parentElement?.getBoundingClientRect();
    const sidebar = document.querySelector('aside[aria-label="Library"]')?.getBoundingClientRect();
    const subEl = Array.from(document.querySelectorAll('aside[aria-label="Library"] div')).find(
      (el) => el.childElementCount === 0 && el.textContent?.trim() === "Seeded Channel"
    );
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      player,
      sidebar,
      subWhiteSpace: subEl ? getComputedStyle(subEl).whiteSpace : "",
    };
  });
  expect(desktopGeometry.scrollWidth).toBeLessThanOrEqual(desktopGeometry.clientWidth);
  expect(desktopGeometry.player).toBeTruthy();
  expect(desktopGeometry.sidebar).toBeTruthy();
  expect(desktopGeometry.sidebar!.left).toBeGreaterThanOrEqual(desktopGeometry.player!.right - 2);
  expect(Math.abs(desktopGeometry.sidebar!.width - 320)).toBeLessThanOrEqual(2);
  expect(desktopGeometry.player!.width).toBeGreaterThan(800);
  expect(desktopGeometry.subWhiteSpace).toBe("normal");

  // Resizing into phone layout keeps library sheet closed so header and player stay visible
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("phone-open-library")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("button", { name: "Collapse library" })).toBeVisible();

  // Theme toggle works on desktop
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByText("Seeded Long Video Title For Mobile Layout Verification").click();
  await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();

  const initialPlayerCount = await page.evaluate(
    () => (window as unknown as { __ytPlayerCreateCount?: number }).__ytPlayerCreateCount ?? 0
  );
  expect(initialPlayerCount).toBe(1);

  // Fine-pointer 650x800, 800x600 and 768x1024 keep full desktop experience (320px sidebar, collapse button, compact controls)
  for (const vp of [
    { width: 650, height: 800 },
    { width: 800, height: 600 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(vp);
    await expect(page.getByRole("button", { name: "Collapse library" })).toBeVisible();
    const sidebarBox = await page.locator('aside[aria-label="Library"]').boundingBox();
    expect(sidebarBox).toBeTruthy();
    expect(Math.abs(sidebarBox!.width - 320)).toBeLessThanOrEqual(2);
    const pauseBox = await page.getByRole("button", { name: /pause|play/i }).boundingBox();
    expect(pauseBox).toBeTruthy();
    expect(pauseBox!.height).toBeLessThan(40);
  }

  // Collapse/expand works at 800x600
  await page.setViewportSize({ width: 800, height: 600 });
  await page.getByRole("button", { name: "Collapse library" }).click();
  await expect(page.getByRole("button", { name: "Expand library" })).toBeVisible();
  await page.getByRole("button", { name: "Expand library" }).click();
  await expect(page.getByRole("button", { name: "Collapse library" })).toBeVisible();

  // Non-touch 360, 390, 430: immediate switch, 16:9 player, single-row >=40px controls, reachable library
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole("button", { name: "Collapse library" })).not.toBeAttached();

    const measurePhone = () =>
      page.evaluate(() => {
        const stage = document.querySelector('[data-testid="player-video-stage"]')?.getBoundingClientRect();
        const frame = document.querySelector(".player-yt-frame")?.getBoundingClientRect();
        const labels = ["Back 10 seconds", "Pause", "Play", "Forward 10 seconds", "Skip", "Loop: off", "Listen"];
        const controls = labels
          .map((label) => {
            const el = document.querySelector(`button[aria-label="${label}"]`);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { label, left: r.left, right: r.right, top: r.top, width: r.width, height: r.height };
          })
          .filter((b): b is NonNullable<typeof b> => b !== null);
        return {
          innerWidth: window.innerWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          stageWidth: stage?.width ?? 0,
          stageHeight: stage?.height ?? 0,
          frameWidth: frame?.width ?? 0,
          frameHeight: frame?.height ?? 0,
          controls,
        };
      });

    await expect.poll(async () => Math.abs((await measurePhone()).stageWidth - width)).toBeLessThanOrEqual(2);
    const phoneMetrics = await measurePhone();

    expect(phoneMetrics.scrollWidth).toBeLessThanOrEqual(phoneMetrics.clientWidth);
    expect(phoneMetrics.scrollWidth).toBeLessThanOrEqual(phoneMetrics.innerWidth);
    expect(Math.abs(phoneMetrics.stageWidth - width)).toBeLessThanOrEqual(2);
    expect(phoneMetrics.stageWidth / phoneMetrics.stageHeight).toBeCloseTo(16 / 9, 1);
    expect(Math.abs(phoneMetrics.frameWidth - width)).toBeLessThanOrEqual(2);
    expect(phoneMetrics.frameWidth / phoneMetrics.frameHeight).toBeCloseTo(16 / 9, 1);
    expect(phoneMetrics.controls.length).toBe(6);
    const firstTop = phoneMetrics.controls[0].top;
    for (const c of phoneMetrics.controls) {
      expect(c.width).toBeGreaterThanOrEqual(40);
      expect(c.height).toBeGreaterThanOrEqual(40);
      expect(Math.abs(c.top - firstTop)).toBeLessThanOrEqual(2);
      expect(c.right).toBeLessThanOrEqual(phoneMetrics.innerWidth + 1);
    }
  }

  // Library sheet is reachable on non-touch 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("phone-open-library").click();
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Library" }).getByText("Seeded Long Video Title For Mobile Layout Verification")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();

  // Resize back to 1280px — desktop layout restored unchanged and YT.Player was never remounted
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("button", { name: "Collapse library" })).toBeVisible();

  // Desktop Listen Mode: opening AddFlow must layer above the fixed listen bar and mark background inert
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await expect(page.getByRole("button", { name: "Watch", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).toBeVisible();
  await expect(page.locator("header")).toHaveAttribute("inert", "");
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  const stacking = await page.evaluate(() => {
    const dialogOverlay = document.querySelector('[role="dialog"]')?.parentElement;
    const watchBtn = document.querySelector('button[aria-label="Watch"]');
    let listenBar: HTMLElement | null = watchBtn?.parentElement ?? null;
    while (listenBar && getComputedStyle(listenBar).position !== "fixed") {
      listenBar = listenBar.parentElement;
    }
    return {
      modalZ: Number.parseInt(dialogOverlay ? getComputedStyle(dialogOverlay).zIndex : "0", 10) || 0,
      listenBarZ: Number.parseInt(listenBar ? getComputedStyle(listenBar).zIndex : "0", 10) || 0,
    };
  });
  expect(stacking.modalZ).toBeGreaterThan(stacking.listenBarZ);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Add to MyVidTV" })).not.toBeAttached();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Watch", exact: true }).click();

  const finalPlayerCount = await page.evaluate(
    () => (window as unknown as { __ytPlayerCreateCount?: number }).__ytPlayerCreateCount ?? 0
  );
  expect(finalPlayerCount).toBe(1);
});

test("mobile sheet starts closed on first load, closes on pick, and renders Add modal above open sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only usability test");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(
    page,
    podcastFeed({
      episodes: [
        {
          episodeId: "ep-raw-seconds",
          title: "Formatted Duration Episode",
          audioUrl: "https://podcast-cdn.example.test/raw.mp3",
          thumbnail: "https://podcast-cdn.example.test/episode.jpg",
          publishedAt: "2026-07-11T00:00:00.000Z",
          duration: "1475",
        },
      ],
    })
  );

  await seedLibrary(page, {
    items: [videoItem(), podcastItem()],
  });

  // 1. Wait for hydration on phone, then verify sheet starts CLOSED on first load
  await expect(page.getByTestId("phone-open-library")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.getByTestId("player-video-stage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();

  // 2. Open library sheet: no duplicate Archive button in sheet header (only the Archive tab)
  await page.getByTestId("phone-open-library").click();
  const libraryDialog = page.getByRole("dialog", { name: "Library" });
  await expect(libraryDialog).toBeVisible();
  await expect(libraryDialog.getByRole("button", { name: /^archive$/i })).toHaveCount(1);

  // 3. Tapping + Add while sheet is open renders Add modal visibly ABOVE the sheet
  const sheetAddBtn = libraryDialog.getByRole("button", { name: "+ Add" });
  await sheetAddBtn.click();
  const addDialog = page.getByRole("dialog", { name: "Add to MyVidTV" });
  await expect(addDialog).toBeVisible();

  const hitInsideAdd = await page.evaluate(() => {
    const addEl = document.querySelector('[role="dialog"][aria-label="Add to MyVidTV"]') as HTMLElement | null;
    if (!addEl) return false;
    const rect = addEl.getBoundingClientRect();
    const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return Boolean(topEl && addEl.contains(topEl));
  });
  expect(hitInsideAdd).toBe(true);

  // Escape closes ONLY the portaled Add modal and returns focus sensibly to the sheet trigger
  await page.keyboard.press("Escape");
  await expect(addDialog).not.toBeAttached();
  await expect(libraryDialog).toBeVisible();
  await expect(sheetAddBtn).toBeFocused();

  // 4. Picking a podcast episode formats raw seconds (1475 -> 24:35) and closes the sheet
  await libraryDialog.getByText("Seeded Podcast", { exact: true }).click();
  const podcastDialog = page.getByRole("dialog", { name: "Seeded Podcast" });
  await expect(podcastDialog).toBeVisible();
  await expect(podcastDialog.getByText(/24:35/)).toBeVisible();
  await expect(podcastDialog.getByText(/\b1475\b/)).toHaveCount(0);

  await podcastDialog.getByText("Formatted Duration Episode").click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByTestId("player-podcast-duration")).toContainText("24:35");
  await expect(page.locator("#yt-player")).toBeAttached();
  await expect(page.locator("#yt-player")).not.toBeVisible();
  const mobileYtWrapper = page.getByTestId("yt-player-wrapper");
  await expect(mobileYtWrapper).not.toHaveCSS("display", "none");
  await expect(mobileYtWrapper).toHaveCSS("visibility", "hidden");
  await expect(mobileYtWrapper).toHaveCSS("opacity", "0");
});

test("switching from YouTube to podcast hides iframe, highlights parent podcast, and formats durations with audio metadata fallback", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast & highlight verification");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(
    page,
    podcastFeed({
      episodes: [
        {
          episodeId: "ep-raw-1475",
          title: "Episode With Raw Seconds",
          audioUrl: "https://podcast-cdn.example.test/ep1.mp3",
          thumbnail: "https://podcast-cdn.example.test/ep1.jpg",
          publishedAt: "2026-07-11T00:00:00.000Z",
          duration: "1475",
        },
        {
          episodeId: "ep-no-duration",
          title: "Episode Without Feed Duration",
          audioUrl: "https://podcast-cdn.example.test/ep2.mp3",
          thumbnail: "https://podcast-cdn.example.test/ep2.jpg",
          publishedAt: "2026-07-10T00:00:00.000Z",
        },
      ],
    })
  );

  await seedLibrary(page, {
    items: [
      videoItem({ ytId: "yt-1", title: "A Very Long Desktop Video Title That Should Wrap Across Two Full Lines Without Truncating Early" }),
      podcastItem(),
    ],
  });

  // Verify icon-only buttons have title tooltips and theme toggle uses an SVG icon
  await expect(page.getByRole("button", { name: "Export library" })).toHaveAttribute("title", "Export library");
  await expect(page.getByRole("button", { name: "Import library" })).toHaveAttribute("title", "Import library");
  await expect(page.getByRole("button", { name: /switch to light theme/i })).toHaveAttribute("title", /switch to light theme/i);
  await expect(page.getByRole("button", { name: /switch to light theme/i }).locator("svg")).toBeVisible();

  // Play the YouTube video first
  const videoCard = page.locator('[data-testid="library-card"]', { hasText: "A Very Long Desktop Video Title" });
  const podcastCard = page.locator('[data-testid="library-card"]', { hasText: "Seeded Podcast" });
  await videoCard.click();
  await expect(videoCard).toHaveAttribute("data-active", "true");
  await expect(podcastCard).not.toHaveAttribute("data-active", "true");
  await expect(page.locator("#yt-player")).toBeVisible();

  // Transport buttons expose native tooltips
  await expect(page.getByRole("button", { name: "Listen", exact: true })).toHaveAttribute("title", "Listen");
  await expect(page.getByRole("button", { name: "Skip", exact: true })).toHaveAttribute("title", "Skip");

  // Open podcast episodes modal: raw "1475" is formatted as "24:35" and never shown raw
  await podcastCard.click();
  const modal = page.getByRole("dialog", { name: "Seeded Podcast" });
  await expect(modal.getByText(/24:35/)).toBeVisible();
  await expect(modal.getByText(/\b1475\b/)).toHaveCount(0);

  // Pick episode with raw duration -> YT iframe attached & hidden (not display:none), podcast stage opaque, highlight moves to parent podcast row
  await modal.getByText("Episode With Raw Seconds").click();
  await expect(page.locator("#yt-player")).toBeAttached();
  await expect(page.locator("#yt-player")).not.toBeVisible();
  const desktopYtWrapper = page.getByTestId("yt-player-wrapper");
  await expect(desktopYtWrapper).not.toHaveCSS("display", "none");
  await expect(desktopYtWrapper).toHaveCSS("visibility", "hidden");
  await expect(desktopYtWrapper).toHaveCSS("opacity", "0");
  await expect(page.getByTestId("podcast-stage")).toBeVisible();
  await expect(page.getByTestId("player-podcast-duration")).toContainText("24:35");
  await expect(podcastCard).toHaveAttribute("data-active", "true");
  await expect(videoCard).not.toHaveAttribute("data-active", "true");

  // Switch to episode without feed duration -> falls back to <audio> element duration on loadedmetadata
  await podcastCard.click();
  await page.getByRole("dialog", { name: "Seeded Podcast" }).getByText("Episode Without Feed Duration").click();
  await expect(page.getByTestId("player-podcast-duration")).toHaveCount(0);

  try {
    await page.locator("audio").evaluate((audioEl) => {
      Object.defineProperty(audioEl, "duration", { configurable: true, get: () => 3730 });
      audioEl.dispatchEvent(new Event("loadedmetadata"));
    });
    await expect(page.getByTestId("player-podcast-duration")).toContainText("1:02:10");
  } finally {
    await page.locator("audio").evaluate((audioEl) => {
      delete (audioEl as unknown as { duration?: number }).duration;
    });
  }
});

test("restoring a podcast episode on load then switching to a video keeps YouTube iframe sized with one YT.Player", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast-to-video sizing test");
  await mockYouTubeIframeApi(page);

  await seedLibrary(page, {
    items: [videoItem({ ytId: "yt-after-pod", title: "Video Played After Podcast" })],
    watchHistory: [
      watchHistoryEntry({
        mediaType: "podcast",
        ytId: "restored-pod-ep-1",
        title: "Restored Podcast Episode",
        channelName: "Seeded Podcast",
        thumbnail: "https://podcast-cdn.example.test/artwork.jpg",
        source: {
          type: "podcast",
          feedUrl: "https://example.test/feed.xml",
          audioUrl: "https://podcast-cdn.example.test/audio.mp3",
        },
      }),
    ],
  });

  // Restore/play the podcast episode first on load before any video is selected
  await page.getByRole("button", { name: "history" }).click();
  await page.getByText("Restored Podcast Episode").click();
  await expect(page.getByTestId("podcast-stage")).toBeVisible();
  await expect(page.locator("#yt-player")).toBeAttached();
  await expect(page.locator("#yt-player")).not.toBeVisible();

  const hiddenBox = await page.locator("#yt-player").evaluate((el) => {
    const r = el.getBoundingClientRect();
    const wrapper = el.closest('[data-testid="yt-player-wrapper"]');
    return {
      width: r.width,
      height: r.height,
      display: wrapper ? getComputedStyle(wrapper).display : "",
      visibility: wrapper ? getComputedStyle(wrapper).visibility : "",
    };
  });
  expect(hiddenBox.display).not.toBe("none");
  expect(hiddenBox.visibility).toBe("hidden");
  expect(hiddenBox.width).toBeGreaterThan(0);
  expect(hiddenBox.height).toBeGreaterThan(0);

  // Now switch to a YouTube video -> iframe is visible at full non-zero size and only one YT.Player exists
  await page.getByRole("button", { name: "library", exact: true }).click();
  await page.getByText("Video Played After Podcast").click();
  await expect(page.locator("#yt-player")).toBeVisible();

  const visibleMetrics = await page.evaluate(() => {
    const yt = document.getElementById("yt-player");
    const r = yt?.getBoundingClientRect();
    return {
      width: r?.width ?? 0,
      height: r?.height ?? 0,
      playerCount: (window as unknown as { __ytPlayerCreateCount?: number }).__ytPlayerCreateCount ?? 0,
    };
  });
  expect(visibleMetrics.width).toBeGreaterThan(200);
  expect(visibleMetrics.height).toBeGreaterThan(100);
  expect(visibleMetrics.playerCount).toBe(1);
});

test("mobile sheet starts closed on first load even when listen mode was saved", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only first-load test");
  await mockYouTubeIframeApi(page);
  await seedLibrary(page, {
    items: [videoItem({ ytId: "vid-1", title: "Saved Listen Mode Video" })],
    settings: { theme: "dark", libraryCollapsed: false, listenMode: true, sortOrder: "addedAt_desc", loopMode: "off" },
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("phone-open-library")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
});

const threeEpisodeFeed = () => podcastFeed({
  episodeCount: 3,
  episodes: [1, 2, 3].map((n) => ({
    episodeId: `skip-ep-${n}`,
    title: `Skip Test Episode ${n}`,
    audioUrl: `https://podcast-cdn.example.test/skip-${n}.mp3`,
    thumbnail: "https://podcast-cdn.example.test/episode.jpg",
    publishedAt: `2026-11-${String(20 - n).padStart(2, "0")}T00:00:00.000Z`,
    duration: "24:35",
  })),
});

test("mobile listen mode: Skip on a podcast episode advances to the next episode and reopens the sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only listen mode skip test");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(page, threeEpisodeFeed());
  await seedLibrary(page, {
    items: [podcastItem(), videoItem()],
    settings: { theme: "dark", libraryCollapsed: false, listenMode: true, sortOrder: "addedAt_desc", loopMode: "off" },
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("phone-open-library").click();
  await page.getByRole("dialog", { name: "Library" }).getByText("Seeded Podcast", { exact: true }).click();
  await page.getByText("Skip Test Episode 1").click();

  // Listen mode keeps the sheet open after the pick (PR #3 behavior); close it to see the stage
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();
  await page.getByRole("button", { name: "Close library" }).click();
  await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  await expect(page.getByTestId("listen-stage-title")).toHaveText("Skip Test Episode 1");

  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.getByTestId("listen-stage-title")).toHaveText("Skip Test Episode 2");
  await expect(page.locator("audio")).toHaveAttribute("src", /skip-2\.mp3/);
  // Changing the playing item in listen mode reopens the sheet, like auto-advance
  await expect(page.getByRole("button", { name: "Close library" })).toBeVisible();

  // Skip again -> episode 3; at the last episode Skip does nothing (loop off)
  await page.getByRole("button", { name: "Close library" }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.getByTestId("listen-stage-title")).toHaveText("Skip Test Episode 3");
  await page.getByRole("button", { name: "Close library" }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId("listen-stage-title")).toHaveText("Skip Test Episode 3");
});

test("desktop: Skip on a podcast episode plays the next episode of the same podcast", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only podcast skip test");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(page, threeEpisodeFeed());
  await seedLibrary(page, { items: [podcastItem(), videoItem()] });
  await page.getByText("Seeded Podcast", { exact: true }).first().click();
  await page.getByText("Skip Test Episode 1").click();
  await expect(page.locator("audio")).toHaveAttribute("src", /skip-1\.mp3/);
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.locator("audio")).toHaveAttribute("src", /skip-2\.mp3/);
  await expect(page.getByText("Skip Test Episode 2").first()).toBeVisible();
});

test("phone widths 390 and 360: Add modal stacks input above full-width Fetch, header never clips, episode meta stays on one line", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only phone layout test");
  await mockYouTubeIframeApi(page);
  await mockPodcastFeed(page, podcastFeed({
    episodes: [{
      episodeId: "long-ep",
      title: "A Very Long Podcast Episode Title That Should Wrap To Two Lines In The Episode List",
      audioUrl: "https://podcast-cdn.example.test/audio.mp3",
      thumbnail: "https://podcast-cdn.example.test/episode.jpg",
      publishedAt: "2026-11-21T00:00:00.000Z",
      duration: "01:02:10",
    }],
  }));
  await seedLibrary(page, { items: [podcastItem(), videoItem()] });

  for (const [width, height] of [[390, 844], [360, 740]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByTestId("phone-open-library")).toBeVisible();

    const header = await page.evaluate(() => {
      const hd = document.querySelector("header") as HTMLElement;
      const add = Array.from(hd.querySelectorAll("button")).find((b) => /add/i.test(b.textContent ?? ""));
      return {
        vw: document.documentElement.clientWidth,
        docScroll: document.documentElement.scrollWidth,
        headerScroll: hd.scrollWidth,
        headerClient: hd.clientWidth,
        addRight: add?.getBoundingClientRect().right ?? Infinity,
      };
    });
    expect(header.docScroll).toBeLessThanOrEqual(header.vw);
    expect(header.headerScroll).toBeLessThanOrEqual(header.headerClient);
    expect(header.addRight).toBeLessThanOrEqual(header.vw);

    await page.locator("header").getByRole("button", { name: /add/i }).click();
    const dialog = page.getByRole("dialog", { name: "Add to MyVidTV" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByPlaceholder("Paste a YouTube or podcast link...");
    const fetchBtn = dialog.getByRole("button", { name: "Fetch" });
    const inputBox = (await input.boundingBox())!;
    const fetchBox = (await fetchBtn.boundingBox())!;
    expect(inputBox.width).toBeGreaterThanOrEqual(200);
    expect(fetchBox.y).toBeGreaterThanOrEqual(inputBox.y + inputBox.height - 1);
    expect(Math.abs(fetchBox.width - inputBox.width)).toBeLessThanOrEqual(2);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeAttached();

    await page.getByTestId("phone-open-library").click();
    await page.getByRole("dialog", { name: "Library" }).getByText("Seeded Podcast", { exact: true }).click();
    const episodes = page.getByRole("dialog", { name: "Seeded Podcast" });
    await expect(episodes.getByText("A Very Long Podcast Episode")).toBeVisible();
    const meta = await episodes.evaluate((d) => {
      const lineCount = (el: Element) => {
        const cs = getComputedStyle(el);
        const lh = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.2;
        return Math.round(el.getBoundingClientRect().height / lh);
      };
      const leaves = Array.from(d.querySelectorAll("*")).filter((x) => x.children.length === 0);
      const metaEl = leaves.find((x) => x.textContent?.includes("1:02:10"));
      const badge = leaves.find((x) => x.textContent?.trim() === "PODCAST");
      return { metaLines: metaEl ? lineCount(metaEl) : -1, badgeLines: badge ? lineCount(badge) : -1, metaText: metaEl?.textContent ?? "" };
    });
    expect(meta.metaText).toContain("1:02:10");
    expect(meta.metaLines).toBe(1);
    expect(meta.badgeLines).toBe(1);
    await page.keyboard.press("Escape");
    await expect(episodes).not.toBeAttached();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Close library" })).not.toBeAttached();
  }
});

test("desktop Add modal keeps URL input and Fetch on one row", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only layout test");
  await seedLibrary(page, { items: [videoItem()] });
  await page.locator("header").getByRole("button", { name: /add/i }).click();
  const dialog = page.getByRole("dialog", { name: "Add to MyVidTV" });
  const inputBox = (await dialog.getByPlaceholder("Paste a YouTube or podcast link...").boundingBox())!;
  const fetchBox = (await dialog.getByRole("button", { name: "Fetch" }).boundingBox())!;
  expect(Math.abs(fetchBox.y - inputBox.y)).toBeLessThanOrEqual(4);
  expect(fetchBox.x).toBeGreaterThan(inputBox.x + inputBox.width - 1);
});

test("desktop: Share is hidden when idle and copies YouTube URL for a playing video", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only share test");
  const video = videoItem();
  await mockYouTubeIframeApi(page);
  await seedLibrary(page, { items: [video] });

  await expect(page.getByTestId("share-button")).toHaveCount(0);

  await page.evaluate(() => {
    const win = window as unknown as { __copiedShareText?: string };
    win.__copiedShareText = undefined;
    try {
      delete (navigator as unknown as Record<string, unknown>).share;
    } catch {
      // Ignore non-configurable property error
    }
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          win.__copiedShareText = text;
        },
      },
    });
  });

  await page.getByText(video.title, { exact: true }).first().click();

  const shareBtn = page.getByTestId("share-button");
  await expect(shareBtn).toBeVisible();
  await shareBtn.click();

  const shareMenu = page.getByTestId("share-menu");
  await expect(shareMenu).toBeVisible();
  await shareMenu.getByRole("button", { name: "Copy link" }).click();

  const copied = await page.evaluate(
    () => (window as unknown as { __copiedShareText?: string }).__copiedShareText
  );
  expect(copied).toMatch(new RegExp(`^https://www\\.youtube\\.com/watch\\?v=${video.ytId}(&t=\\d+s)?$`));
  await expect(page.getByRole("status")).toHaveText("Copied link");
});
