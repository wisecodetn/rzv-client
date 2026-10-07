import { SITE } from "@/lib/site"
import { getIndexedCategories, getCoverage, salonSlugs } from "@/lib/data"
import { getPosts } from "@/lib/blog"

/**
 * Only pages that exist and have something on them. Category and city listings
 * come from the API's coverage (the same matching as the listings themselves):
 * the sitemap used to guess from the top category and list empty pages, and to
 * count from a list capped at 80 salons.
 */
export default async function sitemap() {
  const now = new Date()
  const url = (p) => `${SITE.url}${p}`

  const [cats, { pairs, cities, pageSize }, slugs, posts] = await Promise.all([getIndexedCategories(), getCoverage(), salonSlugs(), getPosts()])

  const entries = [{ url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 }]
  // The indexable static pages (the noindex ones — sign-in, account, coming
  // soon — stay out).
  for (const p of ["/liste-attente", "/devenir-partenaire", "/qui-sommes-nous", "/centre-aide", "/assistant", "/contact", "/conditions-generales", "/confidentialite"]) {
    entries.push({ url: url(p), lastModified: now, changeFrequency: "monthly", priority: p === "/devenir-partenaire" || p === "/liste-attente" ? 0.6 : 0.3 })
  }

  for (const c of cats) {
    const mine = pairs.filter((p) => p.category === c.slug)
    if (!mine.length) continue // an empty category page is noindex — keep it out
    entries.push({ url: url(`/${c.slug}`), lastModified: now, changeFrequency: "weekly", priority: c.isTop ? 0.8 : 0.6 })
    for (const p of mine) {
      entries.push({ url: url(`/${c.slug}/${p.city}`), lastModified: now, changeFrequency: "weekly", priority: c.isTop ? 0.7 : 0.6 })
      for (let n = 2; n <= Math.ceil(p.count / pageSize); n++) {
        entries.push({ url: url(`/${c.slug}/${p.city}/page-${n}`), lastModified: now, changeFrequency: "weekly", priority: 0.5 })
      }
    }
  }

  for (const slug of slugs) {
    entries.push({ url: url(`/salon/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.9 })
  }

  entries.push({ url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 })
  for (const p of posts) {
    entries.push({ url: url(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly", priority: 0.5 })
  }

  // City search pages (/recherche/<ville>) for cities that have salons.
  for (const [slug, count] of Object.entries(cities)) {
    entries.push({ url: url(`/recherche/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.7 })
    for (let n = 2; n <= Math.ceil(count / pageSize); n++) {
      entries.push({ url: url(`/recherche/${slug}/page-${n}`), lastModified: now, changeFrequency: "weekly", priority: 0.5 })
    }
  }

  return entries
}
