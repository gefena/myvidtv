import { describe, expect, it } from "vitest";
import { sanitizeLibraryData } from "@/lib/importSanitizer";

describe("import sanitizer", () => {
  it("accepts legacy library exports without watchHistory", () => {
    const data = sanitizeLibraryData({
      items: [
        {
          type: "video",
          ytId: "abc123",
          title: "Imported video",
          channelName: "Channel",
          thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
          tags: ["Tech"],
          addedAt: 1,
        },
      ],
      customTags: [" Tech "],
    });

    expect(data.watchHistory).toEqual([]);
    expect(data.items).toHaveLength(1);
    expect(data.customTags).toEqual(["tech"]);
  });

  it("rejects data without an items array", () => {
    expect(() => sanitizeLibraryData({ customTags: [] })).toThrow("missing items array");
  });
});
