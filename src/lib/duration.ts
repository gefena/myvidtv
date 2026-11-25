/**
 * Pure helpers for parsing and formatting podcast/media durations.
 *
 * Accepts `itunes:duration` strings in "HH:MM:SS", "MM:SS", or plain seconds
 * ("1475", "1475.5"), as well as numeric seconds, and formats them as
 * "m:ss" (< 1 hour) or "h:mm:ss" (>= 1 hour).
 *
 * Returns `null` for missing, non-positive, or invalid inputs so callers never
 * display a bare integer or bogus value.
 */

export function parseDurationSeconds(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    return raw;
  }

  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2 && parts.length !== 3) return null;

    if (parts.length === 2) {
      const [minPart, secPart] = parts;
      if (!/^\d+$/.test(minPart) || !/^\d+(?:\.\d+)?$/.test(secPart)) return null;
      const minutes = Number(minPart);
      const seconds = Number(secPart);
      if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
      const total = minutes * 60 + seconds;
      return total > 0 ? total : null;
    }

    const [hourPart, minPart, secPart] = parts;
    if (!/^\d+$/.test(hourPart) || !/^\d+$/.test(minPart) || !/^\d+(?:\.\d+)?$/.test(secPart)) {
      return null;
    }
    const hours = Number(hourPart);
    const minutes = Number(minPart);
    const seconds = Number(secPart);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return null;
    }
    const total = hours * 3600 + minutes * 60 + seconds;
    return total > 0 ? total : null;
  }

  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function formatDurationSeconds(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  const rounded = Math.round(seconds);
  if (rounded <= 0) return null;

  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatPodcastDuration(raw: string | number | null | undefined): string | null {
  const seconds = parseDurationSeconds(raw);
  if (seconds === null) return null;
  return formatDurationSeconds(seconds);
}

export function formatElapsedTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const floored = Math.floor(seconds);
  const hours = Math.floor(floored / 3600);
  const minutes = Math.floor((floored % 3600) / 60);
  const secs = floored % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
