import { SITE } from "@/lib/site"
import { getIndexedCategories, getCities, querySalons, salonSlugs } from "@/lib/data"
import { getPosts } from "@/lib/blog"

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

  entries.push({ url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 })
  for (const p of await getPosts()) {
    entries.push({ url: url(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly", priority: 0.5 })
  }

  // City search pages (/recherche/<ville>) for cities that have salons.
  const cityCount = {}
  for (const s of all.mapItems) if (s.citySlug) cityCount[s.citySlug] = (cityCount[s.citySlug] || 0) + 1
  for (const [slug, count] of Object.entries(cityCount)) {
    entries.push({ url: url(`/recherche/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.7 })
    const totalPages = Math.max(1, Math.ceil(count / all.pageSize))
    for (let p = 2; p <= totalPages; p++) {
      entries.push({ url: url(`/recherche/${slug}/page-${p}`), lastModified: now, changeFrequency: "weekly", priority: 0.5 })
    }
  }

  return entries
}
