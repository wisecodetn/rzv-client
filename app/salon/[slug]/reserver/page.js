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
  const svc = sp.svc != null ? Number(sp.svc) : null
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 60px" }}>
      <BookingFlow salon={s} preselect={Number.isFinite(svc) ? svc : null} />
    </div>
  )
}
