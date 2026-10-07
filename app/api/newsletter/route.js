import { NextResponse } from "next/server"
import { readJson, rejectCrossSite, upstreamSignal } from "@/lib/bff"

/** Same-origin relay for the newsletter sign-up, so the browser never talks
 *  to the API host directly (no CORS, and the API stays off the public origin).
 *  The visitor's IP is forwarded so the server can apply its own rate limit —
 *  without it every sign-up would look like it came from this server. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

export async function POST(req) {
  const blocked = rejectCrossSite(req)
  if (blocked) return blocked
  const { json: body, error } = await readJson(req)
  if (error) return error

  const fwd = req.headers.get("x-forwarded-for") || ""
  try {
    const res = await fetch(`${BASE}/public/newsletter`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(fwd ? { "x-forwarded-for": fwd } : {}) },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: upstreamSignal(),
    })
    const text = await res.text()
    return new NextResponse(text || null, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    })
  } catch {
    return NextResponse.json(
      { message: "Service momentanément indisponible — réessayez dans un instant.", code: "newsletter/api-down" },
      { status: 503 },
    )
  }
}
