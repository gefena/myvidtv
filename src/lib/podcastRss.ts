export type PodcastFeedMeta = {
  feedUrl: string;
  title: string;
  author: string;
  thumbnail: string;
  episodeCount: number;
};

export type PodcastEpisode = {
  episodeId: string;
  title: string;
  audioUrl: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
};

export type PodcastFeed = PodcastFeedMeta & {
  episodes: PodcastEpisode[];
};

export function isPodcastFeedUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const path = u.pathname.toLowerCase();
    if (!["http:", "https:"].includes(u.protocol)) return false;
    return (
      path.endsWith(".xml") ||
      path.endsWith(".rss") ||
      path.includes("/rss") ||
      path.includes("/feed") ||
      u.searchParams.has("feed")
    );
  } catch {
    return false;
  }
}

export async function fetchPodcastFeedMeta(feedUrl: string): Promise<PodcastFeedMeta> {
  const feed = await fetchPodcastFeed(feedUrl);
  return {
    feedUrl: feed.feedUrl,
    title: feed.title,
    author: feed.author,
    thumbnail: feed.thumbnail,
    episodeCount: feed.episodeCount,
  };
}

export async function fetchPodcastFeed(feedUrl: string): Promise<PodcastFeed> {
  const res = await fetch(`/api/podcast-feed?url=${encodeURIComponent(feedUrl)}`);
  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message ?? "Could not fetch podcast feed. Check the URL and try again.");
  }

  return await res.json() as PodcastFeed;
}

async function readErrorMessage(res: Response): Promise<string | undefined> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    const body = await res.json() as { error?: string };
    return body.error;
  } catch {
    return undefined;
  }
}
