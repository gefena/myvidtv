import { isPodcastFeedUrl } from "@/lib/podcastRss";

const USER_AGENT = "MyVidTV/0.1 (+https://myvidtv.local)";
const MAX_DISCOVERY_BYTES = 2 * 1024 * 1024;
const MAX_CHOICES = 5;

export type PodcastResolveChoice = {
  title: string;
  author: string;
  feedUrl: string;
  thumbnail: string;
};

export type PodcastResolveResult =
  | { status: "resolved"; feedUrl: string; source: "direct" | "html" | "apple" }
  | { status: "choices"; choices: PodcastResolveChoice[]; source: "html" | "spotify" | "search" }
  | { status: "externalOnly"; provider?: string; externalUrl: string; message: string }
  | { status: "notFound"; message: string };

type ItunesResult = {
  collectionName?: string;
  artistName?: string;
  feedUrl?: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
};

export async function resolvePodcastLink(inputUrl: string): Promise<PodcastResolveResult> {
  const url = parseHttpUrl(inputUrl);
  if (!url) return { status: "notFound", message: "Podcast link must be an HTTP or HTTPS URL." };

  const appleId = parseApplePodcastId(url);
  if (appleId) return await resolveApplePodcast(appleId);

  const spotifyId = parseSpotifyShowId(url);
  if (spotifyId) return await resolveSpotifyShow(url);

  if (isPodcastFeedUrl(url.toString())) {
    return { status: "resolved", feedUrl: url.toString(), source: "direct" };
  }

  return await resolvePageAlternateFeeds(url);
}

export function parseApplePodcastId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "podcasts.apple.com" && host !== "itunes.apple.com") return null;
  const pathMatch = url.pathname.match(/\/id(\d+)(?:$|[/?#])/i);
  return pathMatch?.[1] ?? url.searchParams.get("id");
}

export function parseSpotifyShowId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "open.spotify.com") return null;
  const match = url.pathname.match(/^\/show\/([A-Za-z0-9]+)(?:$|\/)/);
  return match?.[1] ?? null;
}

export function discoverFeedLinksFromHtml(html: string, pageUrl: string): PodcastResolveChoice[] {
  const titleByHref = new Map<string, PodcastResolveChoice>();
  const linkPattern = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const tag = match[0];
    const rel = attrFromTag(tag, "rel")?.toLowerCase() ?? "";
    const type = attrFromTag(tag, "type")?.toLowerCase() ?? "";
    const href = attrFromTag(tag, "href") ?? "";

    if (!rel.split(/\s+/).includes("alternate")) continue;
    if (!isFeedType(type) && !looksLikeFeedHref(href)) continue;

    const feedUrl = resolveHttpUrl(href, pageUrl);
    if (!feedUrl) continue;

    titleByHref.set(feedUrl, {
      title: decodeHtmlEntities(attrFromTag(tag, "title") ?? "Podcast feed"),
      author: "",
      feedUrl,
      thumbnail: "",
    });
  }

  return Array.from(titleByHref.values()).slice(0, MAX_CHOICES);
}

async function resolveApplePodcast(id: string): Promise<PodcastResolveResult> {
  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=podcast`;
  const results = await fetchItunesResults(lookupUrl);
  const choices = itunesResultsToChoices(results);
  const first = choices[0];
  if (!first) {
    return { status: "notFound", message: "Could not find a public RSS feed for this Apple Podcasts link." };
  }
  return { status: "resolved", feedUrl: first.feedUrl, source: "apple" };
}

async function resolveSpotifyShow(url: URL): Promise<PodcastResolveResult> {
  const title = await fetchSpotifyOEmbedTitle(url.toString());
  if (!title) {
    return {
      status: "externalOnly",
      provider: "spotify",
      externalUrl: url.toString(),
      message: "Spotify does not expose a public RSS feed for this show.",
    };
  }

  const searchUrl = `https://itunes.apple.com/search?media=podcast&entity=podcast&limit=${MAX_CHOICES}&term=${encodeURIComponent(cleanSpotifyTitle(title))}`;
  const choices = itunesResultsToChoices(await fetchItunesResults(searchUrl));
  if (choices.length === 1) {
    return { status: "resolved", feedUrl: choices[0].feedUrl, source: "apple" };
  }
  if (choices.length > 1) return { status: "choices", choices, source: "spotify" };

  return {
    status: "externalOnly",
    provider: "spotify",
    externalUrl: url.toString(),
    message: "Spotify shows can only play in MyVidTV when a matching public RSS feed is available.",
  };
}

async function resolvePageAlternateFeeds(url: URL): Promise<PodcastResolveResult> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/html;q=0.9, */*;q=0.8",
      "User-Agent": USER_AGENT,
    },
  });
  const body = await readLimitedText(res);

  if (!res.ok) {
    return { status: "notFound", message: "Could not fetch this podcast page." };
  }

  if (isLikelyFeedXml(body)) {
    return { status: "resolved", feedUrl: url.toString(), source: "direct" };
  }

  const choices = discoverFeedLinksFromHtml(body, url.toString());
  if (choices.length === 1) return { status: "resolved", feedUrl: choices[0].feedUrl, source: "html" };
  if (choices.length > 1) return { status: "choices", choices, source: "html" };

  return { status: "notFound", message: "Could not find a public podcast RSS feed on this page." };
}

async function fetchItunesResults(url: string): Promise<ItunesResult[]> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) return [];
  const body = await res.json() as { results?: ItunesResult[] };
  return Array.isArray(body.results) ? body.results : [];
}

async function fetchSpotifyOEmbedTitle(url: string): Promise<string | null> {
  const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) return null;
  const body = await res.json() as { title?: string };
  return typeof body.title === "string" ? body.title : null;
}

function itunesResultsToChoices(results: ItunesResult[]): PodcastResolveChoice[] {
  const byFeedUrl = new Map<string, PodcastResolveChoice>();
  for (const result of results) {
    if (!result.feedUrl || !parseHttpUrl(result.feedUrl)) continue;
    byFeedUrl.set(result.feedUrl, {
      title: result.collectionName ?? "Podcast",
      author: result.artistName ?? "",
      feedUrl: result.feedUrl,
      thumbnail: result.artworkUrl600 ?? result.artworkUrl100 ?? "",
    });
  }
  return Array.from(byFeedUrl.values()).slice(0, MAX_CHOICES);
}

async function readLimitedText(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DISCOVERY_BYTES) throw new Error("PODCAST_DISCOVERY_TOO_LARGE");
    chunks.push(value);
  }

  return new TextDecoder().decode(concat(chunks, total));
}

function concat(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function parseHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
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

function attrFromTag(tag: string, attrName: string): string | null {
  const match = tag.match(new RegExp(`\\s${escapeRegExp(attrName)}=["']([^"']+)["']`, "i"));
  return match?.[1]?.trim() ?? null;
}

function isFeedType(type: string): boolean {
  return [
    "application/rss+xml",
    "application/atom+xml",
    "application/xml",
    "text/xml",
  ].includes(type);
}

function looksLikeFeedHref(href: string): boolean {
  try {
    const url = new URL(href, "https://example.com");
    const path = url.pathname.toLowerCase();
    return path.endsWith(".xml") || path.endsWith(".rss") || path.includes("/rss") || path.includes("/feed");
  } catch {
    return false;
  }
}

function isLikelyFeedXml(xml: string): boolean {
  return /<(rss|feed)(?:\s|>)/i.test(xml) && /<\/(rss|feed)>/i.test(xml);
}

function cleanSpotifyTitle(title: string): string {
  return title
    .replace(/\s*\|\s*podcast\s+on\s+spotify\s*$/i, "")
    .replace(/\s*-\s*podcast\s*$/i, "")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
