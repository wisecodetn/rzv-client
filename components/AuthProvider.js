"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

/* Client-side mock auth. Persists a session in localStorage so the whole app
   reflects login state. Structured so the async methods can later call a real
   API / OAuth (see googleAuth) without changing consumers. */
const AuthCtx = createContext(null)
const KEY = "rezervy_user"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const validEmail = (e) => /^\S+@\S+\.\S+$/.test(e || "")
export const initialsOf = (name) =>
  (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"
const titleCase = (s) => s.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setUser(JSON.parse(raw)) } catch {}
    setReady(true)
  }, [])

  const persist = useCallback((u) => {
    setUser(u)
    try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY) } catch {}
  }, [])

  const login = useCallback(async ({ email, password }) => {
    await wait(600)
    if (!validEmail(email)) throw new Error("Adresse e-mail invalide.")
    if (!password || password.length < 6) throw new Error("E-mail ou mot de passe incorrect.")
    const name = titleCase(email.split("@")[0])
    const u = { name, email: email.trim().toLowerCase(), phone: "", initials: initialsOf(name), provider: "email" }
    persist(u)
    return u
  }, [persist])

  const register = useCallback(async ({ name, email, password, phone }) => {
    await wait(700)
    if (!name || !name.trim()) throw new Error("Indiquez votre nom complet.")
    if (!validEmail(email)) throw new Error("Adresse e-mail invalide.")
    if (!password || password.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères.")
    const u = { name: name.trim(), email: email.trim().toLowerCase(), phone: (phone || "").trim(), initials: initialsOf(name), provider: "email" }
    persist(u)
    return u
  }, [persist])

  // Mock Google OAuth. A real flow would redirect to Google (e.g. Auth.js
  // signIn("google")) and read the returned profile; here we simulate it.
  const googleAuth = useCallback(async () => {
    await wait(800)
    const u = { name: "Ines Bouazizi", email: "ines.bouazizi@gmail.com", phone: "", initials: "IB", provider: "google" }
    persist(u)
    return u
  }, [persist])

  const updateUser = useCallback((patch) => {
    setUser((u) => {
      if (!u) return u
      const nu = { ...u, ...patch }
      if (patch.name) nu.initials = initialsOf(patch.name)
      try { localStorage.setItem(KEY, JSON.stringify(nu)) } catch {}
      return nu
    })
  }, [])

  const logout = useCallback(() => persist(null), [persist])

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, googleAuth, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx) || { ready: false, user: null }
