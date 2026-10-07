import { notFound } from "next/navigation"
import BookingFlow from "@/components/BookingFlow"
import { getSalon } from "@/lib/data"

export async function generateMetadata({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  return { title: s ? `Réserver — ${s.name}` : "Réserver", robots: { index: false, follow: true } }
}

export default async function ReserverPage({ params, searchParams }) {
  const { slug } = await params
  const sp = (await searchParams) || {}
  const s = await getSalon(slug)
  if (!s) notFound()
  // The salon page links `?svc=<service id>`. This used to read it as a
  // Number — an index into the flattened service list — so a real id parsed to
  // NaN and nothing was ever preselected.
  const svc = sp.svc != null ? String(sp.svc) : null
  // A forfait link (?pack=<id>) preselects the forfait — it sits in the same
  // list as the services under a "pack:" id. It used to be ignored entirely,
  // so "Réserver" on a forfait opened an empty form.
  const pack = sp.pack != null ? `pack:${String(sp.pack)}` : null
  return (
    <div className="booking-page">
      <BookingFlow
        salon={s}
        preselect={svc || pack || null}
        confirmOnArrival={sp.confirm === "1" || sp.paycancel === "1"}
        paidSessionId={sp.paid === "1" && sp.session_id ? String(sp.session_id) : null}
        cancelSessionId={sp.paycancel === "1" && sp.session_id ? String(sp.session_id) : null}
        reschedId={sp.resched ? String(sp.resched) : null}
        aboId={sp.abo ? String(sp.abo) : null}
      />
    </div>
  )
}
