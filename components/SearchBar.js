"use client"
import { useEffect, useRef, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCatalog } from "./CatalogProvider"

const EMPTY = { cats: [], subs: [], estabs: [] }

export default function SearchBar() {
  const router = useRouter()
  const { categories, cities } = useCatalog()

  const [q, setQ] = useState("")
  const [ville, setVille] = useState("")
  const [qOpen, setQOpen] = useState(false)
  const [villeOpen, setVilleOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)   // slug chosen from dropdown, if any
  const [selectedCity, setSelectedCity] = useState(null) // slug chosen from dropdown, if any

  // Typed search hits the backend suggest index (categories / prestations /
  // établissements, 4/8/5 budget). Debounced; per-session query cache avoids
  // refetching keystrokes already answered; stale results stay visible while
  // the next response arrives (no flicker).
  const [searchResults, setSearchResults] = useState(EMPTY)
  const suggestCache = useRef(new Map())
  useEffect(() => {
    const term = q.trim()
    if (!qOpen || !term) { setSearchResults(EMPTY); return }
    const key = term.toLowerCase()
    const hit = suggestCache.current.get(key)
    if (hit) { setSearchResults(hit); return }
    let alive = true
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`)
        .then((r) => (r.ok ? r.json() : EMPTY))
        .then((d) => {
          if (!alive) return
          const v = { cats: d.cats || [], subs: d.subs || [], estabs: d.estabs || [] }
          suggestCache.current.set(key, v)
          if (suggestCache.current.size > 100) suggestCache.current.delete(suggestCache.current.keys().next().value)
          setSearchResults(v)
        })
        .catch(() => {})
    }, 200)
    return () => { alive = false; clearTimeout(t) }
  }, [q, qOpen])

  // ---- results for the "Où ?" field ----
  const cityOpts = useMemo(() => {
    const term = ville.trim().toLowerCase()
    if (!term) return cities
    return cities.filter((c) => c.name.toLowerCase().includes(term))
  }, [ville, cities])

  const pickCategory = (node) => {
    setSelectedCat(node.slug)
    setQ(node.name)
    setQOpen(false)
  }
  const pickEstab = (slug) => {
    setQOpen(false)
    router.push(`/salon/${slug}`)
  }
  const pickCity = (c) => {
    setSelectedCity(c.slug)
    setVille(c.name)
    setVilleOpen(false)
  }

  const go = () => {
    // If a known category and/or city were picked from the dropdowns, prefer the clean route.
    if (selectedCat && selectedCity) return router.push(`/${selectedCat}/${selectedCity}`)
    if (selectedCat) return router.push(`/${selectedCat}`)

    const p = new URLSearchParams()
    if (q.trim()) p.set("q", q.trim())
    if (ville.trim()) p.set("ville", ville.trim())
    router.push("/recherche" + (p.toString() ? `?${p}` : ""))
  }
  const onKey = (e) => e.key === "Enter" && go()

  const clearQ = () => { setQ(""); setSelectedCat(null) }
  const clearVille = () => { setVille(""); setSelectedCity(null) }

  const label = { position: "absolute", top: -8, left: 13, background: "var(--bg)", padding: "0 5px", fontSize: 11.5, color: "var(--muted-2)", fontWeight: 500, zIndex: 2 }
  const box = (focused) => ({
    display: "flex", alignItems: "center", gap: 10,
    border: `1px solid ${focused ? "var(--gold)" : "var(--line-strong)"}`,
    borderRadius: 10, padding: "13px 14px", background: "var(--card)",
  })
  const inp = { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "var(--ink)", padding: 0 }
  const secLabel = { fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px 3px" }
  const dropdown = {
  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
  maxHeight: 340, overflowY: "auto",
  background: "var(--card)", border: "1px solid var(--line-2)",
  borderRadius: 12, boxShadow: "0 18px 44px var(--shadow-strong)",
  zIndex: 20, paddingBottom: 6,
}

  const Ico = ({ t }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {t === "cat" && <path d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" />}
      {t === "sub" && <path d="M12 3l2.1 4.6L19 8.3l-3.5 3.3.9 4.9L12 14.9 7.6 16.5l.9-4.9L5 8.3l4.9-.7z" />}
      {t === "est" && <path d="M3 9l1-5h16l1 5 M4 9v11h16V9 M9 20v-6h6v6" />}
      {t === "city" && <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />}
    </svg>
  )
  const Row = ({ t, label: l, sub, onClick }) => (
    <div onClick={onClick} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(0,0,0,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ico t={t} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</div>}
      </div>
    </div>
  )

  const { cats, subs, estabs } = searchResults
  const qHasResults = cats.length || subs.length || estabs.length

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap", maxWidth: 680, pointerEvents: "auto" }}>
      {/* ---- Que cherchez-vous ? ---- */}
      <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
        <div style={label}>Que cherchez-vous ?</div>
        <div style={box(qOpen)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setSelectedCat(null); setQOpen(true) }}
            onFocus={(e) => { setQOpen(true); setVilleOpen(false); e.target.select() }}
            onKeyDown={onKey}
            placeholder="Ex. balayage, coupe homme…"
            style={inp}
          />
          {q ? <span onClick={clearQ} style={{ cursor: "pointer", color: "var(--muted)", fontSize: 15, lineHeight: 1 }}>×</span> : null}
        </div>
        {qOpen && (
          <>
            <div onClick={() => setQOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
            <div className="autocomplete-scroll" style={dropdown}>
              {!q.trim() ? (
                // On focus, before typing: the categories (already loaded with the site).
                <>
                  <div style={secLabel}>Catégories</div>
                  {categories.map((c) => <Row key={c.slug} t="cat" label={c.name} sub="Catégorie" onClick={() => pickCategory(c)} />)}
                </>
              ) : !qHasResults ? (
                <div style={{ padding: "14px", fontSize: 12.5, color: "var(--muted)" }}>Aucun résultat pour « {q.trim()} ».</div>
              ) : (
                <>
                  {cats.length > 0 && <><div style={secLabel}>Catégories</div>{cats.map((c) => <Row key={c.slug} t="cat" label={c.name} sub="Catégorie" onClick={() => pickCategory(c)} />)}</>}
                  {subs.length > 0 && <><div style={secLabel}>Prestations</div>{subs.map((n) => <Row key={n.slug} t="sub" label={n.name} sub={n.topName} onClick={() => pickCategory(n)} />)}</>}
                  {estabs.length > 0 && <><div style={secLabel}>Établissements</div>{estabs.map((s) => <Row key={s.slug} t="est" label={s.name} sub={s.sub || "Salon"} onClick={() => pickEstab(s.slug)} />)}</>}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ---- Où ? ---- */}
      <div style={{ position: "relative", flex: 1, minWidth: 150 }}>
        <div style={label}>Où ?</div>
        <div style={box(villeOpen)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </svg>
          <input
            value={ville}
            onChange={(e) => { setVille(e.target.value); setSelectedCity(null); setVilleOpen(true) }}
            onFocus={(e) => { setVilleOpen(true); setQOpen(false); e.target.select() }}
            onKeyDown={onKey}
            placeholder="Ex. La Marsa"
            style={inp}
          />
          {ville ? <span onClick={clearVille} style={{ cursor: "pointer", color: "var(--muted)", fontSize: 15, lineHeight: 1 }}>×</span> : null}
        </div>
        {villeOpen && (
          <>
            <div onClick={() => setVilleOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
            <div className="autocomplete-scroll" style={{ ...dropdown, maxHeight: 280 }}>
              {cityOpts.length === 0 ? (
                <div style={{ padding: "14px", fontSize: 12.5, color: "var(--muted)" }}>Aucune ville trouvée.</div>
              ) : (
                cityOpts.map((c) => <Row key={c.slug} t="city" label={c.name} sub={c.total ? `${c.total} salons` : undefined} onClick={() => pickCity(c)} />)
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={go}
        className="btn-gold"
        style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 10, padding: "0 22px", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", flex: "none" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" />
        </svg>
        Rechercher
      </button>
    </div>
  )
}