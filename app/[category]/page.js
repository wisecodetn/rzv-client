import Link from "next/link"
import { notFound } from "next/navigation"
import Photo from "@/components/Photo"
import JsonLd from "@/components/JsonLd"
import { breadcrumbLd } from "@/lib/jsonld"
import { getIndexedCategories, getCategory, categoryParent, categoryCities } from "@/lib/data"
import { SITE } from "@/lib/site"

export async function generateStaticParams() {
  return (await getIndexedCategories()).map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }) {
  const { category } = await params
  const cat = await getCategory(category)
  if (!cat) return {}
  const cities = await categoryCities(cat.slug)
  const total = cities.reduce((t, c) => t + c.count, 0)
  const title = `${cat.name} en Tunisie — ${total} salons à réserver en ligne`
  const description = `Trouvez les meilleurs salons de ${cat.lower} en Tunisie : comparez prix et avis vérifiés, et réservez en ligne en 30 secondes. ${total} établissements dans ${cities.length} villes.`
  return {
    title,
    description,
    alternates: { canonical: `/${cat.slug}` },
    openGraph: { title: `${title} · ${SITE.name}`, description, url: `${SITE.url}/${cat.slug}` },
  }
}

export default async function CategoryPage({ params }) {
  const { category } = await params
  const cat = await getCategory(category)
  if (!cat) notFound()
  const [parent, cities] = await Promise.all([categoryParent(cat.slug), categoryCities(cat.slug)])
  const total = cities.reduce((t, c) => t + c.count, 0)

  return (
    <div className="wrap" style={{ padding: "30px 24px 60px" }}>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            ...(parent ? [{ name: parent.name, url: `/${parent.slug}` }] : []),
            { name: cat.name, url: `/${cat.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${cat.name} en Tunisie`,
            url: `${SITE.url}/${cat.slug}`,
            about: { "@type": "Service", name: cat.name },
          },
        ]}
      />

      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        {parent && (<><Link href={`/${parent.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{parent.name}</Link><span>/</span></>)}
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{cat.name}</span>
      </nav>

      <h1 className="serif" style={{ fontSize: 30, marginTop: 12, marginBottom: 0, fontWeight: 400 }}>{cat.name} en Tunisie</h1>
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 6, maxWidth: 640, lineHeight: 1.65 }}>
        Trouvez les meilleurs salons de {cat.lower} près de chez vous : comparez les prix, lisez les avis vérifiés et réservez
        en ligne en 30 secondes. {total} établissements dans {cities.length} villes.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, marginTop: 24 }}>
        {cities.map((c) => (
          <Link key={c.slug} href={`/${cat.slug}/${c.slug}`} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", display: "block", color: "var(--ink)" }}>
            <div style={{ height: 130, position: "relative" }}>
              <Photo label={`${cat.name} à ${c.name}`} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "linear-gradient(transparent,rgba(26,18,8,0.55))", pointerEvents: "none" }} />
              <div className="serif" style={{ position: "absolute", left: 14, bottom: 10, fontSize: 19, color: "#FDF8EF", textShadow: "0 1px 10px rgba(26,18,8,0.6)" }}>{c.name}</div>
            </div>
            <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.count} salons de {cat.lower}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>dès {c.from} TND · note moyenne ★ {c.rate}</div>
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 800 }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
