import { NextResponse } from "next/server"
import { readJson, rejectCrossSite, upstreamSignal } from "@/lib/bff"

/** Same-origin relay for the chat assistant. The reply is a server-sent-event
 *  stream and is passed through untouched, chunk by chunk. The visitor's IP is
 *  forwarded so the API's per-visitor limit counts people, not this server, and
 *  a visitor closing the panel cancels the upstream answer (req.signal). */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

const DOWN = { message: "L’assistant ne répond pas pour le moment.", code: "assistant/api-down" }

/** Is there an assistant behind the bubble? */
export async function GET() {
  try {
    const res = await fetch(`${BASE}/public/assistant`, { cache: "no-store", signal: upstreamSignal() })
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
  const blocked = rejectCrossSite(req)
  if (blocked) return blocked
  const { json: body, error } = await readJson(req, 256 * 1024)
  if (error) return error

  const fwd = req.headers.get("x-forwarded-for") || ""
  let res
  try {
    res = await fetch(`${BASE}/public/assistant/chat`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(fwd ? { "x-forwarded-for": fwd } : {}) },
      body: JSON.stringify({ messages: body?.messages, conversationId: body?.conversationId, page: body?.page }),
      cache: "no-store",
      // The visitor closing the panel cancels the answer; a stuck upstream is
      // cut after 90 s, well past any real answer.
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(90_000)]),
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
