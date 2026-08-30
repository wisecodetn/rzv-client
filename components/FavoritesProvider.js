"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"

/* Server-backed favorites (per account, via /api/account/favorites). Guests have
   none — FavButton routes them to /connexion. Toggles are optimistic; the server
   response (full salon cards) is the source of truth. */
const FavCtx = createContext(null)

export function FavoritesProvider({ children }) {
  const { user, ready: authReady } = useAuth()
  const [salons, setSalons] = useState([]) // [{slug,name,kind,city,rate,rev,from}]
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!authReady) return
    if (!user) { setSalons([]); setReady(true); return }
    let alive = true
    fetch("/api/account/favorites")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (alive) setSalons(Array.isArray(list) ? list : []) })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [user, authReady])

  const favs = salons.map((s) => s.slug)

  const mutate = useCallback(async (slug, method) => {
    // Optimistic: flip locally, then reconcile with the server's list.
    setSalons((cur) => (method === "DELETE" ? cur.filter((s) => s.slug !== slug) : cur.some((s) => s.slug === slug) ? cur : [{ slug }, ...cur]))
    try {
      const r = await fetch(`/api/account/favorites/${encodeURIComponent(slug)}`, { method })
      if (r.ok) setSalons(await r.json())
    } catch { /* keep optimistic state; next load reconciles */ }
  }, [])

  const isFav = useCallback((slug) => favs.includes(slug), [favs])
  const toggleFav = useCallback((slug) => mutate(slug, favs.includes(slug) ? "DELETE" : "PUT"), [favs, mutate])
  const removeFav = useCallback((slug) => mutate(slug, "DELETE"), [mutate])

  return (
    <FavCtx.Provider value={{ favs, salons, ready, isFav, toggleFav, removeFav, count: favs.length }}>
      {children}
    </FavCtx.Provider>
  )
}

export const useFavorites = () =>
  useContext(FavCtx) || { favs: [], salons: [], ready: false, isFav: () => false, toggleFav: () => {}, removeFav: () => {}, count: 0 }
