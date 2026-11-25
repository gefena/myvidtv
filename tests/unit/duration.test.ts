import { describe, expect, it } from "vitest";
import {
  formatDurationSeconds,
  formatElapsedTime,
  formatPodcastDuration,
  parseDurationSeconds,
} from "@/lib/duration";

describe("podcast duration parsing and formatting", () => {
  it("parses and formats plain seconds (integer and fractional)", () => {
    expect(parseDurationSeconds("1475")).toBe(1475);
    expect(formatPodcastDuration("1475")).toBe("24:35");
    expect(formatPodcastDuration(1475)).toBe("24:35");

    expect(parseDurationSeconds("1475.5")).toBe(1475.5);
    expect(formatPodcastDuration("1475.5")).toBe("24:36");
    expect(formatPodcastDuration("1475.2")).toBe("24:35");

    expect(formatPodcastDuration("3730")).toBe("1:02:10");
    expect(formatPodcastDuration(3730)).toBe("1:02:10");
    expect(formatPodcastDuration("45")).toBe("0:45");
    expect(formatPodcastDuration("5")).toBe("0:05");
    expect(formatPodcastDuration(" 3600 ")).toBe("1:00:00");
  });

  it("parses and formats MM:SS values", () => {
    expect(formatPodcastDuration("24:35")).toBe("24:35");
    expect(formatPodcastDuration("05:09")).toBe("5:09");
    expect(formatPodcastDuration("0:45")).toBe("0:45");
    expect(formatPodcastDuration("75:30")).toBe("1:15:30");
    expect(formatPodcastDuration("12:34.4")).toBe("12:34");
  });

  it("parses and formats HH:MM:SS values", () => {
    expect(formatPodcastDuration("01:02:10")).toBe("1:02:10");
    expect(formatPodcastDuration("1:02:10")).toBe("1:02:10");
    expect(formatPodcastDuration("00:24:35")).toBe("24:35");
    expect(formatPodcastDuration("00:05:09")).toBe("5:09");
    expect(formatPodcastDuration("00:00:45")).toBe("0:45");
    expect(formatPodcastDuration("10:00:05")).toBe("10:00:05");
  });

  it("normalizes out-of-range minute/second components leniently", () => {
    expect(parseDurationSeconds("12:75")).toBe(795);
    expect(formatPodcastDuration("12:75")).toBe("13:15");
    expect(parseDurationSeconds("1:75:00")).toBe(8100);
    expect(formatPodcastDuration("1:75:00")).toBe("2:15:00");
    expect(formatPodcastDuration("1:75:10")).toBe("2:15:10");
    expect(formatPodcastDuration("0:90")).toBe("1:30");
  });

  it("returns null for missing, zero, negative, or malformed inputs", () => {
    expect(formatPodcastDuration(null)).toBeNull();
    expect(formatPodcastDuration(undefined)).toBeNull();
    expect(formatPodcastDuration("")).toBeNull();
    expect(formatPodcastDuration("   ")).toBeNull();
    expect(formatPodcastDuration("0")).toBeNull();
    expect(formatPodcastDuration(0)).toBeNull();
    expect(formatPodcastDuration("00:00")).toBeNull();
    expect(formatPodcastDuration("00:00:00")).toBeNull();
    expect(formatPodcastDuration("-120")).toBeNull();
    expect(formatPodcastDuration(-45)).toBeNull();
    expect(formatPodcastDuration(Number.NaN)).toBeNull();
    expect(formatPodcastDuration(Number.POSITIVE_INFINITY)).toBeNull();
    expect(formatPodcastDuration("abc")).toBeNull();
    expect(formatPodcastDuration("25m")).toBeNull();
    expect(formatPodcastDuration("12:")).toBeNull();
    expect(formatPodcastDuration(":30")).toBeNull();
    expect(formatPodcastDuration("1:2:3:4")).toBeNull();
    expect(formatDurationSeconds(0.2)).toBeNull();
  });

  it("formats elapsed playback time including zero", () => {
    expect(formatElapsedTime(0)).toBe("0:00");
    expect(formatElapsedTime(5.9)).toBe("0:05");
    expect(formatElapsedTime(65)).toBe("1:05");
    expect(formatElapsedTime(3730)).toBe("1:02:10");
    expect(formatElapsedTime(-1)).toBe("0:00");
    expect(formatElapsedTime(null)).toBe("0:00");
  });
});
