/**
 * Data layer — now API-backed. Server components, route handlers,
 * generateStaticParams and the sitemap await these functions, which fetch the
 * public Rezervy API (NestJS) with ISR. In development they fall back to the
 * static mock (lib/mock.js) when the API is unreachable; in production a
 * failure throws (ISR keeps the last good page) — never fake salons. A 404 is
 * always "does not exist", in every environment.
 *
 * Client components do NOT import the async catalog here — they read categories
 * and cities from <CatalogProvider> (fed once by the server root layout).
 */
import { cache } from "react"
import { apiGet, mediaUrl, isNotFound, mockAllowed } from "./api"
import * as MOCK from "./mock"

export { flatServices } from "./salon-utils"

/** An API read with the development-only mock as fallback (see mockAllowed()). */
async function orMock(read, mock) {
  try {
    return await read()
  } catch (e) {
    if (mockAllowed()) return mock()
    throw e
  }
}

// Static / presentational content (no backend) — re-exported from the mock.
export const { slugify, HOW_STEPS, FAQS, STATS, PAGE_SIZE } = MOCK

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
    cities: apiVilles.map((v) => ({ name: v.name, slug: v.slug, image: v.imagePath ? mediaUrl(v.imagePath) : null })),
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
export const getCatalog = cache(() =>
  orMock(async () => {
    const [cats, villes] = await Promise.all([apiGet("/public/categories"), apiGet("/public/villes")])
    if (!Array.isArray(cats) || !cats.length || !Array.isArray(villes) || !villes.length) throw new Error("empty catalog")
    return buildCatalog(cats, villes)
  }, () => MOCK_CATALOG),
)

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
/** `fresh`: skip the data cache — for the browser's own filter / map-area
 *  queries, which are endless combinations and must reflect "open today" now. */
export async function querySalons({ category, city, page = 1, sort = "note", filters = {}, fresh = false } = {}) {
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
  return orMock(
    () => apiGet(`/public/salons?${p.toString()}`, fresh ? { revalidate: 0 } : undefined),
    () => MOCK.querySalons({ category, city, page, sort, filters }),
  )
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
  return orMock(
    async () => {
      const r = await apiGet(`/public/salons?${p.toString()}`)
      return { items: r.items, total: r.total, page: r.page, pageSize: r.pageSize, totalPages: r.totalPages }
    },
    () => MOCK.searchSalons({ q, category, city, rate, dispo, sort, page }),
  )
}

export async function getSalon(slug) {
  try {
    return await apiGet(`/public/salons/${encodeURIComponent(slug)}`)
  } catch (e) {
    // Not in the API = does not exist — even when a mock salon has that slug.
    if (isNotFound(e)) return null
    if (mockAllowed()) return MOCK.getSalon(slug) ?? null
    throw e
  }
}

/** Search autocomplete: categories / sub-categories / establishments, letter-
 *  prefix matched with a 4/8/5 slot budget (17 max, leftovers cascade down).
 *  Served by the API's precomputed index; mock fallback mirrors the scoring. */
const _sNorm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
const _sScore = (name, qn, extra) => {
  const n = _sNorm(name)
  if (n.startsWith(qn)) return 0
  if (n.split(/[\s\-–—&·,'’]+/).some((w) => w.startsWith(qn))) return 1
  if (n.includes(qn)) return 2
  if (extra && _sNorm(extra).includes(qn)) return 3
  return null
}
const _sRank = (rows, qn, extraOf) =>
  rows
    .map((r) => ({ r, s: _sScore(r.name, qn, extraOf ? extraOf(r) : null) }))
    .filter((x) => x.s != null)
    .sort((a, b) => a.s - b.s || a.r.name.length - b.r.name.length)
    .map((x) => x.r)

export async function suggestSearch(q) {
  const term = (q || "").trim()
  if (!term) return { cats: [], subs: [], estabs: [] }
  try {
    return await apiGet(`/public/salons/suggest?q=${encodeURIComponent(term)}`)
  } catch (e) {
    if (!mockAllowed()) throw e
    const qn = _sNorm(term)
    const nodes = MOCK.ALL_CATEGORIES
    const cats = _sRank(nodes.filter((n) => n.isTop), qn)
    const subs = _sRank(nodes.filter((n) => !n.isTop), qn)
    const ests = _sRank(MOCK.SALONS, qn, (s) => [s.kind, s.city, s.area, ...(s.tags || [])].join(" "))
    const catTake = Math.min(4, cats.length)
    const subQuota = 8 + (4 - catTake)
    const subTake = Math.min(subQuota, subs.length)
    const estTake = Math.min(5 + (subQuota - subTake), ests.length)
    const topName = (slug) => nodes.find((n) => n.slug === slug)?.name
    return {
      cats: cats.slice(0, catTake).map((c) => ({ slug: c.slug, name: c.name })),
      subs: subs.slice(0, subTake).map((c) => ({ slug: c.slug, name: c.name, top: c.top, topName: topName(c.top) })),
      estabs: ests.slice(0, estTake).map((s) => ({ slug: s.slug, name: s.name, sub: `${s.kind} · ${s.city}` })),
    }
  }
}

/**
 * Which (category, city) pairs have salons, how many, from what price and with
 * what average rating — computed by the API with the same matching as the
 * listings (a salon belongs to a category through the services it sells). The
 * site builds, indexes, links and lists in the sitemap only these pages.
 * Fetched once per render (React cache).
 */
export const getCoverage = cache(() =>
  orMock(
    async () => {
      const r = await apiGet("/public/salons/coverage")
      return {
        pageSize: r.pageSize || PAGE_SIZE,
        pairs: (r.pairs || []).filter((p) => p.count > 0),
        cities: Object.fromEntries((r.cities || []).map((c) => [c.city, c.count])),
      }
    },
    () => mockCoverage(),
  ),
)

/** Development fallback: the same shape, from the mock salons' top categories. */
function mockCoverage() {
  const pairs = {}
  const cities = {}
  for (const s of MOCK.SALONS) {
    if (!s.citySlug) continue
    cities[s.citySlug] = (cities[s.citySlug] || 0) + 1
    for (const c of s.categories || []) {
      const k = `${c}|${s.citySlug}`
      const row = (pairs[k] ||= { category: c, city: s.citySlug, count: 0, from: null, reviews: 0, rating: null })
      row.count++
      row.from = row.from == null ? s.from : Math.min(row.from, s.from)
    }
  }
  return { pageSize: PAGE_SIZE, pairs: Object.values(pairs), cities }
}

/** The coverage row of one (category, city) page, or null when it has no salon. */
export async function pairOf(catSlug, citySlug) {
  const { pairs } = await getCoverage()
  return pairs.find((p) => p.category === catSlug && p.city === citySlug) || null
}

/** Public salon slugs — for generateStaticParams of /salon/[slug]. */
export async function salonSlugs() {
  return orMock(
    () => apiGet("/public/salons/slugs"),
    () => MOCK.SALONS.map((s) => s.slug),
  )
}

/** First N salons in authored order — home "à proximité". */
export async function getFeaturedSalons(n = 4) {
  return orMock(
    // Full cards from the first page — map pins carry too little for a card.
    async () => (await apiGet("/public/salons")).items.slice(0, n),
    () => MOCK.SALONS.slice(0, n),
  )
}

/**
 * What salons say about Rezervy — testimonials written by salon owners in
 * Rezervy Pro and published by our team. Never invented: when there are none
 * yet, the home page simply has no testimonials section.
 */
export async function getPlatformReviews(n = 3) {
  try {
    const rows = await apiGet(`/public/platform-reviews?limit=${n}`)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

/** Cities that have ≥1 salon for a category, with real count / price floor /
 *  average rating — busiest first. */
export async function categoryCities(slug) {
  const [{ cities }, { pairs }] = await Promise.all([getCatalog(), getCoverage()])
  const bySlug = new Map(cities.map((c) => [c.slug, c]))
  return pairs
    .filter((p) => p.category === slug && bySlug.has(p.city))
    .sort((a, b) => b.count - a.count || bySlug.get(a.city).name.localeCompare(bySlug.get(b.city).name, "fr"))
    .map((p) => ({
      ...bySlug.get(p.city),
      count: p.count,
      from: p.from,
      rate: p.rating != null ? p.rating.toFixed(1).replace(".", ",") : null,
      reviews: p.reviews || 0,
    }))
}
