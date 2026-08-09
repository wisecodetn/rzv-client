"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Photo from "./Photo"
import SalonMap from "./SalonMap"
import FavButton from "./FavButton"
import { useCatalog } from "./CatalogProvider"

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n)
const DISTS = ["1,2 km", "2,4 km", "3,1 km", "4,0 km", "5,3 km"]
const SORTS = [
  { k: "note", l: "Mieux notés" },
  { k: "avis", l: "Plus d'avis" },
  { k: "prixA", l: "Prix croissant" },
  { k: "prixD", l: "Prix décroissant" },
  { k: "dispo", l: "Disponibilité" },
]
// One option per metric (single-select). "Date précise" reveals the calendar.
const FILT_METRICS = [
  { key: "dispo", label: "Disponibilité", opts: [["any", "Toutes"], ["today", "Aujourd'hui"], ["tmrw", "Demain"], ["wkend", "Ce week-end"], ["week", "Cette semaine"], ["date", "Date précise"]] },
  { key: "note", label: "Note minimale", opts: [[0, "Toutes"], [4, "4 et +"], [4.5, "4,5 et +"]] },
  { key: "budget", label: "Budget", opts: [["any", "Tous les prix"], ["lo", "Moins de 25 TND"], ["mid", "25 – 35 TND"]] },
]
const DEFAULTS = { dispo: "any", date: null, note: 0, budget: "any", sort: "note" }

/* Mini month calendar for the "Date précise" option. */
function DateCal({ value, onPick }) {
  const [ym, setYm] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
  const startWd = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7
  const iso = (d) => `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  const label = new Date(ym.y, ym.m, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  const cells = []
  for (let i = 0; i < startWd; i++) cells.push(null)
  for (let d = 1; d <= daysIn; d++) cells.push(d)
  const nav = (delta) => setYm(({ y, m }) => { const nm = m + delta; if (nm < 0) return { y: y - 1, m: 11 }; if (nm > 11) return { y: y + 1, m: 0 }; return { y, m: nm } })
  const navBtn = { width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }
  const canPrev = new Date(ym.y, ym.m, 1) > today
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={() => nav(-1)} disabled={!canPrev} style={{ ...navBtn, opacity: canPrev ? 1 : 0.4 }}>‹</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 700, textTransform: "capitalize", color: "var(--ink)" }}>{label}</div>
        <button onClick={() => nav(1)} style={navBtn}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, fontSize: 10, color: "var(--faint)", fontWeight: 800, textAlign: "center", marginBottom: 3 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = new Date(ym.y, ym.m, d) < today
          const on = value === iso(d)
          return (
            <button key={i} disabled={past} onClick={() => onPick(iso(d))} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, padding: "6px 0", borderRadius: 8, border: "none", cursor: past ? "default" : "pointer", background: on ? "var(--gold)" : "transparent", color: past ? "var(--faint)" : (on ? "#FDF8EF" : "var(--ink)") }}>{d}</button>
          )
        })}
      </div>
    </div>
  )
}

function Pagination({ pageNow, pagesTotal, apiMode, basePath, onPage }) {
  if (pagesTotal <= 1) return null
  const nums = []
  for (let i = 1; i <= pagesTotal; i++) nums.push(i)
  const href = (n) => (n === 1 ? basePath : `${basePath}/page-${n}`)
  const base = { minWidth: 36, height: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, padding: "0 10px", border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", textDecoration: "none" }
  const activeStyle = { ...base, background: "var(--gold)", color: "#FDF8EF", border: "1px solid var(--gold)" }
  const disabledStyle = { ...base, opacity: 0.4, cursor: "default" }
  const Cell = ({ n, children, active, disabled }) => {
    if (disabled) return <span style={disabledStyle}>{children}</span>
    const st = active ? activeStyle : base
    if (apiMode) return <button onClick={() => onPage(n)} style={st}>{children}</button>
    return <Link href={href(n)} style={st} className="lift">{children}</Link>
  }
  return (
    <nav aria-label="Pagination" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
      <Cell n={pageNow - 1} disabled={pageNow <= 1}>‹ Précédent</Cell>
      {nums.map((n) => <Cell key={n} n={n} active={n === pageNow}>{n}</Cell>)}
      <Cell n={pageNow + 1} disabled={pageNow >= pagesTotal}>Suivant ›</Cell>
    </nav>
  )
}

/* One salon result card — responsive (photo stacks on top on phones) */
function SalonRow({ s, dist }) {
  const [tab, setTab] = useState(null)
  const top = s.serviceGroups.flatMap((g) => g.rows).slice(0, 3)
  return (
    <div className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
      <div className="salon-top">
        <div className="salon-photo" style={{ position: "relative" }}><Photo label={`Photo — ${s.name}`} /><FavButton slug={s.slug} variant="icon" size={34} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <Link href={`/salon/${s.slug}`} style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>{s.name}</Link>
            <span style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>★ {s.rate}</span> <span style={{ fontSize: 12, color: "var(--faint)" }}>({s.rev})</span></span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{s.address} · {dist}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
            {s.tags.slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, background: "var(--surface-2)", color: "var(--muted-2)", borderRadius: 999, padding: "3px 10px" }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>dès <span style={{ fontWeight: 800, color: "var(--ink)" }}>{s.from} TND</span></span>
            <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "3px 9px", background: s.avail ? "rgba(62,142,117,0.12)" : "rgba(201,162,39,0.13)", color: s.avail ? "var(--green)" : "#8A6A17" }}>{s.slotLabel}</span>
            <span style={{ flex: 1 }} />
            <Link href={`/salon/${s.slug}/reserver`} style={{ background: "var(--gold)", border: "none", color: "#FDF8EF", borderRadius: 10, padding: "9px 17px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }} className="btn-gold">Réserver</Link>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 11, borderTop: "1px solid var(--line-soft)", paddingTop: 9 }}>
        <button onClick={() => setTab(tab === "svc" ? null : "svc")} style={{ fontSize: 12.5, fontWeight: 700, color: tab === "svc" ? "var(--gold-dark)" : "var(--muted)", background: "none", border: "none", display: "flex", gap: 5, alignItems: "center" }}>Services <span style={{ fontSize: 9 }}>{tab === "svc" ? "▲" : "▼"}</span></button>
        <button onClick={() => setTab(tab === "rev" ? null : "rev")} style={{ fontSize: 12.5, fontWeight: 700, color: tab === "rev" ? "var(--gold-dark)" : "var(--muted)", background: "none", border: "none", display: "flex", gap: 5, alignItems: "center" }}>Avis <span style={{ fontSize: 9 }}>{tab === "rev" ? "▲" : "▼"}</span></button>
      </div>
      {tab === "svc" && (
        <div style={{ marginTop: 8, background: "var(--bg)", borderRadius: 12, padding: "4px 14px" }}>
          {top.map((ts) => (
            <div key={ts.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 12.5 }}>
              <div style={{ minWidth: 0, flex: 1, fontWeight: 600 }}>{ts.n}</div>
              <div style={{ color: "var(--muted)", fontSize: 11.5, whiteSpace: "nowrap" }}>{ts.d}</div>
              <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{ts.p} TND</div>
              <Link href={`/salon/${s.slug}/reserver`} style={{ fontSize: 11.5, color: "var(--gold-dark)", fontWeight: 700, whiteSpace: "nowrap" }}>Réserver</Link>
            </div>
          ))}
          <Link href={`/salon/${s.slug}`} style={{ display: "block", fontSize: 11.5, color: "var(--gold-dark)", fontWeight: 600, padding: "8px 0" }}>Voir tous les services →</Link>
        </div>
      )}
      {tab === "rev" && (
        <div style={{ marginTop: 8, background: "var(--bg)", borderRadius: 12, padding: "4px 14px" }}>
          {s.reviews.map((tr, i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5 }}>
                <span style={{ fontWeight: 800 }}>{tr.n}</span>
                <span style={{ color: "var(--amber)", letterSpacing: 1, fontSize: 10.5 }}>{stars(tr.starsNum)}</span>
                <span style={{ flex: 1 }} />
                <span style={{ color: "var(--muted)" }}>{tr.date}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-2)", lineHeight: 1.6, marginTop: 3 }}>{tr.txt}</div>
            </div>
          ))}
          <Link href={`/salon/${s.slug}`} style={{ display: "block", fontSize: 11.5, color: "var(--gold-dark)", fontWeight: 600, padding: "8px 0" }}>Voir les {s.rev} avis →</Link>
        </div>
      )}
    </div>
  )
}

export default function CityView({ salons, mapSalons, allSalons = [], cat, city, page = 1, totalPages = 1, total = 0, basePath }) {
  const router = useRouter()
  const { categories, cities, allCategories, categoryChildren, categoryParent } = useCatalog()
  const TOP_NAME = Object.fromEntries(categories.map((c) => [c.slug, c.name]))
  const children = categoryChildren(cat.slug)
  const parent = categoryParent(cat.slug)
  const badgeNodes = children.length ? children : (parent ? categoryChildren(parent.slug) : [])
  const badgeOwner = children.length ? cat : (parent || cat)

  const [q, setQ] = useState(cat.name)
  const [cityQ, setCityQ] = useState(city.name)
  const [applied, setApplied] = useState({ ...DEFAULTS }) // committed filters (drive the results)
  const [draft, setDraft] = useState({ ...DEFAULTS })      // being edited in the panel
  const [bounds, setBounds] = useState(null)               // map "Rechercher dans cette zone"
  const [searchOpen, setSearchOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [filtOpen, setFiltOpen] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [results, setResults] = useState(salons)
  const [mapItems, setMapItems] = useState(mapSalons)
  const [meta, setMeta] = useState({ page, totalPages, total })
  const [apiMode, setApiMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const filtCount = (applied.dispo !== "any" ? 1 : 0) + (applied.note ? 1 : 0) + (applied.budget !== "any" ? 1 : 0)
  const browsing = !q.trim() || q.trim() === cat.name
  const cityBrowsing = !cityQ.trim() || cityQ.trim() === city.name

  const buildQuery = (pageNum) => {
    const p = new URLSearchParams({ category: cat.slug, city: city.slug, page: String(pageNum), sort: applied.sort })
    if (applied.dispo !== "any") p.set("dispo", applied.dispo)
    if (applied.dispo === "date" && applied.date) p.set("date", applied.date)
    if (applied.note) p.set("note", String(applied.note))
    if (applied.budget !== "any") p.set("budget", applied.budget)
    if (bounds) p.set("bounds", `${bounds.n},${bounds.s},${bounds.e},${bounds.w}`)
    return p.toString()
  }
  const runQuery = (pageNum) => {
    setLoading(true)
    return fetch(`/api/salons?${buildQuery(pageNum)}`)
      .then((r) => r.json())
      .then((d) => { setResults(d.items); setMapItems(d.mapItems); setMeta({ page: d.page, totalPages: d.totalPages, total: d.total }); setApiMode(true); setLoading(false) })
      .catch(() => setLoading(false))
  }
  // Fetch ONLY when applied filters or the map zone change — both are button-driven,
  // so editing the panel (draft) never triggers a request.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    runQuery(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, bounds])

  const goToPage = (n) => { runQuery(n); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }) }

  const goCity = (slug) => router.push(`/${cat.slug}/${slug}`)
  const goNode = (slug) => { setSearchOpen(false); setDrawer(null); if (slug !== cat.slug) router.push(`/${slug}/${city.slug}`) }
  const pickEstab = (slug) => { setSearchOpen(false); setDrawer(null); router.push(`/salon/${slug}`) }

  const setDraftField = (key, v) => setDraft((d) => { const nd = { ...d, [key]: v }; if (key === "dispo" && v !== "date") nd.date = null; return nd })
  const clearDraft = () => setDraft({ ...DEFAULTS })
  const applyFilters = () => { setApplied(draft); setFiltOpen(false); setDrawer(null) }
  const openFilters = () => { setDraft(applied) }

  const cityOpts = cityBrowsing ? cities : cities.filter((c) => c.name.toLowerCase().includes(cityQ.trim().toLowerCase()))
  const dateLabel = applied.dispo === "date" && applied.date ? new Date(applied.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null
  const pillSummary = dateLabel ? `Le ${dateLabel}` : (filtCount > 0 ? `${filtCount} filtre${filtCount > 1 ? "s" : ""}` : "À tout moment")

  const searchResults = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return { cats: [], subs: [], estabs: [] }
    const nodes = allCategories.filter((n) => n.name.toLowerCase().includes(term))
    return {
      cats: nodes.filter((n) => n.isTop).slice(0, 4),
      subs: nodes.filter((n) => !n.isTop).slice(0, 6),
      estabs: allSalons.filter((s) => s.name.toLowerCase().includes(term) || (s.city || "").toLowerCase().includes(term) || (s.area || "").toLowerCase().includes(term) || (s.tags || []).some((t) => t.toLowerCase().includes(term))).slice(0, 6),
    }
  }, [q, allCategories, allSalons])
  const submitSearch = () => {
    const r = searchResults
    if (q.trim()) {
      if (r.cats[0]) return goNode(r.cats[0].slug)
      if (r.subs[0]) return goNode(r.subs[0].slug)
      if (r.estabs[0]) return pickEstab(r.estabs[0].slug)
    }
    goCity(city.slug)
  }

  const chip = (active) => ({
    fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "7px 14px", whiteSpace: "nowrap", cursor: "pointer",
    background: active ? "rgba(169,124,72,0.12)" : "var(--card)",
    border: `1px solid ${active ? "rgba(169,124,72,0.5)" : "var(--line-2)"}`,
    color: active ? "var(--gold-dark)" : "var(--muted-2)",
  })
  const secLabel = { fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }

  const FilterPanel = () => (
    <>
      {FILT_METRICS.map((m) => (
        <div key={m.key} style={{ marginBottom: 14 }}>
          <div style={secLabel}>{m.label}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
            {m.opts.map(([v, l]) => <span key={String(v)} onClick={() => setDraftField(m.key, v)} style={chip(draft[m.key] === v)}>{l}</span>)}
          </div>
          {m.key === "dispo" && draft.dispo === "date" && (
            <div style={{ marginTop: 10 }}><DateCal value={draft.date || null} onPick={(iso) => setDraft((d) => ({ ...d, date: iso }))} /></div>
          )}
        </div>
      ))}
      <div style={{ marginBottom: 8 }}>
        <div style={secLabel}>Trier par</div>
        <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
          {SORTS.map((s) => <span key={s.k} onClick={() => setDraftField("sort", s.k)} style={chip(draft.sort === s.k)}>{s.l}</span>)}
        </div>
      </div>
    </>
  )

  const Ico = ({ t }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {t === "cat" && <path d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" />}
      {t === "sub" && <path d="M12 3l2.1 4.6L19 8.3l-3.5 3.3.9 4.9L12 14.9 7.6 16.5l.9-4.9L5 8.3l4.9-.7z" />}
      {t === "est" && <path d="M3 9l1-5h16l1 5 M4 9v11h16V9 M9 20v-6h6v6" />}
    </svg>
  )
  const SRow = ({ t, label, sub, active, onClick }) => (
    <div onClick={onClick} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", cursor: "pointer" }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(169,124,72,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ico t={t} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? "var(--gold-dark)" : "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{sub}</div>}
      </div>
    </div>
  )
  const SGroup = ({ children: ch }) => <div style={{ ...secLabel, padding: "11px 14px 3px" }}>{ch}</div>
  const ResultsList = () => {
    const term = q.trim()
    if (browsing) return (
      <>
        <SGroup>Catégories</SGroup>
        {categories.map((c) => <SRow key={c.slug} t="cat" label={c.name} sub="Catégorie" active={c.slug === cat.slug || c.slug === cat.top} onClick={() => goNode(c.slug)} />)}
        {children.length > 0 && (<><SGroup>Prestations · {cat.name}</SGroup>{children.map((n) => <SRow key={n.slug} t="sub" label={n.name} sub={cat.name} onClick={() => goNode(n.slug)} />)}</>)}
      </>
    )
    const { cats, subs, estabs } = searchResults
    if (!cats.length && !subs.length && !estabs.length) return <div style={{ padding: "18px 16px", fontSize: 13, color: "var(--muted)" }}>Aucun résultat pour « {term} ».</div>
    return (
      <>
        {cats.length > 0 && <><SGroup>Catégories</SGroup>{cats.map((c) => <SRow key={c.slug} t="cat" label={c.name} sub="Catégorie" active={c.slug === cat.slug} onClick={() => goNode(c.slug)} />)}</>}
        {subs.length > 0 && <><SGroup>Prestations</SGroup>{subs.map((n) => <SRow key={n.slug} t="sub" label={n.name} sub={TOP_NAME[n.top]} active={n.slug === cat.slug} onClick={() => goNode(n.slug)} />)}</>}
        {estabs.length > 0 && <><SGroup>Établissements</SGroup>{estabs.map((s) => <SRow key={s.slug} t="est" label={s.name} sub={`${s.kind} · ${s.city}`} onClick={() => pickEstab(s.slug)} />)}</>}
      </>
    )
  }

  const pageNow = apiMode ? meta.page : page
  const pagesTotal = apiMode ? meta.totalPages : totalPages
  const count = apiMode ? meta.total : total

  return (
    <>
      {/* ══════════ DESKTOP search + filter ══════════ */}
      <div className="cv-desktop">
        <div className="city-gutter" style={{ display: "flex", gap: 16, alignItems: "stretch", paddingTop: 20, paddingBottom: 14 }}>
          <div style={{ position: "relative", flex: 1.1 }}>
            <div style={{ position: "absolute", top: -8, left: 13, background: "var(--bg)", padding: "0 5px", fontSize: 12, color: "var(--muted-2)", fontWeight: 500, zIndex: 2 }}>Que cherchez-vous ?</div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, border: `1px solid ${searchOpen ? "var(--gold)" : "var(--line-strong)"}`, borderRadius: 10, padding: "15px 16px", background: "var(--card)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
              <input value={q} onChange={(e) => { setQ(e.target.value); setSearchOpen(true) }} onFocus={(e) => { setSearchOpen(true); setCityOpen(false); e.target.select() }} onKeyDown={(e) => e.key === "Enter" && submitSearch()} placeholder="Prestation, salon, catégorie…" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 500, color: "var(--ink)", padding: 0 }} />
              {browsing ? <span style={{ fontSize: 10, color: "var(--muted)" }}>▼</span> : <span onClick={() => setQ("")} style={{ cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1 }}>×</span>}
            </div>
            {searchOpen && (
              <>
                <div onClick={() => { setSearchOpen(false); setQ(cat.name) }} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, maxHeight: 400, overflowY: "auto", background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 12, boxShadow: "0 18px 44px var(--shadow-strong)", zIndex: 20, paddingBottom: 6 }}>
                  <ResultsList />
                </div>
              </>
            )}
          </div>
          <div style={{ position: "relative", flex: 1.1 }}>
            <div style={{ position: "absolute", top: -8, left: 13, background: "var(--bg)", padding: "0 5px", fontSize: 12, color: "var(--muted-2)", fontWeight: 500, zIndex: 2 }}>Où ?</div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, border: "1px solid var(--line-strong)", borderRadius: 10, padding: "15px 16px", background: "var(--card)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
              <input value={cityQ} onChange={(e) => setCityQ(e.target.value)} onFocus={(e) => { setCityOpen(true); setSearchOpen(false); e.target.select() }} placeholder={city.name} style={{ background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 500, color: "var(--ink)", width: "100%", padding: 0 }} />
              <span style={{ fontSize: 10, color: "var(--muted)" }}>▼</span>
            </div>
            {cityOpen && (
              <>
                <div onClick={() => { setCityOpen(false); setCityQ(city.name) }} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: 250, maxHeight: 320, overflowY: "auto", background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 12, boxShadow: "0 16px 40px var(--shadow)", zIndex: 20 }}>
                  {cityOpts.map((c) => (
                    <div key={c.slug} onClick={() => { setCityOpen(false); setCityQ(""); goCity(c.slug) }} className="row-hover" style={{ padding: "11px 16px", fontSize: 14, cursor: "pointer", display: "flex", gap: 8, alignItems: "baseline", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: c.slug === city.slug ? 800 : 500, color: c.slug === city.slug ? "var(--gold-dark)" : "var(--ink)" }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: "var(--faint)" }}>{c.total} salons</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={submitSearch} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "0 26px", display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
            Rechercher
          </button>
        </div>

        <div className="city-gutter" style={{ display: "flex", gap: 8, paddingBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "none" }}>
            <div onClick={() => { if (!filtOpen) openFilters(); setFiltOpen((o) => !o) }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", cursor: "pointer", borderRadius: 999, border: `1px solid ${filtCount ? "rgba(169,124,72,0.5)" : "var(--line-2)"}`, background: filtCount ? "rgba(169,124,72,0.08)" : "var(--card)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></svg>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>Filtres & tri</span>
              {filtCount > 0 && <span style={{ background: "var(--gold)", color: "#FDF8EF", fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "1px 7px" }}>{filtCount}</span>}
            </div>
            {filtOpen && (
              <>
                <div onClick={() => setFiltOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
                <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, width: 340, maxWidth: "82vw", background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 14, boxShadow: "0 20px 50px var(--shadow-strong)", zIndex: 30, padding: "16px 18px" }}>
                  <FilterPanel />
                  <div style={{ display: "flex", gap: 9, alignItems: "center", borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
                    <div onClick={clearDraft} style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, cursor: "pointer" }}>Tout effacer</div>
                    <div style={{ flex: 1 }} />
                    <button onClick={applyFilters} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}>Appliquer</button>
                  </div>
                </div>
              </>
            )}
          </div>
          {parent && <span onClick={() => goNode(parent.slug)} style={{ ...chip(false), display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 13 }}>‹</span>{parent.name}</span>}
          {badgeNodes.map((n) => (
            <span key={n.slug} onClick={() => goNode(n.slug)} style={chip(n.slug === cat.slug)}>{n.name}</span>
          ))}
        </div>
      </div>

      {/* ══════════ MOBILE search pill + tab buttons ══════════ */}
      <div className="cv-mobile city-gutter" style={{ paddingTop: 14 }}>
        <div onClick={() => { setQ(cat.name); setDrawer("search") }} className="lift" style={{ display: "flex", alignItems: "center", gap: 13, border: "1px solid var(--line-2)", borderRadius: 14, padding: "15px 16px", boxShadow: "0 1px 4px var(--shadow)", cursor: "pointer", background: "var(--card)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{cat.name} <span style={{ color: "var(--faint)", fontWeight: 400 }}>•</span> {city.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{pillSummary}</div>
          </div>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => setDrawer("prest")} style={mtab}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16 M4 12h10 M4 18h6" /></svg>
            Prestations {!cat.isTop && <span style={mbadge}>1</span>}
          </button>
          <button onClick={() => setDrawer("map")} style={mtab}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3z M9 7v13 M15 4v13" /></svg>
            Carte
          </button>
          <button onClick={() => { openFilters(); setDrawer("filt") }} style={mtab}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></svg>
            Filtres {filtCount > 0 && <span style={mbadge}>{filtCount}</span>}
          </button>
        </div>
      </div>

      {/* ══════════ List + map ══════════ */}
      <div className="city-gutter" style={{ borderTop: "1px solid var(--line-soft)", marginTop: 14, paddingTop: 4 }}>
        <div className="city-layout">
          <div className="city-list" style={{ minWidth: 0, paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h1 className="serif" style={{ fontSize: 24, margin: 0, fontWeight: 400 }}>{cat.name} à {city.name}</h1>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{count} salon{count > 1 ? "s" : ""}{loading ? " · …" : ""}</div>
              {bounds && (
                <span onClick={() => setBounds(null)} className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--gold-dark)", background: "rgba(169,124,72,0.1)", border: "1px solid rgba(169,124,72,0.45)", borderRadius: 999, padding: "4px 10px", cursor: "pointer" }}>Zone de la carte ✕</span>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "72px 20px 90px" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--muted)" }}>Aucun salon trouvé</div>
                <div style={{ fontSize: 14, color: "var(--faint)", marginTop: 10 }}>Essayez de modifier vos filtres ou votre recherche.</div>
                <button onClick={() => { setApplied({ ...DEFAULTS }); setBounds(null) }} className="btn-outline" style={{ marginTop: 16, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>Réinitialiser</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16, opacity: loading ? 0.55 : 1, transition: "opacity .15s" }}>
                  {results.map((s, i) => <SalonRow key={s.slug} s={s} dist={DISTS[i % 5]} />)}
                </div>
                <Pagination pageNow={pageNow} pagesTotal={pagesTotal} apiMode={apiMode} basePath={basePath} onPage={goToPage} />
              </>
            )}
          </div>

          <aside className="city-map" style={{ position: "sticky", top: 78, alignSelf: "flex-start" }}>
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)" }}>
              <SalonMap salons={mapItems} height="max(460px, calc(100vh - 94px))" onSearchArea={setBounds} areaActive={!!bounds} onResetArea={() => setBounds(null)} />
            </div>
          </aside>
        </div>
      </div>

      {/* ══════════ "Encore des questions ?" CTA ══════════ */}
      <div style={{ textAlign: "center", padding: "60px 24px 68px" }}>
        <div className="serif" style={{ fontSize: 26 }}>Encore des questions ?</div>
        <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.65, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>Décrivez votre situation pour recevoir des conseils adaptés de la part de l'équipe Rezervy.</div>
        <a href="mailto:contact@rezervy.io" className="btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "#FDF8EF", borderRadius: 999, padding: "14px 28px", fontSize: 14.5, fontWeight: 700, marginTop: 26, whiteSpace: "nowrap" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6" /></svg>
          Contactez-nous
        </a>
      </div>

      {/* ══════════ Mobile drawers ══════════ */}
      {drawer && (
        <div onClick={() => setDrawer(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "var(--card)", borderRadius: "22px 22px 0 0", zIndex: 95, padding: "10px 20px 26px", maxHeight: "82vh", overflowY: "auto", boxShadow: "0 -16px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ width: 38, height: 4, borderRadius: 99, background: "var(--line-strong)", margin: "8px auto 4px" }} />

            {drawer === "search" && (<>
              <DrawerHead title="Rechercher" onClose={() => setDrawer(null)} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", border: `1px solid ${q ? "var(--gold)" : "var(--line-strong)"}`, borderRadius: 12, padding: "12px 14px", marginTop: 12 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onFocus={(e) => e.target.select()} placeholder="Catégorie, prestation, salon…" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "var(--ink)", padding: 0 }} />
                {!browsing && <span onClick={() => setQ("")} style={{ cursor: "pointer", color: "var(--muted)", fontSize: 17 }}>×</span>}
              </div>
              {!browsing ? (
                <div style={{ marginTop: 6 }}><ResultsList /></div>
              ) : (<>
                <div style={{ ...secLabel, marginTop: 16 }}>Catégorie</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {categories.map((c) => <span key={c.slug} onClick={() => goNode(c.slug)} style={{ ...chip(c.slug === cat.slug || c.slug === cat.top), fontWeight: c.slug === cat.top ? 800 : 600 }}>{c.name}</span>)}
                </div>
                <div style={{ ...secLabel, marginTop: 16 }}>Ville</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
                  <input value={cityQ} onChange={(e) => setCityQ(e.target.value)} placeholder={city.name} style={{ background: "transparent", border: "none", outline: "none", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", width: "100%", padding: 0 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
                  {cityOpts.map((c) => (
                    <div key={c.slug} onClick={() => { setDrawer(null); setCityQ(""); goCity(c.slug) }} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "12px 6px", borderBottom: "1px solid var(--line-soft)", cursor: "pointer" }}>
                      <span style={{ fontSize: 13.5, fontWeight: c.slug === city.slug ? 800 : 600, color: c.slug === city.slug ? "var(--gold-dark)" : "var(--ink)" }}>{c.name}</span>
                      <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{c.total} salons</span>
                    </div>
                  ))}
                </div>
              </>)}
            </>)}

            {drawer === "prest" && (<>
              <DrawerHead title={`Prestations — ${badgeOwner.name}`} onClose={() => setDrawer(null)} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {parent && (
                  <div onClick={() => goNode(parent.slug)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 12, border: "1px solid var(--line-2)", background: "var(--card)", cursor: "pointer" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gold-dark)", flex: 1 }}>‹ {parent.name}</span>
                  </div>
                )}
                {badgeNodes.map((n) => (
                  <div key={n.slug} onClick={() => goNode(n.slug)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 12, border: `1px solid ${n.slug === cat.slug ? "rgba(169,124,72,0.5)" : "var(--line-2)"}`, background: n.slug === cat.slug ? "rgba(169,124,72,0.1)" : "var(--card)", cursor: "pointer" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: n.slug === cat.slug ? "var(--gold-dark)" : "var(--ink)", flex: 1 }}>{n.name}</span>{n.slug === cat.slug && <span style={{ color: "var(--gold)", fontWeight: 800 }}>✓</span>}
                  </div>
                ))}
              </div>
            </>)}

            {drawer === "map" && (<>
              <DrawerHead title={`Salons à ${city.name}`} onClose={() => setDrawer(null)} />
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginTop: 12, border: "1px solid var(--line-2)" }}>
                <SalonMap salons={mapItems} height="52vh" onSearchArea={(b) => { setBounds(b); setDrawer(null) }} areaActive={!!bounds} onResetArea={() => setBounds(null)} />
              </div>
            </>)}

            {drawer === "filt" && (<>
              <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
                <div className="serif" style={{ fontSize: 18 }}>Filtres & tri</div>
                <div style={{ flex: 1 }} />
                <div onClick={clearDraft} style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, cursor: "pointer", marginRight: 12 }}>Tout effacer</div>
                <div onClick={() => setDrawer(null)} style={{ color: "var(--muted)", fontSize: 19, padding: "2px 8px", cursor: "pointer" }}>×</div>
              </div>
              <div style={{ marginTop: 12 }}><FilterPanel /></div>
              <button onClick={applyFilters} className="btn-gold" style={{ width: "100%", background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 14, marginTop: 8 }}>Appliquer</button>
            </>)}
          </div>
        </div>
      )}
    </>
  )
}

function DrawerHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
      <div className="serif" style={{ fontSize: 18 }}>{title}</div>
      <div style={{ flex: 1 }} />
      <div onClick={onClose} style={{ color: "var(--muted)", fontSize: 19, padding: "2px 8px", cursor: "pointer" }}>×</div>
    </div>
  )
}

const mtab = { flex: 1, position: "relative", display: "flex", gap: 7, alignItems: "center", justifyContent: "center", padding: "11px 8px", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }
const mbadge = { position: "absolute", top: -7, right: 12, background: "var(--gold)", color: "#FDF8EF", fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "2px 7px" }
