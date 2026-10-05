import { NextResponse } from "next/server"

/** Same-origin relay for the chat assistant. The reply is a server-sent-event
 *  stream and is passed through untouched, chunk by chunk. The visitor's IP is
 *  forwarded so the API's per-visitor limit counts people, not this server, and
 *  a visitor closing the panel cancels the upstream answer (req.signal). */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

const DOWN = { message: "L’assistant ne répond pas pour le moment.", code: "assistant/api-down" }

/** Is there an assistant behind the bubble? */
export async function GET() {
  try {
    const res = await fetch(`${BASE}/public/assistant`, { cache: "no-store" })
    const data = res.ok ? await res.json() : { enabled: false }
    return NextResponse.json(
      { enabled: !!data.enabled, retentionDays: Number(data.retentionDays) || null },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } })
  }
}

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 })
  }

  const fwd = req.headers.get("x-forwarded-for") || ""
  let res
  try {
    res = await fetch(`${BASE}/public/assistant/chat`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(fwd ? { "x-forwarded-for": fwd } : {}) },
      body: JSON.stringify({ messages: body?.messages, conversationId: body?.conversationId, page: body?.page }),
      cache: "no-store",
      signal: req.signal,
    })
  } catch {
    return NextResponse.json(DOWN, { status: 503 })
  }

  // Refusals (limits, bad input, disabled) are plain JSON — relay them as-is.
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "")
    return new NextResponse(text || JSON.stringify(DOWN), {
      status: res.status || 503,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    })
  }

  return new Response(res.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  })
}
