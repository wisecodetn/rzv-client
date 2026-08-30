import { NextResponse } from "next/server"

/** BFF proxy for customer auth: browser ↔ (same-origin) Next ↔ NestJS. Keeps the
 *  auth cookies first-party on the client origin (no CORS / third-party-cookie
 *  issues) — Set-Cookie from the API is forwarded to the browser, and the
 *  browser's cookies are forwarded back to the API on every call. */
const BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
const ALLOWED = new Set(["register", "login", "logout", "me", "refresh", "forgot", "reset", "google", "verify-email", "resend-verification"])

async function proxy(req, { params }) {
  const { path } = await params
  const action = (path || []).join("/")
  if (!ALLOWED.has(action)) return NextResponse.json({ message: "Introuvable." }, { status: 404 })

  const init = {
    method: req.method,
    headers: { "content-type": "application/json", cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  }
  if (req.method !== "GET") init.body = await req.text()

  let res
  let refreshed = []
  try {
    res = await fetch(`${BASE}/client/auth/${action}`, init)
    // Bootstrap in ONE round-trip: if `me` 401s only because the 15-min access
    // token expired, rotate here and retry instead of making the browser do
    // me → refresh → me on every page load.
    if (action === "me" && res.status === 401 && init.headers.cookie.includes("rzv_client_refresh")) {
      const rr = await fetch(`${BASE}/client/auth/refresh`, {
        method: "POST",
        headers: { cookie: init.headers.cookie },
        cache: "no-store",
      })
      if (rr.ok) {
        refreshed = rr.headers.getSetCookie?.() || []
        const jar = mergeCookies(init.headers.cookie, refreshed)
        res = await fetch(`${BASE}/client/auth/me`, { ...init, headers: { ...init.headers, cookie: jar } })
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

export { proxy as GET, proxy as POST, proxy as PATCH }
