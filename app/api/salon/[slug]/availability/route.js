import { NextResponse } from "next/server"
import { apiUrl } from "@/lib/api"

/**
 * Real opening slots for a salon, proxied same-origin so the booking page can
 * ask the browser-side without a CORS change.
 *
 * Never cached: the whole point is that it reflects the agenda as it is right
 * now. A slot shown from cache is a slot the customer is told they can have
 * and then loses at the last step.
 */
export const dynamic = "force-dynamic"

export async function GET(request, { params }) {
  const { slug } = await params
  const sp = request.nextUrl.searchParams
  const qs = new URLSearchParams()
  for (const k of ["items", "date", "days"]) {
    const v = sp.get(k)
    if (v) qs.set(k, v)
  }

  try {
    const res = await fetch(`${apiUrl(`/public/salons/${encodeURIComponent(slug)}/availability`)}?${qs}`, {
      cache: "no-store",
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(data || { message: "Disponibilités indisponibles." }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    // The page must say it cannot show slots rather than invent some.
    return NextResponse.json({ message: "Disponibilités indisponibles pour le moment." }, { status: 502 })
  }
}
