import type { LibraryItem } from "@/types/library";

export type SharePayload = {
  url: string;
  title: string;
  text: string;
};

export type SharePayloadOptions = {
  positionSeconds?: number | null;
};

const AUDIO_FILE_EXT_RE = /\.(mp3|m4a|aac|ogg|opus|wav)$/i;

export function getSharePayload(
  item: LibraryItem | null | undefined,
  options: SharePayloadOptions = {}
): SharePayload | null {
  if (!item) return null;

  if (item.type === "video") {
    const ytId = item.ytId?.trim();
    if (!ytId) return null;
    const baseUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(ytId)}`;
    const pos = options.positionSeconds;
    const timestamp =
      typeof pos === "number" && Number.isFinite(pos) && pos >= 5
        ? Math.floor(pos)
        : null;
    const url = timestamp !== null ? `${baseUrl}&t=${timestamp}s` : baseUrl;
    return {
      url,
      title: item.title,
      text: item.title,
    };
  }

  if (item.type === "podcast-episode") {
    const audioUrl = normalizeHttpUrl(item.audioUrl);
    const pageUrl = normalizeHttpUrl(item.episodeLink ?? item.watchSource?.episodeLink);
    const feedUrl = normalizeHttpUrl(item.podcastFeedUrl);

    const usablePageUrl =
      pageUrl &&
      !urlsEqual(pageUrl, audioUrl) &&
      !looksLikeAudioFileUrl(pageUrl)
        ? pageUrl
        : null;

    const url = usablePageUrl ?? audioUrl ?? feedUrl;
    if (!url) return null;

    const podcastTitle = item.podcastTitle?.trim();
    const text = podcastTitle ? `${item.title} — ${podcastTitle}` : item.title;

    return {
      url,
      title: item.title,
      text,
    };
  }

  return null;
}

function normalizeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

function urlsEqual(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  try {
    return new URL(a).toString() === new URL(b).toString();
  } catch {
    return false;
  }
}

function looksLikeAudioFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return AUDIO_FILE_EXT_RE.test(parsed.pathname);
  } catch {
    return false;
  }
}
