import { notFound } from "next/navigation"
import CityScreen from "@/components/CityScreen"
import { getIndexedCategories, getCategory, getCity, getCoverage, pairOf } from "@/lib/data"
import { SITE } from "@/lib/site"
import { de } from "@/lib/fr"
import { pageMeta } from "@/lib/meta"

// Only (category, city) pairs that have salons are built ahead. Any other valid
// pair still renders on demand (and says so), but is kept out of the index.
export async function generateStaticParams() {
  const [cats, { pairs }] = await Promise.all([getIndexedCategories(), getCoverage()])
  const indexed = new Set(cats.map((c) => c.slug))
  return pairs.filter((p) => indexed.has(p.category)).map((p) => ({ category: p.category, city: p.city }))
}

export async function generateMetadata({ params }) {
  const { category, city } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  if (!cat || !ct) return {}
  const pair = await pairOf(cat.slug, ct.slug)
  const n = pair?.count ?? 0
  const salons = `${n} salon${n > 1 ? "s" : ""}`
  const canonical = `/${cat.slug}/${ct.slug}`

  // No salon here (yet): a real page for the visitor, but nothing to rank.
  if (!n) {
    return pageMeta({
      ownImage: true, // this route has its own opengraph-image
      title: `${cat.name} à ${ct.name}`,
      description: `Aucun salon ${de(cat.lower)} n'est encore référencé à ${ct.name} sur Rezervy.`,
      path: canonical,
      robots: { index: false, follow: true },
    })
  }

  const title = `${cat.name} à ${ct.name} — ${salons}, prix & avis`
  const description = [
    `Réservez un salon ${de(cat.lower)} à ${ct.name} : ${n > 1 ? `comparez ${salons}` : "1 salon disponible"}`,
    pair.from != null ? `, prestations dès ${String(pair.from).replace(".", ",")} TND` : "",
    pair.rating != null && pair.reviews ? `, note moyenne ${pair.rating.toFixed(1).replace(".", ",")}/5` : "",
    ". Confirmation par e-mail, annulation gratuite jusqu'au début du rendez-vous.",
  ].join("")
  return pageMeta({
    ownImage: true, // this route has its own opengraph-image
    title,
    description,
    path: canonical,
    // Same rule as /[category]: third-level prestations are not indexed.
    ...(cat.depth > 1 ? { robots: { index: false, follow: true } } : {}),
    keywords: [`${cat.lower} ${ct.name}`, `salon ${cat.lower} ${ct.name}`, `réserver ${cat.lower} ${ct.name}`, "réservation en ligne"],
  })
}

export default async function CityPage({ params }) {
  const { category, city } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  if (!cat || !ct) notFound()
  return <CityScreen cat={cat} ct={ct} page={1} />
}
