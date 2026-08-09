"use client"
import { createContext, useContext, useMemo } from "react"

/** Catalog (categories + cities) fetched once server-side (root layout) and made
 *  available to client components — Navbar, Footer, SearchForm, CityView — that
 *  used to import the static arrays. Exposes the same sync helpers those files
 *  relied on (getCategory / categoryChildren / categoryParent / getCity). */
const CatalogContext = createContext(null)

export function CatalogProvider({ value, children }) {
  const api = useMemo(() => {
    const nodeBySlug = value?.nodeBySlug || {}
    const cities = value?.cities || []
    return {
      categories: value?.categories || [],
      cities,
      allCategories: Object.values(nodeBySlug),
      nodeBySlug,
      getCategory: (slug) => nodeBySlug[slug] || null,
      categoryChildren: (slug) => (nodeBySlug[slug]?.childrenSlugs || []).map((s) => nodeBySlug[s]).filter(Boolean),
      categoryParent: (slug) => { const p = nodeBySlug[slug]?.parentSlug; return p ? nodeBySlug[p] : null },
      getCity: (slug) => cities.find((c) => c.slug === slug) || null,
    }
  }, [value])
  return <CatalogContext.Provider value={api}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error("useCatalog must be used within <CatalogProvider>")
  return ctx
}
