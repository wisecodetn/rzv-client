"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

/* Real customer auth. Sessions are httpOnly cookies set by the API and proxied
   same-origin through /api/auth/* (see app/api/auth/[...path]/route.js) — no
   tokens in JS, nothing sensitive in localStorage. On load we resolve the
   session via /me (with one refresh retry), so login state survives reloads. */
const AuthCtx = createContext(null)

export const initialsOf = (name) =>
  (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"

const api = async (action, { method = "POST", body } = {}) => {
  const res = await fetch(`/api/auth/${action}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const e = new Error(data?.message || "Une erreur est survenue. Réessayez.")
    e.code = data?.code
    e.status = res.status
    throw e
  }
  return data
}

/* Google Identity Services loader (once). Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID. */
let gisPromise = null
const loadGis = () => {
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"))
    if (window.google?.accounts?.oauth2) return resolve()
    const s = document.createElement("script")
    s.src = "https://accounts.google.com/gsi/client"
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { gisPromise = null; reject(new Error("Impossible de charger Google.")) }
    document.head.appendChild(s)
  })
  return gisPromise
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Session bootstrap — a single request: the /api/auth/me proxy refreshes an
  // expired access token server-side, so anonymous visitors cost one 401 and
  // returning users one 200 (instead of me → refresh → me on every page).
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const u = await api("me", { method: "GET" })
        if (alive) setUser(u)
      } catch { /* not logged in */ }
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const u = await api("login", { body: { email, password } })
    setUser(u)
    return u
  }, [])

  /** Registration is pending until the emailed code is confirmed — no session yet. */
  const register = useCallback(async ({ name, email, password, phone }) => {
    return api("register", { body: { name, email, password, phone } }) // { pending, email }
  }, [])

  const verifyEmail = useCallback(async ({ email, code }) => {
    const u = await api("verify-email", { body: { email, code } })
    setUser(u)
    return u
  }, [])

  const resendVerification = useCallback(async (email) => api("resend-verification", { body: { email } }), [])

  /* Real Google OAuth (token flow): GIS popup → access token → verified server-side. */
  const googleAuth = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) throw new Error("Connexion Google non configurée pour le moment.")
    await loadGis()
    const accessToken = await new Promise((resolve, reject) => {
      try {
        const tc = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: (r) => (r && r.access_token ? resolve(r.access_token) : reject(new Error("Connexion Google annulée."))),
          error_callback: () => reject(new Error("Connexion Google annulée.")),
        })
        tc.requestAccessToken()
      } catch {
        reject(new Error("Connexion Google indisponible."))
      }
    })
    const u = await api("google", { body: { accessToken } })
    setUser(u)
    return u
  }, [])

  /** Update profile (name/phone are persisted; email changes need verification — later). */
  const updateUser = useCallback(async (patch) => {
    const body = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.phone !== undefined) body.phone = patch.phone
    if (!Object.keys(body).length) return
    const u = await api("me", { method: "PATCH", body })
    setUser(u)
    return u
  }, [])

  const forgotPassword = useCallback(async (email) => api("forgot", { body: { email } }), [])
  const resetPassword = useCallback(async ({ email, code, password }) => api("reset", { body: { email, code, password } }), [])

  const logout = useCallback(async () => {
    try { await api("logout") } catch { /* clear locally regardless */ }
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, verifyEmail, resendVerification, googleAuth, logout, updateUser, forgotPassword, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx) || { ready: false, user: null }
