import type { NextRequest } from "next/server";
import {
  createBodySnippet,
  createDiagnosticContext,
  diagnosticJson,
  errorDetail,
  getSafeHeaders,
  logDiagnosticFailure,
} from "@/lib/serverDiagnostics";

const ROUTE = "channel-feed";
const USER_AGENT = "Mozilla/5.0 (compatible; bot)";

export async function GET(req: NextRequest): Promise<Response> {
  const ctx = createDiagnosticContext(ROUTE, req.nextUrl.searchParams.get("debug"));
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) {
    return diagnosticJson(ctx, "MISSING_CHANNEL_ID", "Missing channelId parameter", 400);
  }

  const upstreamUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;

  try {
    const res = await fetch(upstreamUrl, { headers: { "User-Agent": USER_AGENT } });
    const upstreamHeaders = getSafeHeaders(res.headers);
    const xml = await res.text();

    if (!res.ok) {
      const detail = {
        target: channelId,
        upstreamUrl,
        upstreamStatus: res.status,
        upstreamStatusText: res.statusText,
        upstreamHeaders,
        bodySnippet: createBodySnippet(xml),
      };
      logDiagnosticFailure(ctx, "youtube_rss_upstream_error", detail);
      return diagnosticJson(ctx, "YOUTUBE_RSS_UPSTREAM_ERROR", "Could not fetch channel feed", 502, detail);
    }

    if (!isLikelyFeedXml(xml)) {
      const detail = {
        target: channelId,
        upstreamUrl,
        upstreamStatus: res.status,
        upstreamStatusText: res.statusText,
        upstreamHeaders,
        bodySnippet: createBodySnippet(xml),
      };
      logDiagnosticFailure(ctx, "youtube_rss_parse_error", detail);
      return diagnosticJson(ctx, "YOUTUBE_RSS_PARSE_ERROR", "Could not parse channel feed", 502, detail);
    }

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
        "x-request-id": ctx.requestId,
      },
    });
  } catch (error) {
    const detail = {
      target: channelId,
      upstreamUrl,
      ...errorDetail(error),
    };
    logDiagnosticFailure(ctx, "youtube_rss_fetch_error", detail);
    return diagnosticJson(ctx, "YOUTUBE_RSS_FETCH_ERROR", "Failed to fetch channel feed", 500, detail);
  }
}

function isLikelyFeedXml(xml: string): boolean {
  return /<feed(?:\s|>)/i.test(xml) && /<\/feed>/i.test(xml);
}
