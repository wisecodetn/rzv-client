import Link from "next/link"
import SalonCard from "@/components/SalonCard"
import JsonLd from "@/components/JsonLd"
import SearchForm from "./SearchForm"
import { breadcrumbLd, itemListLd } from "@/lib/jsonld"
import AreaFacts from "@/components/AreaFacts"
import { SITE, abs } from "@/lib/site"
import { querySalons, getCategories, getCoverage } from "@/lib/data"

/**
 * SEO city search page — /recherche/[ville] (+ /page-N). Path-based, indexable,
 * server-rendered: crawlable salon list, per-category internal links, editorial
 * copy and BreadcrumbList + CollectionPage + ItemList JSON-LD.
 */
export default async function VilleResults({ city, page = 1 }) {
  const [q, categories, { pairs }] = await Promise.all([
    querySalons({ city: city.slug, page }),
    getCategories(),
    getCoverage(),
  ])
  const base = `/recherche/${city.slug}`
  const href = (n) => (n === 1 ? base : `${base}/page-${n}`)

  // Real content for SEO: the categories this city's salons actually sell (same
  // matching as the listings), and the listing's own price floor and rating.
  const present = new Map(pairs.filter((p) => p.city === city.slug).map((p) => [p.category, p.count]))
  const catLinks = categories.filter((c) => present.has(c.slug))
  const minFrom = q.stats?.priceMin ?? null
  const avgRate = q.stats?.rating != null ? q.stats.rating.toFixed(1).replace(".", ",") : null

  const nums = []
  for (let i = 1; i <= q.totalPages; i++) nums.push(i)
  const pnav = { minWidth: 36, height: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, padding: "0 10px", border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)" }
  const pactive = { ...pnav, background: "var(--gold)", color: "var(--on-gold)", border: "1px solid var(--gold)" }
  const pdis = { ...pnav, opacity: 0.4, pointerEvents: "none" }

  return (
    <div className="wrap" style={{ padding: "28px 24px 60px" }}>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            { name: "Recherche", url: "/recherche" },
            { name: `Salons à ${city.name}`, url: base },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": abs(`${base}#collection`),
            name: `Salons de beauté à ${city.name}`,
            url: `${SITE.url}${base}`,
            description: `${q.total} salon${q.total > 1 ? "s" : ""} à ${city.name}${catLinks.length ? ` (${catLinks.map((c) => c.name.toLowerCase()).join(", ")})` : ""}, à réserver en ligne sur Rezervy.`,
            isPartOf: { "@id": abs("/#website") },
          },
          q.items.length ? itemListLd(q.items) : null,
        ]}
      />

      <nav aria-label="Fil d’Ariane" style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        <Link href="/recherche" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Recherche</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{city.name}</span>
      </nav>

      <h1 className="serif" style={{ fontSize: 30, marginTop: 12, marginBottom: 0, fontWeight: 400 }}>
        Salons de beauté à {city.name}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8, maxWidth: 660, lineHeight: 1.7 }}>
        {q.total > 0 ? (
          <>Réservez parmi {q.total} salon{q.total > 1 ? "s" : ""} à {city.name} — coiffure, barbier, onglerie, esthétique et spa.
          Comparez les prix{minFrom != null ? <> (dès <strong style={{ color: "var(--ink)" }}>{String(minFrom).replace(".", ",")} TND</strong>)</> : null}, lisez les avis
          {avgRate ? <> (note moyenne {avgRate}/5)</> : null} et réservez en ligne en quelques clics, confirmation par e-mail.</>
        ) : (
          <>Aucun salon référencé à {city.name} pour le moment — élargissez votre recherche ou explorez une autre ville.</>
        )}
      </p>

      {/* Per-category internal links (only categories actually present) */}
      {catLinks.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {catLinks.map((c) => (
            <Link key={c.slug} href={`/${c.slug}/${city.slug}`} className="pill" style={{ fontSize: 12.5, fontWeight: 700, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "7px 15px", color: "var(--ink)" }}>
              {c.name} à {city.name} ({present.get(c.slug)})
            </Link>
          ))}
        </div>
      )}

      <SearchForm initial={{ city: city.slug, cityName: city.name }} />

      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 18 }}>
        {q.total} salon{q.total > 1 ? "s" : ""}{q.totalPages > 1 ? ` · page ${q.page}/${q.totalPages}` : ""}
      </div>

      {q.items.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 18, marginTop: 16 }}>
            {q.items.map((s, i) => <SalonCard key={s.slug} salon={s} first={i === 0} />)}
          </div>

          {q.totalPages > 1 && (
            <nav aria-label="Pagination" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 30 }}>
              {q.page <= 1 ? <span style={pdis}>‹ Précédent</span> : <Link href={href(q.page - 1)} className="lift" style={pnav}>‹ Précédent</Link>}
              {nums.map((n) => n === q.page ? <span key={n} style={pactive}>{n}</span> : <Link key={n} href={href(n)} className="lift" style={pnav}>{n}</Link>)}
              {q.page >= q.totalPages ? <span style={pdis}>Suivant ›</span> : <Link href={href(q.page + 1)} className="lift" style={pnav}>Suivant ›</Link>}
            </nav>
          )}
        </>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "26px 22px", marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--muted)" }}>Aucun salon à {city.name} pour le moment</div>
          <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 6 }}>Explorez par catégorie :</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="pill" style={{ fontSize: 12.5, fontWeight: 700, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "7px 15px", color: "var(--ink)" }}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}

      {/* Editorial block — written from this city's real figures */}
      <div style={{ marginTop: 30, maxWidth: 760 }}>
        <AreaFacts title={`Réserver un salon à ${city.name} : ce qu'il faut savoir`} stats={q.stats} cityName={city.name} />
      </div>
    </div>
  )
}
