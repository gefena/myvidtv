export type ChannelFeedVideo = {
  ytId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

export type ChannelFeed = {
  channelName: string;
  channelThumbnail: string;
  videos: ChannelFeedVideo[];
};

export function isChannelUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const hostname = u.hostname.replace(/^www\./, "");
    if (hostname !== "youtube.com") return false;
    return (
      u.pathname.startsWith("/channel/") ||
      u.pathname.startsWith("/@") ||
      u.pathname.startsWith("/c/") ||
      u.pathname.startsWith("/user/")
    );
  } catch {
    return false;
  }
}

export async function resolveChannelId(url: string): Promise<string> {
  const u = new URL(url.trim());
  const pathname = u.pathname;

  // Direct channel ID: /channel/UCxxx
  if (pathname.startsWith("/channel/")) {
    const id = pathname.split("/")[2];
    if (id) return id;
    throw new Error("Could not parse channel ID from URL.");
  }

  // @handle, /c/<name>, /user/<name>: resolve via server-side route
  const path = pathname.slice(1); // strip leading "/"
  const res = await fetch(`/api/resolve-channel?path=${encodeURIComponent(path)}`);
  if (res.status === 404) throw new Error("Channel not found. Check the URL and try again.");
  if (res.status === 422) throw new Error("Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly.");
  if (!res.ok) throw new Error("Could not reach YouTube. Check your connection and try again.");
  const data = await res.json() as { channelId: string };
  return data.channelId;
}

export async function fetchChannelFeed(channelId: string): Promise<ChannelFeed> {
  const res = await fetch(`/api/channel-feed?channelId=${encodeURIComponent(channelId)}`);
  if (!res.ok) throw new Error("Could not fetch channel feed.");

  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");

  const channelName =
    doc.querySelector("feed > title")?.textContent ?? "Unknown Channel";

  const entries = Array.from(doc.querySelectorAll("entry"));
  const videos: ChannelFeedVideo[] = entries.map((entry) => {
    const ytId = entry.querySelector("id")?.textContent?.replace("yt:video:", "") ?? "";
    const title = entry.querySelector("title")?.textContent ?? "";
    const thumbnail =
      entry.querySelector("media\\:thumbnail, thumbnail")?.getAttribute("url") ??
      (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");
    const publishedAt = entry.querySelector("published")?.textContent ?? "";
    return { ytId, title, thumbnail, publishedAt };
  }).filter((v) => v.ytId);

  const channelThumbnail = videos[0]?.thumbnail ?? "";

  return { channelName, channelThumbnail, videos };
}
