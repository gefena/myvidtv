import type { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) {
    return Response.json({ error: "Missing handle parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
    });
    if (!res.ok) {
      return Response.json({ error: "Could not fetch channel page" }, { status: 404 });
    }

    const html = await res.text();
    // Parse channel ID from the RSS <link> tag in <head>
    const match = html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]+)/);
    if (!match) {
      return Response.json({ error: "Could not parse channel ID" }, { status: 404 });
    }

    return Response.json({ channelId: match[1] });
  } catch {
    return Response.json({ error: "Failed to resolve channel" }, { status: 500 });
  }
}
