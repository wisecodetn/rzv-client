/**
 * Server-side fetch wrapper for the Rezervy public API (NestJS). Used by server
 * components, route handlers, generateStaticParams and the sitemap. ISR via
 * Next's fetch `revalidate`, so static pages refresh without a rebuild. Callers
 * wrap this in try/catch and fall back to the mock so builds never hard-fail
 * when the API is unreachable.
 */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
const DEFAULT_REVALIDATE = Number(process.env.API_REVALIDATE || 300)

export function apiUrl(path) {
  return BASE + (path.startsWith("/") ? path : `/${path}`)
}

export async function apiGet(path, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const res = await fetch(apiUrl(path), { next: { revalidate }, headers: { accept: "application/json" } })
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  return res.json()
}
