import Link from "next/link"
import SalonCard from "@/components/SalonCard"
import SearchForm from "./SearchForm"
import { getCategories, getCategory, getCity, searchSalons } from "@/lib/data"

export function parseSearch(sp) {
  return {
    q: sp.q || "",
    category: sp.cat || "",
    city: sp.city || "",
    rate: parseFloat(sp.rate) || 0,
    dispo: sp.dispo || "",
    sort: sp.sort || "note",
  }
}

function buildQs(p) {
  const s = new URLSearchParams()
  if (p.q) s.set("q", p.q)
  if (p.city) s.set("city", p.city)
  if (p.category) s.set("cat", p.category)
  if (p.rate) s.set("rate", String(p.rate))
  if (p.dispo) s.set("dispo", p.dispo)
  if (p.sort && p.sort !== "note") s.set("sort", p.sort)
  return s.toString()
}

export default async function RechercheResults({ params, page }) {
  const [res, catNode, cityObj, categories] = await Promise.all([
    searchSalons({ ...params, page }),
    params.category ? getCategory(params.category) : null,
    params.city ? getCity(params.city) : null,
    getCategories(),
  ])
  const qs = buildQs(params)
  const suffix = qs ? `?${qs}` : ""
  const href = (n) => (n === 1 ? `/recherche${suffix}` : `/recherche/page-${n}${suffix}`)

  const catName = catNode?.name || null
  const cityName = cityObj?.name || null
  const bits = [params.q && `« ${params.q} »`, catName, cityName && `à ${cityName}`, params.rate && `${params.rate}★ et +`, params.dispo === "today" && "dispo aujourd'hui"].filter(Boolean)
  const label = bits.join(" · ")

  const nums = []
  for (let i = 1; i <= res.totalPages; i++) nums.push(i)
  const pnav = { minWidth: 36, height: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, padding: "0 10px", border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)" }
  const pactive = { ...pnav, background: "var(--gold)", color: "#FDF8EF", border: "1px solid var(--gold)" }
  const pdis = { ...pnav, opacity: 0.4, pointerEvents: "none" }

  return (
    <div className="wrap" style={{ padding: "28px 24px 60px" }}>
      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>Recherche</span>
      </nav>
      <h1 className="serif" style={{ fontSize: 30, marginTop: 12, marginBottom: 0, fontWeight: 400 }}>
        {label ? "Résultats de recherche" : "Tous les salons"}
      </h1>

      <SearchForm initial={params} />

      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 18 }}>
        {res.total} salon{res.total > 1 ? "s" : ""}{label ? <> · {label}</> : ""}{res.totalPages > 1 ? ` · page ${res.page}/${res.totalPages}` : ""}
      </div>

      {res.items.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 18, marginTop: 16 }}>
            {res.items.map((s) => <SalonCard key={s.slug} salon={s} />)}
          </div>

          {res.totalPages > 1 && (
            <nav aria-label="Pagination" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 30 }}>
              {res.page <= 1 ? <span style={pdis}>‹ Précédent</span> : <Link href={href(res.page - 1)} className="lift" style={pnav}>‹ Précédent</Link>}
              {nums.map((n) => n === res.page ? <span key={n} style={pactive}>{n}</span> : <Link key={n} href={href(n)} className="lift" style={pnav}>{n}</Link>)}
              {res.page >= res.totalPages ? <span style={pdis}>Suivant ›</span> : <Link href={href(res.page + 1)} className="lift" style={pnav}>Suivant ›</Link>}
            </nav>
          )}
        </>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "26px 22px", marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--muted)" }}>Aucun salon trouvé</div>
          <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 6 }}>Élargissez votre recherche ou explorez par catégorie :</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="pill" style={{ fontSize: 12.5, fontWeight: 700, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "7px 15px", color: "var(--ink)" }}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
