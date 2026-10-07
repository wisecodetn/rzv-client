import { NextResponse } from "next/server"
import { forwardedFor, readBody, rejectCrossSite, safeSegments, upstreamSignal } from "@/lib/bff"

/** BFF proxy for the customer account area (bookings / favorites / overview).
 *  Same-origin like /api/auth: cookies forwarded both ways, no CORS. On a 401
 *  it transparently refreshes the session (rotating token) and retries once, so
 *  a page left open past the 15-min access-token lifetime keeps working. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
const ALLOWED_ROOTS = new Set(["bookings", "favorites", "overview", "support", "waitlist", "memberships"])

/** Concurrent 401s (overview + favorites + bookings on one page load) must share
 *  ONE refresh call — the refresh token is single-use, so parallel refreshes
 *  would race. Keyed on globalThis to survive per-route bundling. */
const inflightRefresh = (globalThis.__rzvClientRefresh ??= new Map())
const refreshSession = (cookie) => {
  const token = /rzv_client_refresh=([^;]+)/.exec(cookie)?.[1] || ""
  if (!inflightRefresh.has(token)) {
    const p = fetch(`${BASE}/client/auth/refresh`, { method: "POST", headers: { cookie }, cache: "no-store", signal: upstreamSignal() })
      .then((rr) => (rr.ok ? rr.headers.getSetCookie?.() || [] : []))
      .catch(() => [])
    inflightRefresh.set(token, p)
    p.finally(() => setTimeout(() => inflightRefresh.delete(token), 10_000))
  }
  return inflightRefresh.get(token)
}

const mergeCookies = (cookieHeader, setCookies) => {
  const jar = new Map()
  for (const kv of (cookieHeader || "").split(";").map((s) => s.trim()).filter(Boolean)) {
    const i = kv.indexOf("=")
    if (i > 0) jar.set(kv.slice(0, i), kv.slice(i + 1))
  }
  for (const sc of setCookies) {
    const first = sc.split(";")[0]
    const i = first.indexOf("=")
    if (i > 0) jar.set(first.slice(0, i).trim(), first.slice(i + 1))
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ")
}

async function proxy(req, { params }) {
  const blocked = rejectCrossSite(req)
  if (blocked) return blocked
  const { path } = await params
  // Only the allow-listed roots, and no "."/".." segment that could climb out
  // of /client/<root> once the upstream URL is normalised.
  const parts = safeSegments(path)
  if (!parts || !ALLOWED_ROOTS.has(parts[0])) return NextResponse.json({ message: "Introuvable." }, { status: 404 })

  const target = `${BASE}/client/${parts.map(encodeURIComponent).join("/")}`
  const cookie = req.headers.get("cookie") || ""
  let body
  if (req.method !== "GET") {
    const read = await readBody(req)
    if (read.error) return read.error
    body = read.text
  }
  const doFetch = (cookieHeader) =>
    fetch(target, {
      method: req.method,
      headers: { "content-type": "application/json", cookie: cookieHeader, ...forwardedFor(req) },
      body,
      cache: "no-store",
      signal: upstreamSignal(),
    })

  let res
  let refreshedCookies = []
  try {
    res = await doFetch(cookie)
    if (res.status === 401 && cookie.includes("rzv_client_refresh")) {
      // Access token expired → rotate the refresh token (deduped) and retry once.
      refreshedCookies = await refreshSession(cookie)
      if (refreshedCookies.length) res = await doFetch(mergeCookies(cookie, refreshedCookies))
    }
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible.", code: "account/api-down" }, { status: 503 })
  }

  const resBody = await res.text()
  const out = new NextResponse(resBody || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  })
  // Hand the browser the rotated session cookies + anything the API set.
  for (const c of refreshedCookies) out.headers.append("set-cookie", c)
  for (const c of res.headers.getSetCookie?.() || []) out.headers.append("set-cookie", c)
  return out
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE }
