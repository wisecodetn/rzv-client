import { NextResponse } from "next/server"
import { suggestSearch } from "@/lib/data"

/** BFF: search autocomplete (same-origin, no CORS). Proxies the API's indexed
 *  suggest — categories / sub-categories / establishments, 4/8/5 budget (17 max).
 *  s-maxage lets a CDN/proxy absorb repeated keystrokes across users. */
export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") || ""
  const data = await suggestSearch(q)
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
  })
}
