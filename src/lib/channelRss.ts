export type ChannelFeedVideo = {
  ytId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

export type ChannelFeed = {
  channelName: string;
  videos: ChannelFeedVideo[];
};

export function isChannelUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const hostname = u.hostname.replace(/^www\./, "");
    if (hostname !== "youtube.com") return false;
    return (
      u.pathname.startsWith("/channel/") ||
      u.pathname.startsWith("/@")
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

  // @handle: resolve via server-side route
  const handle = pathname.slice(2); // strip leading "/@"
  const res = await fetch(`/api/resolve-channel?handle=${encodeURIComponent(handle)}`);
  if (!res.ok) throw new Error("Could not resolve channel. Try using a youtube.com/channel/UCxxx URL instead.");
  const data = await res.json() as { channelId: string };
  return data.channelId;
}

export async function fetchChannelFeed(channelId: string): Promise<ChannelFeed> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  );
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

  return { channelName, videos };
}
