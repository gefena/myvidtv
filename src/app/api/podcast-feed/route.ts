import type { NextRequest } from "next/server";
import { parsePodcastFeedXml } from "@/lib/podcastFeedParser";

const USER_AGENT = "MyVidTV/0.1 (+https://myvidtv.local)";
const MAX_FEED_BYTES = 25 * 1024 * 1024;

export async function GET(req: NextRequest): Promise<Response> {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(url);
  } catch {
    return Response.json({ error: "Podcast feed URL is invalid" }, { status: 400 });
  }

  if (!["https:", "http:"].includes(upstreamUrl.protocol)) {
    return Response.json({ error: "Podcast feed URL must use HTTP or HTTPS" }, { status: 400 });
  }

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": USER_AGENT,
      },
    });
    const xml = await readLimitedText(res);

    if (!res.ok) {
      return Response.json({ error: "Could not fetch podcast feed" }, { status: 502 });
    }

    if (!isLikelyFeedXml(xml)) {
      return Response.json({ error: "URL did not return an RSS or Atom feed" }, { status: 422 });
    }

    const feed = parsePodcastFeedXml(xml, upstreamUrl.toString());

    return Response.json(feed, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PODCAST_FEED_TOO_LARGE") {
      return Response.json({ error: "Podcast feed is too large" }, { status: 413 });
    }
    return Response.json({ error: "Failed to fetch podcast feed" }, { status: 500 });
  }
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
    if (total > MAX_FEED_BYTES) {
      throw new Error("PODCAST_FEED_TOO_LARGE");
    }
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

function isLikelyFeedXml(xml: string): boolean {
  return /<(rss|feed)(?:\s|>)/i.test(xml) && /<\/(rss|feed)>/i.test(xml);
}
