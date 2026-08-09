import { NextResponse } from "next/server"
import { getSalon } from "@/lib/data"

/** BFF: single salon by slug (proxies the public API, mock fallback). Lets client
 *  components — e.g. the favorites list — read salon data same-origin (no CORS). */
export async function GET(_req, { params }) {
  const { slug } = await params
  const salon = await getSalon(slug)
  if (!salon) return NextResponse.json({ error: "not-found" }, { status: 404 })
  return NextResponse.json(salon)

}
