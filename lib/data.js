/**
 * Data layer — now API-backed. Server components, route handlers,
 * generateStaticParams and the sitemap await these functions, which fetch the
 * public Rezervy API (NestJS) with ISR and fall back to the static mock
 * (lib/mock.js) whenever the API is unreachable, so builds never hard-fail.
 *
 * Client components do NOT import the async catalog here — they read categories
 * and cities from <CatalogProvider> (fed once by the server root layout).
 */
import { cache } from "react"
import { apiGet } from "./api"
import * as MOCK from "./mock"

export { flatServices } from "./salon-utils"

// Static / presentational content (no backend) — re-exported from the mock.
export const { slugify, HOW_STEPS, POP_SVCS, TESTIMONIALS, FAQS, STATS, PRICE_ROWS, PAGE_SIZE, passFilters } = MOCK

/* ── Catalog (categories + cities) ─────────────────────────────── */
const SCHEMA_BY_TOP = { coiffure: "HairSalon", barbier: "HairSalon", onglerie: "NailSalon", "spa-massage": "DaySpa", esthetique: "BeautySalon" }

/** Build the client catalog structures from the API category tree + villes. */
function buildCatalog(apiCats, apiVilles) {
  const nodeBySlug = {}
  const add = (def, parentSlug, top, l1Name, depth) => {
    const node = {
      slug: def.slug,
      name: def.name,
      lower: def.name.toLowerCase(),
      schema: SCHEMA_BY_TOP[top] || "HealthAndBeautyBusiness",
      parentSlug,
      top,
      depth,
      isTop: depth === 0,
      l1: depth === 0 ? null : l1Name || def.name,
      childrenSlugs: [],
    }
    nodeBySlug[def.slug] = node
    node.childrenSlugs = (def.children || []).map((k) => {
      const childL1 = depth === 0 ? k.name : node.l1
      return add(k, def.slug, top, childL1, depth + 1).slug
    })
    return node
  }
  apiCats.forEach((c) => add(c, null, c.slug, null, 0))
  const categories = apiCats.map((c) => ({ slug: c.slug, name: c.name, lower: c.name.toLowerCase(), schema: SCHEMA_BY_TOP[c.slug] || "HealthAndBeautyBusiness", subs: (c.children || []).map((ch) => ch.name) }))
  const allCategories = Object.values(nodeBySlug)
  return {
    nodeBySlug,
    categories,
    allCategories,
    indexedCategories: allCategories.filter((n) => n.depth <= 1),
    cities: apiVilles.map((v) => ({ name: v.name, slug: v.slug })),
  }
}

const MOCK_CATALOG = {
  nodeBySlug: Object.fromEntries(MOCK.ALL_CATEGORIES.map((n) => [n.slug, n])),
  categories: MOCK.CATEGORIES,
  allCategories: MOCK.ALL_CATEGORIES,
  indexedCategories: MOCK.INDEXED_CATEGORIES,
  cities: MOCK.CITIES.map((c) => ({ name: c.name, slug: c.slug })),
}

/** Fetch + build the catalog once per request (deduped by React cache). */
export const getCatalog = cache(async () => {
  try {
    const [cats, villes] = await Promise.all([apiGet("/public/categories"), apiGet("/public/villes")])
    if (!Array.isArray(cats) || !cats.length || !Array.isArray(villes) || !villes.length) throw new Error("empty catalog")
    return buildCatalog(cats, villes)
  } catch {
    return MOCK_CATALOG
  }
})

export async function getCategories() { return (await getCatalog()).categories }
export async function getCities() { return (await getCatalog()).cities }
export async function getAllCategories() { return (await getCatalog()).allCategories }
export async function getIndexedCategories() { return (await getCatalog()).indexedCategories }
export async function getCategory(slug) { return (await getCatalog()).nodeBySlug[slug] || null }
export async function categoryChildren(slug) {
  const c = await getCatalog()
  return (c.nodeBySlug[slug]?.childrenSlugs || []).map((s) => c.nodeBySlug[s]).filter(Boolean)
}
export async function categoryParent(slug) {
  const c = await getCatalog()
  const p = c.nodeBySlug[slug]?.parentSlug
  return p ? c.nodeBySlug[p] : null
}
export async function getCity(slug) { return (await getCatalog()).cities.find((c) => c.slug === slug) || null }

/* ── Salons (API list / detail / search, mock fallback) ─────────── */
export async function querySalons({ category, city, page = 1, sort = "note", filters = {} } = {}) {
  const p = new URLSearchParams()
  if (category) p.set("category", category)
  if (city) p.set("city", city)
  p.set("page", String(page || 1))
  const s = filters.sort || sort
  if (s) p.set("sort", s)
  if (filters.dispo) p.set("dispo", filters.dispo)
  if (filters.date) p.set("date", filters.date)
  if (filters.note) p.set("rate", String(filters.note))
  if (filters.budget) p.set("budget", filters.budget)
  if (filters.bounds) { const b = filters.bounds; p.set("n", b.n); p.set("s", b.s); p.set("e", b.e); p.set("w", b.w) }
  try {
    return await apiGet(`/public/salons?${p.toString()}`)
  } catch {
    return MOCK.querySalons({ category, city, page, sort, filters })
  }
}

export async function searchSalons({ q = "", category = "", city = "", rate = 0, dispo = "", sort = "note", page = 1 } = {}) {
  const p = new URLSearchParams()
  if (q) p.set("q", q)
  if (category) p.set("category", category)
  if (city) p.set("city", city)
  if (rate) p.set("rate", String(rate))
  if (dispo) p.set("dispo", dispo)
  if (sort) p.set("sort", sort)
  p.set("page", String(page || 1))
  try {
    const r = await apiGet(`/public/salons?${p.toString()}`)
    return { items: r.items, total: r.total, page: r.page, pageSize: r.pageSize, totalPages: r.totalPages }
  } catch {
    return MOCK.searchSalons({ q, category, city, rate, dispo, sort, page })
  }
}

export async function getSalon(slug) {
  try {
    return await apiGet(`/public/salons/${encodeURIComponent(slug)}`)
  } catch {
    return MOCK.getSalon(slug)
  }
}

/** All salons matching a (category, city) — for sitemap + build-time counts. */
export async function salonsFor(catSlug, citySlug) {
  try {
    const r = await apiGet(`/public/salons?category=${catSlug}&city=${citySlug}`)
    return r.mapItems
  } catch {
    return MOCK.salonsFor(catSlug, citySlug)
  }
}

/** Public salon slugs — for generateStaticParams of /salon/[slug]. */
export async function salonSlugs() {
  try {
    return await apiGet("/public/salons/slugs")
  } catch {
    return MOCK.SALONS.map((s) => s.slug)
  }
}

/** First N salons in authored order — home "à proximité". */
export async function getFeaturedSalons(n = 4) {
  try {
    const r = await apiGet("/public/salons")
    return r.mapItems.slice(0, n)
  } catch {
    return MOCK.SALONS.slice(0, n)
  }
}

/** Cities that have ≥1 salon for a category, with derived count/from/rate tiles. */
export async function categoryCities(slug) {
  const { cities } = await getCatalog()
  let list
  try {
    const r = await apiGet(`/public/salons?category=${slug}`)
    list = r.mapItems
  } catch {
    list = MOCK.salonsForCategory(slug)
  }
  const byCity = {}
  for (const s of list) (byCity[s.citySlug] ||= []).push(s)
  return cities
    .map((c) => {
      const l = byCity[c.slug] || []
      if (!l.length) return null
      return { ...c, count: l.length, from: Math.min(...l.map((x) => x.from)), rate: Math.max(...l.map((x) => x.rateNum)).toFixed(1).replace(".", ","), hasReal: true }
    })
    .filter(Boolean)
}
