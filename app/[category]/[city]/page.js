import { notFound } from "next/navigation"
import CityScreen from "@/components/CityScreen"
import { getIndexedCategories, getCities, getCategory, getCity, salonsFor } from "@/lib/data"
import { SITE } from "@/lib/site"

export async function generateStaticParams() {
  const [cats, cities] = await Promise.all([getIndexedCategories(), getCities()])
  return cats.flatMap((c) => cities.map((city) => ({ category: c.slug, city: city.slug })))
}

export async function generateMetadata({ params }) {
  const { category, city } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  if (!cat || !ct) return {}
  const n = (await salonsFor(cat.slug, ct.slug)).length
  const title = `${cat.name} à ${ct.name} — ${n || "les meilleurs"} salons, prix & avis`
  const description = `Réservez un salon de ${cat.lower} à ${ct.name} : comparez ${n || "plusieurs"} établissements, prix moyens, avis vérifiés et créneaux disponibles. Confirmation par SMS, annulation gratuite 24h avant.`
  return {
    title,
    description,
    alternates: { canonical: `/${cat.slug}/${ct.slug}` },
    keywords: [`${cat.lower} ${ct.name}`, `salon ${cat.lower} ${ct.name}`, `réserver ${cat.lower} ${ct.name}`, "réservation en ligne"],
    openGraph: { type: "website", locale: SITE.locale, siteName: SITE.name, title: `${title} · ${SITE.name}`, description, url: `${SITE.url}/${cat.slug}/${ct.slug}` },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description },
  }
}

export default async function CityPage({ params }) {
  const { category, city } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  if (!cat || !ct) notFound()
  return <CityScreen cat={cat} ct={ct} page={1} />
}
