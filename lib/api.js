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

/** A non-2xx answer. `status` lets callers tell "not found" (404) from "broken". */
export class ApiError extends Error {
  constructor(status, path) {
    super(`API ${status} for ${path}`)
    this.status = status
  }
}

/** A hung API must not hang page rendering, ISR or the build with it. */
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || 10000)

export async function apiGet(path, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const res = await fetch(apiUrl(path), {
    next: { revalidate },
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new ApiError(res.status, path)
  return res.json()
}

/** True for a definite "this does not exist" from the API. */
export const isNotFound = (e) => e instanceof ApiError && e.status === 404

/**
 * The static mock (lib/mock.js) is a development aid only. In production a
 * failing API must surface as an error — so ISR keeps serving the last good
 * page — never as invented salons, ratings and reviews indexed under our name.
 * `USE_MOCK=1` re-enables it for an offline production build on a laptop.
 */
export const mockAllowed = () => process.env.NODE_ENV !== "production" || process.env.USE_MOCK === "1"
