import type { PodcastEpisode, PodcastFeed } from "@/lib/podcastRss";

const EPISODE_LIMIT = 100;

type IndexedEpisode = {
  episode: PodcastEpisode;
  index: number;
  timestamp: number | null;
};

export function parsePodcastFeedXml(xml: string, feedUrl: string): PodcastFeed {
  const channelXml = firstMatch(xml, /<channel\b[\s\S]*?<\/channel>/i) ?? xml;
  const title =
    decodeXml(textFor(channelXml, "title")) ??
    decodeXml(textFor(xml, "title")) ??
    "Untitled podcast";
  const author =
    decodeXml(textFor(channelXml, "itunes:author")) ??
    decodeXml(textFor(channelXml, "author")) ??
    decodeXml(textFor(channelXml, "managingEditor")) ??
    "";
  const thumbnail =
    resolveHttpUrl(
      firstMatch(channelXml, /<image\b[\s\S]*?<url\b[^>]*>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i) ??
      attrFor(channelXml, "itunes:image", "href") ??
      attrFor(channelXml, "image", "href") ??
      "",
      feedUrl
    ) ?? "";

  const { episodeCount, episodes } = collectEpisodes(xml, thumbnail, feedUrl);

  return {
    feedUrl,
    title,
    author,
    thumbnail,
    episodeCount,
    episodes,
  };
}

function collectEpisodes(xml: string, feedThumbnail: string, feedUrl: string): {
  episodeCount: number;
  episodes: PodcastEpisode[];
} {
  const episodes: IndexedEpisode[] = [];
  const pattern = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let episodeCount = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(xml)) !== null) {
    const index = episodeCount;
    episodeCount += 1;

    const episode = parseEpisode(match[0], feedThumbnail, feedUrl);
    if (episode) {
      episodes.push({
        episode,
        index,
        timestamp: parseDateTimestamp(episode.publishedAt),
      });
    }
  }

  return {
    episodeCount,
    episodes: episodes
      .sort(compareNewestFirst)
      .slice(0, EPISODE_LIMIT)
      .map((entry) => entry.episode),
  };
}

function parseEpisode(entry: string, feedThumbnail: string, feedUrl: string): PodcastEpisode | null {
  const audioUrl =
    resolveHttpUrl(findAudioEnclosure(entry) ?? findAudioLink(entry) ?? "", feedUrl) ?? "";
  if (!audioUrl) return null;

  const guid = decodeXml(textFor(entry, "guid") ?? textFor(entry, "id"));
  const title = decodeXml(textFor(entry, "title")) ?? "Untitled episode";
  const thumbnail =
    resolveHttpUrl(
      attrFor(entry, "itunes:image", "href") ??
      attrFor(entry, "image", "href") ??
      "",
      feedUrl
    ) ?? feedThumbnail;
  const publishedAt =
    decodeXml(textFor(entry, "pubDate") ?? textFor(entry, "published") ?? textFor(entry, "updated")) ??
    "";
  const duration = decodeXml(textFor(entry, "itunes:duration") ?? textFor(entry, "duration"));

  return {
    episodeId: guid ?? audioUrl,
    title,
    audioUrl,
    thumbnail,
    publishedAt,
    duration,
  };
}

function textFor(xml: string, tagName: string): string | null {
  const escaped = escapeRegExp(tagName);
  return firstMatch(xml, new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i"));
}

function attrFor(xml: string, tagName: string, attrName: string): string | null {
  const tag = firstMatch(xml, new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>`, "i"));
  if (!tag) return null;
  return firstMatch(tag, new RegExp(`\\s${escapeRegExp(attrName)}=["']([^"']+)["']`, "i"));
}

function findAudioEnclosure(xml: string): string | null {
  const pattern = /<enclosure\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const tag = match[0];
    const url = attrFromTag(tag, "url");
    const type = attrFromTag(tag, "type") ?? "";
    if (url && (type.startsWith("audio/") || looksLikeAudioUrl(url))) return url;
  }
  return null;
}

function findAudioLink(xml: string): string | null {
  const pattern = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const tag = match[0];
    const href = attrFromTag(tag, "href");
    const type = attrFromTag(tag, "type") ?? "";
    if (href && (type.startsWith("audio/") || looksLikeAudioUrl(href))) return href;
  }
  return null;
}

function attrFromTag(tag: string, attrName: string): string | null {
  return firstMatch(tag, new RegExp(`\\s${escapeRegExp(attrName)}=["']([^"']+)["']`, "i"));
}

function firstMatch(value: string, pattern: RegExp): string | null {
  return value.match(pattern)?.[1]?.trim() ?? null;
}

function decodeXml(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const withoutCdata = value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
  return withoutCdata
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim() || undefined;
}

function looksLikeAudioUrl(url: string): boolean {
  return /\.(mp3|m4a|aac|ogg|oga|opus|wav)(?:[?#].*)?$/i.test(url);
}

function parseDateTimestamp(value: string): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function compareNewestFirst(a: IndexedEpisode, b: IndexedEpisode): number {
  if (a.timestamp !== null && b.timestamp !== null && a.timestamp !== b.timestamp) {
    return b.timestamp - a.timestamp;
  }
  if (a.timestamp !== null && b.timestamp === null) return -1;
  if (a.timestamp === null && b.timestamp !== null) return 1;
  return a.index - b.index;
}

function resolveHttpUrl(value: string, baseUrl: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
