import Link from "next/link"
import SalonCard from "@/components/SalonCard"
import JsonLd from "@/components/JsonLd"
import SearchForm from "./SearchForm"
import { breadcrumbLd, itemListLd } from "@/lib/jsonld"
import { SITE, abs } from "@/lib/site"
import { querySalons, getCategories } from "@/lib/data"

/**
 * SEO city search page — /recherche/[ville] (+ /page-N). Path-based, indexable,
 * server-rendered: crawlable salon list, per-category internal links, editorial
 * copy and BreadcrumbList + CollectionPage + ItemList JSON-LD.
 */
export default async function VilleResults({ city, page = 1 }) {
  const [q, categories] = await Promise.all([
    querySalons({ city: city.slug, page }),
    getCategories(),
  ])
  const base = `/recherche/${city.slug}`
  const href = (n) => (n === 1 ? base : `${base}/page-${n}`)

  // Derived, real content for SEO: categories actually present + price floor.
  const present = new Set(q.mapItems.flatMap((s) => s.categories || []))
  const catLinks = categories.filter((c) => present.has(c.slug))
  const minFrom = q.mapItems.length ? Math.min(...q.mapItems.map((s) => s.from)) : null
  const bestRate = q.mapItems.length ? Math.max(...q.mapItems.map((s) => s.rateNum)).toFixed(1).replace(".", ",") : null

  const nums = []
  for (let i = 1; i <= q.totalPages; i++) nums.push(i)
  const pnav = { minWidth: 36, height: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, padding: "0 10px", border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)" }
  const pactive = { ...pnav, background: "var(--gold)", color: "#FDF8EF", border: "1px solid var(--gold)" }
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
            description: `${q.total} salons de beauté, barbiers, ongleries et spas à ${city.name}, à réserver en ligne sur Rezervy.`,
            isPartOf: { "@id": abs("/#website") },
          },
          q.items.length ? itemListLd(q.items) : null,
        ]}
      />

      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
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
          Comparez les prix{minFrom ? <> (dès <strong style={{ color: "var(--ink)" }}>{minFrom} TND</strong>)</> : null}, lisez les avis vérifiés
          {bestRate ? <> (jusqu'à ★ {bestRate})</> : null} et réservez en ligne en 30 secondes, confirmation par SMS.</>
        ) : (
          <>Aucun salon référencé à {city.name} pour le moment — élargissez votre recherche ou explorez une autre ville.</>
        )}
      </p>

      {/* Per-category internal links (only categories actually present) */}
      {catLinks.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {catLinks.map((c) => (
            <Link key={c.slug} href={`/${c.slug}/${city.slug}`} className="pill" style={{ fontSize: 12.5, fontWeight: 700, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "7px 15px", color: "var(--ink)" }}>
              {c.name} à {city.name}
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
            {q.items.map((s) => <SalonCard key={s.slug} salon={s} />)}
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

      {/* Editorial block — real, city-specific content for crawlers and humans */}
      {q.total > 0 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, marginTop: 30, maxWidth: 760 }}>
          <div className="serif" style={{ fontSize: 18 }}>Réserver un salon à {city.name} : ce qu'il faut savoir</div>
          <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.75, marginTop: 10 }}>
            Les créneaux du week-end partent vite à {city.name} : réservez 3 à 4 jours à l'avance ou activez la liste
            d'attente. La plupart des salons acceptent l'acompte en ligne (Flouci, e-Dinar, carte) et l'annulation reste
            gratuite jusqu'à 24h avant le rendez-vous. Chaque réservation est confirmée et rappelée par SMS.
          </div>
        </div>
      )}
    </div>
  )
}
