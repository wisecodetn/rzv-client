import Link from "next/link"
import JsonLd from "@/components/JsonLd"
import CityView from "@/components/CityView"
import { breadcrumbLd, itemListLd } from "@/lib/jsonld"
import { getCities, categoryParent, querySalons, PRICE_ROWS } from "@/lib/data"

/* Server-rendered listing (used for both page 1 and /page-N). Provides the
   first page of salons + all matches for the map; CityView takes over
   interactivity (filters via /api/salons, pagination via links or fetch). */
export default async function CityScreen({ cat, ct, page = 1 }) {
  const [q, parent, cities, allList] = await Promise.all([
    querySalons({ category: cat.slug, city: ct.slug, page }),
    categoryParent(cat.slug),
    getCities(),
    querySalons({}), // global list for CityView's establishment autocomplete
  ])
  const priceRows = PRICE_ROWS[cat.top] || []
  const near = cities.filter((c) => c.slug !== ct.slug).slice(0, 5)
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
          q.items.length ? itemListLd(q.items) : null,
        ]}
      />

      <nav className="city-gutter" style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", paddingTop: 20 }}>
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
        allSalons={allList.mapItems}
        cat={cat}
        city={ct}
        page={q.page}
        totalPages={q.totalPages}
        total={q.total}
        basePath={base}
      />

      {/* Prix moyens + À savoir */}
      <div style={{ padding: "26px clamp(16px,2.5vw,40px) 60px", maxWidth: 1180, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18, alignItems: "start" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22 }}>
          <div className="serif" style={{ fontSize: 18 }}>Prix moyens — {cat.lower} à {ct.name}</div>
          <div style={{ marginTop: 12 }}>
            {priceRows.map((pr) => (
              <div key={pr.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 13 }}>
                <div style={{ minWidth: 0, flex: 1, fontWeight: 600 }}>{pr.n}</div>
                <div style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>{pr.range}</div>
                <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>~ {pr.avg} TND</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>Prix constatés sur les réservations Rezervy des 3 derniers mois.</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22 }}>
          <div className="serif" style={{ fontSize: 18 }}>{cat.name} à {ct.name} : ce qu'il faut savoir</div>
          <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.75, marginTop: 10 }}>
            {ct.name} concentre l'une des meilleures offres de {cat.lower} de la région. Les créneaux du samedi partent vite :
            réservez 3 à 4 jours à l'avance, ou activez la liste d'attente. La plupart des salons acceptent l'acompte Flouci
            ou e-Dinar, et l'annulation reste gratuite jusqu'à 24h avant le rendez-vous.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {near.map((nc) => (
              <Link key={nc.slug} href={`/${cat.slug}/${nc.slug}`} className="link-soft" style={{ fontSize: 11.5, fontWeight: 700, background: "var(--bg)", borderRadius: 999, padding: "5px 12px", whiteSpace: "nowrap", color: "var(--muted-2)" }}>{cat.name} à {nc.name}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
