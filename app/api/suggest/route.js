import { NextResponse } from "next/server"
import { suggestSalons } from "@/lib/data"

/** BFF: establishment autocomplete suggestions (same-origin, no CORS). Returns a
 *  small light list only for queries >3 chars; categories are filtered client-side. */
export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") || ""
  return NextResponse.json(await suggestSalons(q))
}
