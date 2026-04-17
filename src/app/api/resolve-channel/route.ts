import type { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return Response.json({ error: "Missing path parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/${path}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
    });
    if (!res.ok) {
      return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const html = await res.text();
    const match = html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]+)/);
    if (!match) {
      return Response.json({ error: "Could not parse channel ID" }, { status: 422 });
    }

    return Response.json({ channelId: match[1] });
  } catch {
    return Response.json({ error: "Could not reach YouTube" }, { status: 502 });
  }
}
