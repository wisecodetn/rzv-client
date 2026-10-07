import { NextResponse } from "next/server"
import { readJson, rejectCrossSite, upstreamSignal } from "@/lib/bff"

/** Same-origin relay for a 👍 / 👎 on one assistant answer. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

export async function POST(req) {
  const blocked = rejectCrossSite(req)
  if (blocked) return blocked
  const { json: body, error } = await readJson(req)
  if (error) return error
  try {
    const res = await fetch(`${BASE}/public/assistant/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnId: body?.turnId, value: body?.value }),
      cache: "no-store",
      signal: upstreamSignal(),
    })
    const text = await res.text()
    return new NextResponse(text || null, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    })
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible." }, { status: 503 })
  }
}
