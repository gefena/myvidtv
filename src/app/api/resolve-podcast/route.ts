import type { NextRequest } from "next/server";
import { resolvePodcastLink } from "@/lib/podcastLinkResolver";

export async function GET(req: NextRequest): Promise<Response> {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const result = await resolvePodcastLink(url);
    return Response.json(result, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PODCAST_DISCOVERY_TOO_LARGE") {
      return Response.json({ error: "Podcast page is too large to inspect" }, { status: 413 });
    }
    return Response.json({ error: "Could not resolve podcast link" }, { status: 500 });
  }
}
