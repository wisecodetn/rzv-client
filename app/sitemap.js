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
  // The indexable static pages (the noindex ones — sign-in, account — stay
  // out). Their addresses are the ones rezervy.io has always used.
  const STATIC = {
    "/salons": 0.7,
    "/devenir-partenaire": 0.6,
    "/liste-attente": 0.6,
    "/zones-activites": 0.5,
    "/a-propos": 0.5,
    "/tarifs": 0.6,
    "/faqs": 0.5,
    "/contact": 0.5,
    "/carte-cadeau": 0.5,
    "/cagnotte": 0.5,
    "/fidelite": 0.5,
    "/parrainage": 0.5,
    "/referentiel-candidature": 0.5,
    "/solutions-entreprises": 0.5,
    "/collaboration-marques": 0.5,
    "/glossaire": 0.5,
    "/assistant": 0.3,
    "/mentions-legales": 0.3,
    "/cgv": 0.3,
    "/confidentialite": 0.3,
  }
  for (const [p, priority] of Object.entries(STATIC)) {
    entries.push({ url: url(p), lastModified: now, changeFrequency: "monthly", priority })
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

  // City search pages (/salons/<ville>) for cities that have salons.
  for (const [slug, count] of Object.entries(cities)) {
    entries.push({ url: url(`/salons/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.7 })
    for (let n = 2; n <= Math.ceil(count / pageSize); n++) {
      entries.push({ url: url(`/salons/${slug}/page-${n}`), lastModified: now, changeFrequency: "weekly", priority: 0.5 })
    }
  }

  return entries
}
