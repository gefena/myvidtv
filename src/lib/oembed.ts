import type { VideoMeta } from "@/types/library";

/**
 * Fetch video metadata via YouTube oEmbed.
 * No API key required — CORS-enabled, called directly from the client.
 */
export async function fetchVideoOEmbed(url: string): Promise<VideoMeta> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Could not fetch video info. Check the URL and try again.");
  }

  const data = await res.json();

  const ytId = extractVideoId(url);
  if (!ytId) throw new Error("Could not parse video ID from URL.");

  return {
    type: "video",
    ytId,
    title: data.title as string,
    channelName: data.author_name as string,
    thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
  };
}

/**
 * Extract a YouTube video ID from a URL.
 * Handles youtube.com/watch?v=, youtu.be/, and shorts URLs.
 */
export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const hostname = u.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (hostname === "youtube.com") {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract a YouTube playlist ID from a URL.
 * No network call — purely URL parsing.
 */
export function parsePlaylistId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const hostname = u.hostname.replace(/^www\./, "");
    if (hostname !== "youtube.com") return null;
    return u.searchParams.get("list");
  } catch {
    return null;
  }
}

/**
 * Determine whether a URL looks like a playlist (vs a plain video).
 * A URL with a `list` param and no `v` param is treated as a playlist.
 */
export function isPlaylistUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.searchParams.has("list") && !u.searchParams.has("v");
  } catch {
    return false;
  }
}
