import { NextResponse } from "next/server"
import { forwardedFor, readBody, rejectCrossSite, upstreamSignal } from "@/lib/bff"

/** BFF proxy for customer auth: browser ↔ (same-origin) Next ↔ NestJS. Keeps the
 *  auth cookies first-party on the client origin (no CORS / third-party-cookie
 *  issues) — Set-Cookie from the API is forwarded to the browser, and the
 *  browser's cookies are forwarded back to the API on every call. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
const ALLOWED = new Set(["register", "login", "logout", "me", "refresh", "forgot", "reset", "google", "verify-email", "resend-verification", "account"])
/** Calls made with a session: a 401 there may only mean the 15-minute access
 *  token expired, so the session is refreshed and the call retried once. */
const SESSION_CALLS = new Set(["me", "account"])

async function proxy(req, { params }) {
  const blocked = rejectCrossSite(req)
  if (blocked) return blocked
  const { path } = await params
  const action = (path || []).join("/")
  if (!ALLOWED.has(action)) return NextResponse.json({ message: "Introuvable." }, { status: 404 })

  const cookie = req.headers.get("cookie") || ""
  // Every page asks "who is signed in?". Without a session cookie the answer
  // is known here — no need to ask the API on every anonymous page view.
  if (action === "me" && req.method === "GET" && !/rzv_client_(access|refresh)=/.test(cookie)) {
    return NextResponse.json({ message: "Non connecté.", code: "auth/unauthenticated" }, { status: 401 })
  }

  const init = {
    method: req.method,
    headers: { "content-type": "application/json", cookie, ...forwardedFor(req) },
    cache: "no-store",
    signal: upstreamSignal(),
  }
  if (req.method !== "GET") {
    const { text, error } = await readBody(req)
    if (error) return error
    init.body = text
  }

  let res
  let refreshed = []
  try {
    res = await fetch(`${BASE}/client/auth/${action}`, init)
    // Bootstrap in ONE round-trip: if `me` 401s only because the 15-min access
    // token expired, rotate here and retry instead of making the browser do
    // me → refresh → me on every page load. Same for the profile edit and the
    // account deletion, which a page left open would otherwise see fail.
    if (SESSION_CALLS.has(action) && res.status === 401 && init.headers.cookie.includes("rzv_client_refresh")) {
      const rr = await fetch(`${BASE}/client/auth/refresh`, {
        method: "POST",
        headers: { cookie: init.headers.cookie },
        cache: "no-store",
        signal: upstreamSignal(),
      })
      if (rr.ok) {
        refreshed = rr.headers.getSetCookie?.() || []
        const jar = mergeCookies(init.headers.cookie, refreshed)
        res = await fetch(`${BASE}/client/auth/${action}`, { ...init, headers: { ...init.headers, cookie: jar }, signal: upstreamSignal() })
      }
    }
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible.", code: "auth/api-down" }, { status: 503 })
  }

  const body = await res.text()
  const out = new NextResponse(body || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  })
  for (const c of refreshed) out.headers.append("set-cookie", c)
  for (const c of res.headers.getSetCookie?.() || []) out.headers.append("set-cookie", c)
  return out
}

/** Overlay Set-Cookie values onto an existing Cookie header. */
function mergeCookies(cookieHeader, setCookies) {
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

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE }
