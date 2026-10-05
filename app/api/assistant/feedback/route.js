import { NextResponse } from "next/server"

/** Same-origin relay for a 👍 / 👎 on one assistant answer. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 })
  }
  try {
    const res = await fetch(`${BASE}/public/assistant/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnId: body?.turnId, value: body?.value }),
      cache: "no-store",
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
