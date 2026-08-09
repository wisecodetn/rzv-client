import { notFound, redirect } from "next/navigation"
import CityScreen from "@/components/CityScreen"
import { getIndexedCategories, getCities, getCategory, getCity, querySalons } from "@/lib/data"
import { SITE } from "@/lib/site"

const parsePage = (seg) => {
  const m = /^page-(\d+)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

// Pre-render pages 2..N for each category/city so every salon is on a crawlable URL.
export async function generateStaticParams() {
  const [cats, cities] = await Promise.all([getIndexedCategories(), getCities()])
  const out = []
  for (const c of cats) {
    for (const city of cities) {
      const { totalPages } = await querySalons({ category: c.slug, city: city.slug })
      for (let p = 2; p <= totalPages; p++) out.push({ category: c.slug, city: city.slug, page: `page-${p}` })
    }
  }
  return out
}

export async function generateMetadata({ params }) {
  const { category, city, page } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  const n = parsePage(page)
  if (!cat || !ct || !n || n < 2) return {}
  const title = `${cat.name} à ${ct.name} — page ${n} sur les salons`
  const url = `${SITE.url}/${cat.slug}/${ct.slug}/page-${n}`
  return {
    title,
    description: `${cat.name} à ${ct.name} : page ${n} des salons à réserver en ligne. Prix, avis vérifiés et créneaux disponibles.`,
    alternates: { canonical: `/${cat.slug}/${ct.slug}/page-${n}` },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} · ${SITE.name}`, url },
  }
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
