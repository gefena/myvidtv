import type { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) {
    return Response.json({ error: "Missing channelId parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" } }
    );
    if (!res.ok) {
      return new Response("Could not fetch channel feed", { status: 502 });
    }
    const xml = await res.text();
    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch {
    return new Response("Failed to fetch channel feed", { status: 500 });
  }
}
