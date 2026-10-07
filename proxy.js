import { NextResponse } from "next/server"

/**
 * Unknown catalogue URLs are refused here, before anything renders.
 *
 * The salon, category, city and paginated pages are ISR: whatever is rendered
 * is written to the cache on disk — a 404 included. So /salon/<anything>,
 * /coiffure/<anything> or /coiffure/tunis/page-99999 each cost a full render
 * (with its API calls) and left a file behind, and a script walking random
 * URLs could fill the disk. Every valid URL is known in advance: the catalogue
 * (categories, cities), the published salons, the blog and, for page-N, the
 * number of pages. Anything else is a 404 from this table, without rendering.
 *
 * The table is a snapshot of the API, kept a minute. A slug missing from it is
 * re-checked against a fresh snapshot (at most every 10 s) before being
 * refused, so a salon published a moment ago is not turned away. If the API
 * cannot be reached, nothing is refused — the pages handle that themselves.
 */

const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
const TTL_MS = 60_000
const RECHECK_MS = 10_000

/** First path segments owned by a static route — everything else is /[category]. */
export const STATIC_ROOTS = new Set([
  "api", "assistant", "blog", "carte-cadeau", "centre-aide", "compte", "compte-supprime", "conditions-generales",
  "confidentialite", "connexion", "contact", "devenir-partenaire", "gerer-rendez-vous", "inscription",
  "liste-attente", "mot-de-passe-oublie", "parrainage", "qui-sommes-nous", "rdv", "recherche", "reinitialiser-mot-de-passe",
  "salon", "telephone", "verifier-email",
])

let table = null
let loadedAt = 0
let loading = null

async function load() {
  const get = (p) =>
    fetch(BASE + p, { cache: "no-store", signal: AbortSignal.timeout(5000) }).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${p}`)
      return r.json()
    })
  const [cats, villes, salons, coverage, posts] = await Promise.all([
    get("/public/categories"),
    get("/public/villes"),
    get("/public/salons/slugs"),
    get("/public/salons/coverage"),
    get("/public/blog/slugs"),
  ])
  const categories = new Set()
  const walk = (n) => {
    categories.add(n.slug)
    for (const k of n.children || []) walk(k)
  }
  cats.forEach(walk)
  const pageSize = coverage.pageSize || 12
  const pages = (count) => Math.max(1, Math.ceil((count || 0) / pageSize))
  return {
    categories,
    cities: new Set(villes.map((v) => v.slug)),
    salons: new Set(salons),
    posts: new Set(posts),
    pairPages: new Map((coverage.pairs || []).map((p) => [`${p.category}|${p.city}`, pages(p.count)])),
    cityPages: new Map((coverage.cities || []).map((c) => [c.city, pages(c.count)])),
  }
}

/** The table, refreshed when older than `maxAge`; null when the API is unreachable. */
async function known(maxAge = TTL_MS) {
  if (table && Date.now() - loadedAt < maxAge) return table
  loading ??= load()
    .then((t) => {
      table = t
      loadedAt = Date.now()
      return t
    })
    .catch(() => table) // keep serving the last good snapshot, or fail open
    .finally(() => {
      loading = null
    })
  return loading
}

const pageNumber = (seg) => {
  const m = /^page-([1-9]\d*)$/.exec(seg || "")
  return m ? Number(m[1]) : null
}
const decode = (s) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s // malformed escape: compared as typed, so it matches nothing
  }
}
const isOgImage = (seg) => (seg || "").startsWith("opengraph-image")

/** True when the path names something that does not exist. */
export function isUnknown(t, segs) {
  const [first, second, third] = segs
  if (first === "salon") return !!second && !t.salons.has(second)
  if (first === "blog") return !!second && !t.posts.has(second)
  if (first === "recherche") {
    if (!second) return false
    if (!t.cities.has(second)) return true
    if (third === undefined || isOgImage(third)) return false
    const n = pageNumber(third)
    return !n || n < 2 || n > (t.cityPages.get(second) || 1)
  }
  if (STATIC_ROOTS.has(first)) return false
  // /[category]/[city]/[page]
  if (!t.categories.has(first)) return true
  if (second === undefined || isOgImage(second)) return false
  if (!t.cities.has(second)) return true
  if (third === undefined || isOgImage(third)) return false
  const n = pageNumber(third)
  return !n || n < 2 || n > (t.pairPages.get(`${first}|${second}`) || 1)
}

export async function proxy(req) {
  const segs = req.nextUrl.pathname.split("/").filter(Boolean).map(decode)
  if (!segs.length) return NextResponse.next()
  // Old free-search pagination links (/recherche/page-N?q=…) → /recherche?…&page=N.
  if (segs[0] === "recherche" && segs.length === 2 && pageNumber(segs[1])) {
    const url = req.nextUrl.clone()
    url.pathname = "/recherche"
    if (pageNumber(segs[1]) > 1) url.searchParams.set("page", String(pageNumber(segs[1])))
    return NextResponse.redirect(url, 308)
  }
  let t = await known()
  if (!t || !isUnknown(t, segs)) return NextResponse.next()
  // A miss may only be news (a salon published seconds ago): ask again first.
  t = await known(RECHECK_MS)
  if (!t || !isUnknown(t, segs)) return NextResponse.next()
  return new NextResponse(null, { status: 404, headers: { "x-rzv-unknown": "1" } })
}

export const config = {
  // Pages only: not the framework's files, the API relays, media or anything
  // with an extension (icons, robots.txt, sitemap.xml…).
  matcher: ["/((?!_next/|api/|media/|.*\\.[a-zA-Z0-9]+$).*)"],
}
