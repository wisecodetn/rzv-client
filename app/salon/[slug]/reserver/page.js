import { notFound } from "next/navigation"
import BookingFlow from "@/components/BookingFlow"
import { salonSlugs, getSalon } from "@/lib/data"

export async function generateStaticParams() {
  return (await salonSlugs()).map((slug) => ({ slug }))
}

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
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 60px" }}>
      <BookingFlow
        salon={s}
        preselect={svc || null}
        confirmOnArrival={sp.confirm === "1" || sp.paycancel === "1"}
        paidSessionId={sp.paid === "1" && sp.session_id ? String(sp.session_id) : null}
        cancelSessionId={sp.paycancel === "1" && sp.session_id ? String(sp.session_id) : null}
        reschedId={sp.resched ? String(sp.resched) : null}
      />
    </div>
  )
}
