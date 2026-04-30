import type { NextRequest } from "next/server";
import {
  createBodySnippet,
  createDiagnosticContext,
  diagnosticJson,
  errorDetail,
  getSafeHeaders,
  logDiagnosticFailure,
} from "@/lib/serverDiagnostics";

const ROUTE = "resolve-channel";
const USER_AGENT = "Mozilla/5.0 (compatible; bot)";

export async function GET(req: NextRequest): Promise<Response> {
  const ctx = createDiagnosticContext(ROUTE, req.nextUrl.searchParams.get("debug"));
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return diagnosticJson(ctx, "MISSING_CHANNEL_PATH", "Missing path parameter", 400);
  }

  const upstreamUrl = `https://www.youtube.com/${path}`;

  try {
    const res = await fetch(upstreamUrl, { headers: { "User-Agent": USER_AGENT } });
    const upstreamHeaders = getSafeHeaders(res.headers);
    const html = await res.text();

    if (!res.ok) {
      const detail = {
        target: path,
        upstreamUrl,
        upstreamStatus: res.status,
        upstreamStatusText: res.statusText,
        upstreamHeaders,
        bodySnippet: createBodySnippet(html),
      };
      logDiagnosticFailure(ctx, "youtube_channel_upstream_error", detail);
      if (res.status === 404) {
        return diagnosticJson(ctx, "YOUTUBE_CHANNEL_NOT_FOUND", "Channel not found", 404, detail);
      }
      return diagnosticJson(ctx, "YOUTUBE_CHANNEL_UPSTREAM_ERROR", "Could not resolve channel", 502, detail);
    }

    const match = html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]+)/);
    if (!match) {
      const detail = {
        target: path,
        upstreamUrl,
        upstreamStatus: res.status,
        upstreamStatusText: res.statusText,
        upstreamHeaders,
        bodySnippet: createBodySnippet(html),
      };
      logDiagnosticFailure(ctx, "youtube_channel_parse_error", detail);
      return diagnosticJson(ctx, "YOUTUBE_CHANNEL_PARSE_ERROR", "Could not parse channel ID", 422, detail);
    }

    return Response.json({ channelId: match[1] }, { headers: { "x-request-id": ctx.requestId } });
  } catch (error) {
    const detail = {
      target: path,
      upstreamUrl,
      ...errorDetail(error),
    };
    logDiagnosticFailure(ctx, "youtube_channel_fetch_error", detail);
    return diagnosticJson(ctx, "YOUTUBE_CHANNEL_FETCH_ERROR", "Could not reach YouTube", 502, detail);
  }
}
