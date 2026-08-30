import { notFound, redirect } from "next/navigation"
import RechercheResults, { parseSearch } from "@/components/recherche/RechercheResults"
import VilleResults from "@/components/recherche/VilleResults"
import { getCity, querySalons } from "@/lib/data"
import { SITE } from "@/lib/site"

/**
 * Polymorphic segment under /recherche:
 *  - "page-N"  → page N of the free-form query search (?q=&cat=… — noindex)
 *  - "<ville>" → the SEO city page /recherche/tunis (indexable, SSG/ISR)
 */
const parsePage = (seg) => {
  const m = /^page-(\d+)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

// Pre-render the city pages that actually have salons; others render on demand.
export async function generateStaticParams() {
  const all = await querySalons({})
  const withSalons = new Set(all.mapItems.map((s) => s.citySlug).filter(Boolean))
  return [...withSalons].map((slug) => ({ page: slug }))
}

export async function generateMetadata({ params }) {
  const { page: seg } = await params
  if (parsePage(seg)) return { title: "Recherche", robots: { index: false, follow: true } }
  const city = await getCity(seg)
  if (!city) return {}
  const q = await querySalons({ city: city.slug })
  if (!q.total) return { title: `Salons à ${city.name}`, robots: { index: false, follow: true } }
  const title = `Salons de beauté à ${city.name} — ${q.total} adresse${q.total > 1 ? "s" : ""} à réserver en ligne`
  const description = `Coiffure, barbier, onglerie, esthétique et spa à ${city.name} : comparez ${q.total} salons, prix et avis vérifiés, et réservez en ligne en 30 secondes. Confirmation par SMS.`
  return {
    title,
    description,
    alternates: { canonical: `/recherche/${city.slug}` },
    openGraph: { title: `${title} · ${SITE.name}`, description, url: `${SITE.url}/recherche/${city.slug}` },
    robots: { index: true, follow: true },
  }
}

export default async function RechercheSegPage({ params, searchParams }) {
  const { page: seg } = await params
  const n = parsePage(seg)

  // page-N → free-form query-search pagination (unchanged behavior)
  if (n) {
    const sp = (await searchParams) || {}
    if (n === 1) {
      const qs = new URLSearchParams(sp).toString()
      redirect("/recherche" + (qs ? `?${qs}` : ""))
    }
    return <RechercheResults params={parseSearch(sp)} page={n} />
  }

  // <ville> → SEO city page
  const city = await getCity(seg)
  if (!city) notFound()
  return <VilleResults city={city} page={1} />
}
