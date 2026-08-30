/**
 * Server-side fetch wrapper for the Rezervy public API (NestJS). Used by server
 * components, route handlers, generateStaticParams and the sitemap. ISR via
 * Next's fetch `revalidate`, so static pages refresh without a rebuild. Callers
 * wrap this in try/catch and fall back to the mock so builds never hard-fail
 * when the API is unreachable.
 */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
// Five minutes is right in production; in development it means every content
// change stays invisible for five minutes, so dev revalidates almost at once.
const DEFAULT_REVALIDATE = Number(
  process.env.API_REVALIDATE || (process.env.NODE_ENV === "production" ? 300 : 5),
)

export function apiUrl(path) {
  return BASE + (path.startsWith("/") ? path : `/${path}`)
}

/** Public URL of an uploaded media file (ville images…). Browser-facing, so it
 *  prefers the public env vars over a possibly-internal API_URL. */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_URL || process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001").replace(/\/$/, "")
export function mediaUrl(file) {
  return file ? `${MEDIA_BASE}/media/${file}` : null
}

/** Same-origin path for an API media URL (`/media/x.webp`), served through the
 *  next.config rewrite. Use this for <Image> — a relative src is optimized as a
 *  local image. Keep `mediaUrl` (absolute) for anything fetched server-side,
 *  like the OG image routes. */
export function mediaPath(url) {
  if (!url) return null
  const i = url.indexOf("/media/")
  return i >= 0 ? url.slice(i) : url
}

export async function apiGet(path, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const res = await fetch(apiUrl(path), { next: { revalidate }, headers: { accept: "application/json" } })
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  return res.json()
}
