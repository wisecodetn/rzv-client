import { NextResponse } from "next/server"
import { querySalons } from "@/lib/data"

// Filtered/paginated salon search. The client filter UI calls this; later it
// can proxy a real backend without changing the client contract.
export const dynamic = "force-dynamic"

export async function GET(request) {
  const sp = request.nextUrl.searchParams

  const filters = {
    dispo: sp.get("dispo") || "any",
    date: sp.get("date") || null,
    note: parseFloat(sp.get("note")) || 0,
    budget: sp.get("budget") || "any",
    sort: sp.get("sort") || "note",
  }
  const b = sp.get("bounds")
  if (b) {
    const [n, s, e, w] = b.split(",").map(Number)
    if ([n, s, e, w].every((x) => Number.isFinite(x))) filters.bounds = { n, s, e, w }
  }

  const res = await querySalons({
    category: sp.get("category"),
    city: sp.get("city"),
    page: parseInt(sp.get("page") || "1", 10),
    sort: filters.sort,
    filters,
  })
  return NextResponse.json(res)
}
