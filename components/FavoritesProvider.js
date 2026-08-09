"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

/* Favorite salons, persisted in localStorage (per browser for the mock).
   Seeds a couple on first visit so the demo isn't empty. */
const FavCtx = createContext(null)
const KEY = "rezervy_favs"
const SEED = ["maison-yasmine-beaute-spa", "l-atelier-du-cheveu"]

export function FavoritesProvider({ children }) {
  const [favs, setFavs] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw !== null) setFavs(JSON.parse(raw))
      else { setFavs(SEED); localStorage.setItem(KEY, JSON.stringify(SEED)) }
    } catch {}
    setReady(true)
  }, [])

  const save = useCallback((arr) => {
    setFavs(arr)
    try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {}
  }, [])

  const isFav = useCallback((slug) => favs.includes(slug), [favs])
  const toggleFav = useCallback((slug) => save(favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug]), [favs, save])
  const removeFav = useCallback((slug) => save(favs.filter((s) => s !== slug)), [favs, save])

  return (
    <FavCtx.Provider value={{ favs, ready, isFav, toggleFav, removeFav, count: favs.length }}>
      {children}
    </FavCtx.Provider>
  )
}

export const useFavorites = () =>
  useContext(FavCtx) || { favs: [], ready: false, isFav: () => false, toggleFav: () => {}, removeFav: () => {}, count: 0 }
