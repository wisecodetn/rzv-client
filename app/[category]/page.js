import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Photo from "@/components/Photo"
import JsonLd from "@/components/JsonLd"
import { breadcrumbLd } from "@/lib/jsonld"
import { getIndexedCategories, getCategory, categoryParent, categoryCities } from "@/lib/data"
import { mediaPath } from "@/lib/api"
import { SITE } from "@/lib/site"
import { de } from "@/lib/fr"
import { pageMeta } from "@/lib/meta"

export async function generateStaticParams() {
  return (await getIndexedCategories()).map((c) => ({ category: c.slug }))
}

/** "3 établissements dans 2 villes" — singular when it is one. */
const countLine = (n, cities) => `${n} établissement${n > 1 ? "s" : ""} dans ${cities} ville${cities > 1 ? "s" : ""}`

export async function generateMetadata({ params }) {
  const { category } = await params
  const cat = await getCategory(category)
  if (!cat) return {}
  const cities = await categoryCities(cat.slug)
  const total = cities.reduce((t, c) => t + c.count, 0)
  // No salon sells this yet: a real page for the visitor, nothing to rank.
  if (!total) {
    return pageMeta({
      ownImage: true, // this route has its own opengraph-image
      title: `${cat.name} en Tunisie`,
      description: `Aucun salon ${de(cat.lower)} n'est encore référencé sur Rezervy.`,
      path: `/${cat.slug}`,
      robots: { index: false, follow: true },
    })
  }
  const title = `${cat.name} en Tunisie — ${total} ${total > 1 ? "salons" : "salon"}`
  const description = `Salons ${de(cat.lower)} en Tunisie : comparez les prix et les avis, et réservez en ligne en quelques clics. ${countLine(total, cities.length)}.`
  return pageMeta({
    ownImage: true, // this route has its own opengraph-image
    title,
    description,
    path: `/${cat.slug}`,
    // Third-level prestations (Coupe homme under Coiffure homme) are browsing
    // aids: thin, close to their parent, kept out of the sitemap — and so out
    // of the index too, or they compete with the parent page.
    ...(cat.depth > 1 ? { robots: { index: false, follow: true } } : {}),
    keywords: [`${cat.lower} Tunisie`, `salon ${cat.lower}`, ...cities.slice(0, 4).map((c) => `${cat.lower} ${c.name}`), "réservation en ligne"],
  })
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
            description: `Salons ${de(cat.lower)} en Tunisie : ${countLine(total, cities.length)} — prix, avis et réservation en ligne.`,
            about: { "@type": "Service", name: cat.name },
            ...(cities.find((c) => c.image) ? { image: cities.find((c) => c.image).image, primaryImageOfPage: { "@type": "ImageObject", contentUrl: cities.find((c) => c.image).image } } : {}),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: cities.length,
              itemListElement: cities.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${cat.name} à ${c.name}`,
                url: `${SITE.url}/${cat.slug}/${c.slug}`,
              })),
            },
          },
        ]}
      />

      <nav aria-label="Fil d’Ariane" style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        {parent && (<><Link href={`/${parent.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{parent.name}</Link><span>/</span></>)}
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{cat.name}</span>
      </nav>

      <h1 className="serif" style={{ fontSize: 30, marginTop: 12, marginBottom: 0, fontWeight: 400 }}>{cat.name} en Tunisie</h1>
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 6, maxWidth: 640, lineHeight: 1.65 }}>
        {total > 0 ? (
          <>
            Trouvez un salon {de(cat.lower)} près de chez vous : comparez les prix, lisez les avis et réservez en ligne en
            quelques clics. {countLine(total, cities.length)}.
          </>
        ) : (
          <>Aucun salon {de(cat.lower)} n&apos;est encore référencé sur Rezervy. Explorez les autres catégories depuis l&apos;accueil.</>
        )}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, marginTop: 24 }}>
        {cities.map((c) => (
          <Link key={c.slug} href={`/${cat.slug}/${c.slug}`} title={`${cat.name} à ${c.name} — ${c.count} salon${c.count > 1 ? "s" : ""}`} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", display: "block", color: "var(--ink)" }}>
            <div style={{ height: 130, position: "relative", overflow: "hidden" }}>
              {c.image ? (
                <Image
                  src={mediaPath(c.image)}
                  alt={`${cat.name} à ${c.name}`}
                  title={`${cat.name} à ${c.name}`}
                  fill
                  // Cards are a 240px-min grid; phones show one per row.
                  sizes="(max-width: 560px) 100vw, 320px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Photo label={`${cat.name} à ${c.name}`} />
              )}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "linear-gradient(transparent,rgba(0,0,0,0.55))", pointerEvents: "none" }} />
              <div className="serif" style={{ position: "absolute", left: 14, bottom: 10, fontSize: 19, color: "#FFFFFF", textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}>{c.name}</div>
            </div>
            <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.count} salon{c.count > 1 ? "s" : ""} {de(cat.lower)}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                  {[c.from != null ? `dès ${String(c.from).replace(".", ",")} TND` : null, c.rate ? `note moyenne ${c.rate}/5` : null].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 800 }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
