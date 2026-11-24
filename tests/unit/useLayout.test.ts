import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIsTouch, getClientLayout, resolveLayout } from "@/hooks/useLayout";

describe("resolveLayout", () => {
  it("returns phone at 600px and narrower for both touch and non-touch", () => {
    for (const width of [320, 360, 390, 430, 568, 600]) {
      expect(resolveLayout(width, true)).toBe("phone");
      expect(resolveLayout(width, false)).toBe("phone");
    }
  });

  it("returns tablet at 601px-720px for both touch and non-touch (narrow sidebar cutoff)", () => {
    for (const width of [601, 650, 667, 720]) {
      expect(resolveLayout(width, true)).toBe("tablet");
      expect(resolveLayout(width, false)).toBe("tablet");
    }
  });

  it("preserves desktop at 721px+ for fine pointers and tablet up to 1200px for coarse pointers", () => {
    for (const width of [721, 768, 800, 844, 900, 1023, 1024, 1200]) {
      expect(resolveLayout(width, false)).toBe("desktop");
      expect(resolveLayout(width, true)).toBe("tablet");
    }

    expect(resolveLayout(1201, false)).toBe("desktop");
    expect(resolveLayout(1201, true)).toBe("desktop");
    expect(resolveLayout(1280, false)).toBe("desktop");
  });
});

describe("getClientLayout and getClientIsTouch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubViewport(width: number, coarsePointer: boolean) {
    vi.stubGlobal("window", {
      innerWidth: width,
      matchMedia: (query: string) => ({
        matches: query === "(pointer: coarse)" ? coarsePointer : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  }

  it("delegates getClientLayout to resolveLayout using innerWidth and coarse pointer query", () => {
    const cases: Array<[number, boolean]> = [
      [390, true],
      [390, false],
      [600, false],
      [601, false],
      [720, false],
      [721, false],
      [800, false],
      [844, true],
      [1023, false],
      [1024, false],
      [1200, true],
      [1201, true],
    ];

    for (const [width, coarse] of cases) {
      stubViewport(width, coarse);
      expect(getClientLayout()).toBe(resolveLayout(width, coarse));
      expect(getClientIsTouch()).toBe(coarse);
    }
  });
});
