import { writeCache, getCacheEntry } from "@/lib/channelFeedCache";

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

export type ChannelFeedResult = {
  feed: ChannelFeed;
  fromCache: boolean;
  cachedAt?: number;
};

export class ChannelApiError extends Error {
  code?: string;
  requestId?: string;
  upstreamStatus?: number;

  constructor(message: string, detail: { code?: string; requestId?: string; upstreamStatus?: number } = {}) {
    super(message);
    this.name = "ChannelApiError";
    this.code = detail.code;
    this.requestId = detail.requestId;
    this.upstreamStatus = detail.upstreamStatus;
  }
}

type ApiErrorBody = {
  error?: string;
  code?: string;
  requestId?: string;
  upstreamStatus?: number;
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
  if (!res.ok) {
    throw await createChannelApiError(res, resolveChannelMessage);
  }
  const data = await res.json() as { channelId: string };
  return data.channelId;
}

export async function fetchChannelFeed(channelId: string): Promise<ChannelFeedResult> {
  try {
    const res = await fetch(`/api/channel-feed?channelId=${encodeURIComponent(channelId)}`);
    if (!res.ok) {
      throw await createChannelApiError(res, () => "Could not fetch channel feed.");
    }

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
    const feed: ChannelFeed = { channelName, channelThumbnail, videos };
    writeCache(channelId, feed);
    return { feed, fromCache: false };
  } catch (error) {
    const entry = getCacheEntry(channelId);
    if (entry) {
      return { feed: entry.feed, fromCache: true, cachedAt: entry.cachedAt };
    }
    throw error;
  }
}

export function getChannelErrorRequestId(error: unknown): string | undefined {
  return error instanceof ChannelApiError ? error.requestId : undefined;
}

async function createChannelApiError(
  res: Response,
  messageFor: (body: ApiErrorBody, res: Response) => string
): Promise<ChannelApiError> {
  const body = await readApiErrorBody(res);
  return new ChannelApiError(messageFor(body, res), {
    code: body.code,
    requestId: body.requestId ?? res.headers.get("x-request-id") ?? undefined,
    upstreamStatus: body.upstreamStatus,
  });
}

async function readApiErrorBody(res: Response): Promise<ApiErrorBody> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {};

  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

function resolveChannelMessage(body: ApiErrorBody, res: Response): string {
  if (body.code === "YOUTUBE_CHANNEL_NOT_FOUND" || res.status === 404) {
    return "Channel not found. Check the URL and try again.";
  }

  if (body.code === "YOUTUBE_CHANNEL_PARSE_ERROR" || res.status === 422) {
    return "Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly.";
  }

  return "Could not reach YouTube. Check your connection and try again.";
}
