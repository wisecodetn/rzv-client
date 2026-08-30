import { notFound, redirect } from "next/navigation"
import VilleResults from "@/components/recherche/VilleResults"
import { getCity, querySalons } from "@/lib/data"
import { SITE } from "@/lib/site"

/** /recherche/[ville]/page-N — crawlable pagination of the city search page. */
const parsePage = (seg) => {
  const m = /^page-(\d+)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

// Pre-render pages 2..N for each city that has salons.
export async function generateStaticParams() {
  const all = await querySalons({})
  const byCity = {}
  for (const s of all.mapItems) if (s.citySlug) byCity[s.citySlug] = (byCity[s.citySlug] || 0) + 1
  const out = []
  for (const [slug, count] of Object.entries(byCity)) {
    const totalPages = Math.max(1, Math.ceil(count / all.pageSize))
    for (let p = 2; p <= totalPages; p++) out.push({ page: slug, n: `page-${p}` })
  }
  return out
}

export async function generateMetadata({ params }) {
  const { page: citySlug, n: seg } = await params
  const num = parsePage(seg)
  const city = await getCity(citySlug)
  if (!city || !num || num < 2) return {}
  const title = `Salons de beauté à ${city.name} — page ${num}`
  return {
    title,
    description: `Page ${num} des salons à réserver en ligne à ${city.name} : prix, avis vérifiés et créneaux disponibles.`,
    alternates: { canonical: `/recherche/${city.slug}/page-${num}` },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} · ${SITE.name}`, url: `${SITE.url}/recherche/${city.slug}/page-${num}` },
  }
}

export default async function VillePagedPage({ params }) {
  const { page: citySlug, n: seg } = await params
  if (parsePage(citySlug) != null) notFound() // /recherche/page-2/page-3 is not a thing
  const num = parsePage(seg)
  if (!num) notFound()
  const city = await getCity(citySlug)
  if (!city) notFound()
  if (num === 1) redirect(`/recherche/${city.slug}`)
  const { totalPages } = await querySalons({ city: city.slug })
  if (num > totalPages) notFound()
  return <VilleResults city={city} page={num} />
}
