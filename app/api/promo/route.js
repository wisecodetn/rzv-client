import { NextResponse } from "next/server"

/** Promo-code check for the booking page. Same-origin so the customer session
 *  cookie reaches the API (per-client rules apply once signed in); the discount
 *  itself is always computed server-side from the salon's own prices. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

export async function POST(req) {
  const body = await req.text()
  let res
  try {
    res = await fetch(`${BASE}/public/promos/validate`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: req.headers.get("cookie") || "" },
      body,
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible.", code: "promo/api-down" }, { status: 503 })
  }
  const text = await res.text()
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  })
}
