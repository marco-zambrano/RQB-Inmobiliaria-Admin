import { NextResponse } from "next/server"
import { toGoogleMapsEmbedUrl } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body?.url === "string" ? body.url.trim() : ""
    if (!url) {
      return NextResponse.json({ embedUrl: null }, { status: 400 })
    }
    const embedUrl = await toGoogleMapsEmbedUrl(url)
    return NextResponse.json({ embedUrl })
  } catch {
    return NextResponse.json({ embedUrl: null }, { status: 500 })
  }
}
