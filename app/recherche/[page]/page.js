import { notFound } from "next/navigation"
import VilleResults from "@/components/recherche/VilleResults"
import { getCity, querySalons, getCoverage, getCategories } from "@/lib/data"
import { SITE } from "@/lib/site"
import { pageMeta } from "@/lib/meta"

/**
 * The SEO city page /recherche/<ville> (indexable, SSG/ISR). The free search's
 * old /recherche/page-N links are redirected to /recherche?page=N by proxy.js
 * before they get here.
 */
const parsePage = (seg) => {
  const m = /^page-([1-9]\d*)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

// Pre-render the city pages that actually have salons; others render on demand.
export async function generateStaticParams() {
  const { cities } = await getCoverage()
  return Object.keys(cities).map((slug) => ({ page: slug }))
}

export async function generateMetadata({ params }) {
  const { page: seg } = await params
  if (parsePage(seg)) return { title: "Recherche", robots: { index: false, follow: true } }
  const city = await getCity(seg)
  if (!city) return {}
  const q = await querySalons({ city: city.slug })
  if (!q.total) return { title: `Salons à ${city.name}`, robots: { index: false, follow: true } }
  // Only the categories this city really has (coverage), never the full list.
  const [{ pairs }, cats] = await Promise.all([getCoverage(), getCategories()])
  const here = new Set(pairs.filter((p) => p.city === city.slug).map((p) => p.category))
  const names = cats.filter((c) => here.has(c.slug)).map((c) => c.name.toLowerCase())
  const what = names.length ? names.join(", ").replace(/^./, (ch) => ch.toUpperCase()) : "Salons de beauté"
  const title = `Salons de beauté à ${city.name} — ${q.total} adresse${q.total > 1 ? "s" : ""}`
  const description = `${what} à ${city.name} : ${q.total > 1 ? `comparez ${q.total} salons, leurs prix et leurs avis` : "1 salon, ses prix et ses avis"}, et réservez en ligne. Confirmation par e-mail.`
  return pageMeta({ title, description, path: `/recherche/${city.slug}` })
}

export default async function RechercheSegPage({ params }) {
  const { page: seg } = await params
  if (parsePage(seg)) notFound()
  const city = await getCity(seg)
  if (!city) notFound()
  return <VilleResults city={city} page={1} />
}
