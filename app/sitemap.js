import { SITE } from "@/lib/site"
import { getIndexedCategories, getCities, querySalons, salonSlugs } from "@/lib/data"

export default async function sitemap() {
  const now = new Date()
  const url = (p) => `${SITE.url}${p}`

  const [cats, cities, all, slugs] = await Promise.all([getIndexedCategories(), getCities(), querySalons({}), salonSlugs()])

  // "topSlug|citySlug" pairs that actually have salons — so we only list real,
  // content-bearing landing pages (one pass over all salons, no per-combo fetch).
  const has = new Set()
  for (const s of all.mapItems) for (const top of s.categories || []) has.add(`${top}|${s.citySlug}`)

  const entries = [{ url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 }]

  for (const c of cats) {
    entries.push({ url: url(`/${c.slug}`), lastModified: now, changeFrequency: "weekly", priority: c.isTop ? 0.8 : 0.6 })
    for (const city of cities) {
      if (has.has(`${c.top}|${city.slug}`)) {
        entries.push({ url: url(`/${c.slug}/${city.slug}`), lastModified: now, changeFrequency: "weekly", priority: c.isTop ? 0.7 : 0.6 })
      }
    }
  }

  for (const slug of slugs) {
    entries.push({ url: url(`/salon/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.9 })
  }

  return entries
}
