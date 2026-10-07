import Link from "next/link"
import JsonLd from "@/components/JsonLd"
import CityView from "@/components/CityView"
import { breadcrumbLd, itemListLd } from "@/lib/jsonld"
import AreaFacts from "@/components/AreaFacts"
import { SITE } from "@/lib/site"
import { categoryParent, querySalons, categoryCities, getCoverage } from "@/lib/data"
import { de } from "@/lib/fr"

/* Server-rendered listing (used for both page 1 and /page-N). Provides the
   first page of salons + all matches for the map; CityView takes over
   interactivity (filters via /api/salons, pagination via links or fetch). */
export default async function CityScreen({ cat, ct, page = 1 }) {
  const [q, parent, withSalons, { pairs }] = await Promise.all([
    querySalons({ category: cat.slug, city: ct.slug, page }),
    categoryParent(cat.slug),
    categoryCities(cat.slug),
    getCoverage(),
  ])
  // Categories that have salons in this city: the only ones the chips link to.
  const live = pairs.filter((p) => p.city === ct.slug).map((p) => p.category)
  // Other cities that really have this category — never a link to an empty page.
  const near = withSalons.filter((c) => c.slug !== ct.slug).slice(0, 8)
  const base = `/${cat.slug}/${ct.slug}`

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            ...(parent ? [{ name: parent.name, url: `/${parent.slug}` }] : []),
            { name: cat.name, url: `/${cat.slug}` },
            { name: ct.name, url: base },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${cat.name} à ${ct.name}`,
            url: `${SITE.url}${base}`,
            description: `${q.total} salon${q.total > 1 ? "s" : ""} ${de(cat.lower)} à ${ct.name} — prix, avis et réservation en ligne.`,
            about: { "@type": "Service", name: cat.name, areaServed: { "@type": "City", name: ct.name } },
            ...(ct.image ? { image: ct.image, primaryImageOfPage: { "@type": "ImageObject", contentUrl: ct.image } } : {}),
          },
          q.items.length ? itemListLd(q.items) : null,
        ]}
      />

      <nav aria-label="Fil d’Ariane" className="city-gutter" style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", paddingTop: 20 }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        {parent && (<><Link href={`/${parent.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{parent.name}</Link><span>/</span></>)}
        <Link href={`/${cat.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{cat.name}</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{ct.name}</span>
      </nav>

      <CityView
        key={`${base}/${q.page}`}
        salons={q.items}
        mapSalons={q.mapItems}
        cat={cat}
        city={ct}
        page={q.page}
        totalPages={q.totalPages}
        total={q.total}
        basePath={base}
        live={live}
      />

      {/* What this listing really contains, then where else to look. */}
      <div style={{ padding: "26px clamp(16px,2.5vw,40px) 60px", maxWidth: 1180, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18, alignItems: "start" }}>
        <AreaFacts title={`${cat.name} à ${ct.name} : ce qu'il faut savoir`} stats={q.stats} what={cat.lower} cityName={ct.name} />
        {near.length > 0 && (
          <nav aria-label={`${cat.name} dans d'autres villes`} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, minWidth: 0 }}>
            <h2 className="serif" style={{ fontSize: 18, fontWeight: 400 }}>{cat.name} ailleurs en Tunisie</h2>
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              {near.map((nc) => (
                <Link key={nc.slug} href={`/${cat.slug}/${nc.slug}`} className="link-soft" style={{ fontSize: 11.5, fontWeight: 700, background: "var(--bg)", borderRadius: 999, padding: "5px 12px", whiteSpace: "nowrap", color: "var(--muted-2)" }}>
                  {cat.name} à {nc.name} ({nc.count})
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </>
  )
}
