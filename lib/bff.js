/**
 * Guards shared by the same-origin API proxies in app/api (the "BFF"). They
 * forward the visitor's session cookies to the API, so they are worth
 * protecting the way the API itself is.
 */
import { NextResponse } from "next/server"

/** Upstream calls must not hang a route forever (the assistant's stream excepted). */
export const UPSTREAM_TIMEOUT_MS = Number(process.env.BFF_TIMEOUT_MS || 15000)
export const upstreamSignal = () => AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)

/**
 * A write (POST/PUT/PATCH/DELETE) must come from our own pages. Cookies ride
 * along with any request the browser makes, so without this another site could
 * post a form here (text/plain needs no CORS preflight, and the proxy re-sends
 * it upstream as JSON) and act with the visitor's session. Browsers say where a
 * request comes from: Sec-Fetch-Site, else Origin. A client that sends neither
 * (curl, server-to-server) carries no browser cookies to abuse.
 * Returns a 403 response to send back, or null when the request may proceed.
 */
export function rejectCrossSite(req) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return null
  const site = req.headers.get("sec-fetch-site")
  if (site) return site === "same-origin" || site === "none" ? null : forbidden()
  const origin = req.headers.get("origin")
  if (!origin) return null
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  try {
    return new URL(origin).host === host ? null : forbidden()
  } catch {
    return forbidden()
  }
}

const forbidden = () => NextResponse.json({ message: "Requête refusée.", code: "bff/cross-site" }, { status: 403 })

/** Every form this site posts fits in a few kilobytes; the assistant's history in more. */
export const MAX_BODY_BYTES = 64 * 1024

/**
 * The request body as text, read up to `max` bytes. Content-Length can be
 * missing or wrong, so the stream itself is counted: a 1 GB post is refused
 * after 64 KB, not buffered into memory and forwarded.
 * Returns { text } or { error } — a 413 response to send back.
 */
export async function readBody(req, max = MAX_BODY_BYTES) {
  if (Number(req.headers.get("content-length") || 0) > max) return { error: tooLarge() }
  const reader = req.body?.getReader()
  if (!reader) return { text: "" }
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > max) {
      await reader.cancel().catch(() => {})
      return { error: tooLarge() }
    }
    chunks.push(value)
  }
  return { text: Buffer.concat(chunks).toString("utf8") }
}

/** Same, parsed as JSON: { json } or { error } (413, or 400 when it isn't JSON). */
export async function readJson(req, max = MAX_BODY_BYTES) {
  const { text, error } = await readBody(req, max)
  if (error) return { error }
  try {
    return { json: JSON.parse(text) }
  } catch {
    return { error: NextResponse.json({ message: "Requête invalide." }, { status: 400 }) }
  }
}

const tooLarge = () => NextResponse.json({ message: "Requête trop volumineuse.", code: "bff/too-large" }, { status: 413 })

/**
 * The visitor's address for the API's rate limits. Every call reaches the API
 * from this server, so without it all visitors would share one budget — and
 * one person retrying would lock everybody out.
 */
export function forwardedFor(req) {
  const fwd = req.headers.get("x-forwarded-for")
  return fwd ? { "x-forwarded-for": fwd } : {}
}

/**
 * Path segments taken from a catch-all route, safe to splice into an upstream
 * URL: no empty, "." or ".." segment and no slash of any kind — otherwise
 * `bookings/../../admin/x` would leave the allow-listed prefix once the URL is
 * normalised. Returns null when any segment is unsafe.
 */
export function safeSegments(parts) {
  if (!Array.isArray(parts) || !parts.length) return null
  for (const p of parts) {
    if (typeof p !== "string" || !p || p === "." || p === ".." || /[\\/]/.test(p)) return null
  }
  return parts
}
