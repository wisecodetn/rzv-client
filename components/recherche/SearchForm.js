"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCatalog } from "@/components/CatalogProvider"

const RATES = [[0, "Toutes les notes"], [4, "4 et +"], [4.5, "4,5 et +"]]
const DISPOS = [["", "Peu importe"], ["today", "Disponible aujourd'hui"]]
const SORTS = [["note", "Mieux notés"], ["avis", "Plus d'avis"], ["prixA", "Prix croissant"], ["prixD", "Prix décroissant"], ["dispo", "Disponibilité"]]

const sel = { background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "var(--ink)", outline: "none", cursor: "pointer", minWidth: 0 }
const lab = { fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5, display: "block" }

export default function SearchForm({ initial }) {
  const router = useRouter()
  const { categories, cities } = useCatalog()
  const [q, setQ] = useState(initial.q || "")
  const [city, setCity] = useState(initial.city || "")
  const [category, setCategory] = useState(initial.category || "")
  const [rate, setRate] = useState(String(initial.rate || 0))
  const [dispo, setDispo] = useState(initial.dispo || "")
  const [sort, setSort] = useState(initial.sort || "note")
  // Phones: the filters fold away behind a button (desktop always shows them).
  const [showFilters, setShowFilters] = useState(false)

  const dirty = q.trim() || city || category || Number(rate) || dispo || sort !== "note"
  const activeFilters = [city, category, Number(rate), dispo, sort !== "note"].filter(Boolean).length

  const submit = (e) => {
    e.preventDefault()
    // City-only search → the clean, indexable path /recherche/<ville>.
    if (city && !q.trim() && !category && !Number(rate) && !dispo && sort === "note") {
      router.push(`/recherche/${city}`)
      return
    }
    const p = new URLSearchParams()
    if (q.trim()) p.set("q", q.trim())
    if (city) p.set("city", city)
    if (category) p.set("cat", category)
    if (Number(rate)) p.set("rate", rate)
    if (dispo) p.set("dispo", dispo)
    if (sort !== "note") p.set("sort", sort)
    const qs = p.toString()
    router.push("/recherche" + (qs ? `?${qs}` : ""))
  }

  const reset = (e) => {
    e.preventDefault()
    setQ(""); setCity(""); setCategory(""); setRate("0"); setDispo(""); setSort("note")
    router.push("/recherche")
  }

  return (
    <form onSubmit={submit} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "16px 18px", marginTop: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "12px 14px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
          <input className="shell-input" aria-label="Prestation, salon ou catégorie" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Prestation, salon, catégorie… (ex. balayage, barbier)" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 14.5, color: "var(--ink)", padding: 0 }} />
        </div>
        <button type="submit" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 12, padding: "13px 26px", display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", flex: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
          Rechercher
        </button>
        {dirty && (
          <button type="button" onClick={reset} style={{ background: "var(--card)", color: "var(--muted)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "13px 18px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", flex: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5" /></svg>
            Réinitialiser
          </button>
        )}
      </div>

      <button
        type="button"
        className="search-filters-toggle"
        onClick={() => setShowFilters((v) => !v)}
        aria-expanded={showFilters}
        aria-controls="search-filters"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 5h18 M6 12h12 M10 19h4" /></svg>
        Filtres{activeFilters ? ` (${activeFilters})` : ""}
        <span style={{ marginLeft: "auto", fontSize: 12 }} aria-hidden="true">{showFilters ? "▲" : "▼"}</span>
      </button>

      <div id="search-filters" className={`search-filters ${showFilters ? "" : "is-collapsed"}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 14 }}>
        {/* A native select, like the filters beside it: keyboard and screen
            readers work as everywhere else, and nothing typed is silently
            ignored (the custom dropdown did both wrong). */}
        <label><span style={lab}>Ville</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={{ ...sel, width: "100%" }}>
            <option value="">Toutes les villes</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label><span style={lab}>Catégorie</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...sel, width: "100%" }}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label><span style={lab}>Note minimale</span>
          <select value={rate} onChange={(e) => setRate(e.target.value)} style={{ ...sel, width: "100%" }}>
            {RATES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label><span style={lab}>Disponibilité</span>
          <select value={dispo} onChange={(e) => setDispo(e.target.value)} style={{ ...sel, width: "100%" }}>
            {DISPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label><span style={lab}>Trier par</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...sel, width: "100%" }}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
    </form>
  )
}
