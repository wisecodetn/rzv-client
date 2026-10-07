import { notFound, redirect } from "next/navigation"
import CityScreen from "@/components/CityScreen"
import { getIndexedCategories, getCategory, getCity, querySalons, getCoverage } from "@/lib/data"
import { SITE } from "@/lib/site"
import { pageMeta } from "@/lib/meta"

const parsePage = (seg) => {
  const m = /^page-([1-9]\d*)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

// Pre-render pages 2..N for each category/city so every salon is on a crawlable
// URL — from one coverage read, not one API call per (category, city) pair.
export async function generateStaticParams() {
  const [cats, { pairs, pageSize }] = await Promise.all([getIndexedCategories(), getCoverage()])
  const indexed = new Set(cats.map((c) => c.slug))
  const out = []
  for (const p of pairs) {
    if (!indexed.has(p.category)) continue
    const totalPages = Math.ceil(p.count / pageSize)
    for (let n = 2; n <= totalPages; n++) out.push({ category: p.category, city: p.city, page: `page-${n}` })
  }
  return out
}

export async function generateMetadata({ params }) {
  const { category, city, page } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  const n = parsePage(page)
  if (!cat || !ct || !n || n < 2) return {}
  return pageMeta({
    ownImage: true, // this route has its own opengraph-image
    title: `${cat.name} à ${ct.name} — page ${n}`,
    description: `${cat.name} à ${ct.name} : page ${n} des salons à réserver en ligne — prix, avis et créneaux disponibles.`,
    path: `/${cat.slug}/${ct.slug}/page-${n}`,
  })
}

export default async function CityPagedPage({ params }) {
  const { category, city, page } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  const n = parsePage(page)
  if (!cat || !ct || !n) notFound()
  if (n === 1) redirect(`/${cat.slug}/${ct.slug}`)
  const { totalPages } = await querySalons({ category: cat.slug, city: ct.slug })
  if (n > totalPages) notFound()
  return <CityScreen cat={cat} ct={ct} page={n} />
}
