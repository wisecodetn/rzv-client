import Link from "next/link"
import Photo from "@/components/Photo"
import SearchBar from "@/components/SearchBar"
import SalonCard from "@/components/SalonCard"
import FaqAccordion from "@/components/FaqAccordion"
import ContactCard from "@/components/ContactCard"
import JsonLd from "@/components/JsonLd"
import { faqLd } from "@/lib/jsonld"
import { getFeaturedSalons, getCategories, getCatalog, categoryCities, HOW_STEPS, TESTIMONIALS } from "@/lib/data"
import { getSiteContent } from "@/lib/site-content"
import { getPosts, catLabel, formatDate } from "@/lib/blog"
import PostCover from "@/components/blog/PostCover"
import Image from "next/image"

export const metadata = {
  alternates: { canonical: "/" },
}

const H2 = ({ children, sub }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
    <h2 className="serif" style={{ fontSize: 22 }}>{children}</h2>
    {sub && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{sub}</div>}
  </div>
)

export default async function Home() {
  const [nearby, categories, catalog] = await Promise.all([getFeaturedSalons(4), getCategories(), getCatalog()])
  const topCats = categories.slice(0, 4)
  // Cities that actually have a salon offering each category (max 10 each).
  const catCities = await Promise.all(topCats.map((c) => categoryCities(c.slug)))
  const latestPosts = (await getPosts()).slice(0, 3)
  const { hero, stats: STATS, faqs: FAQS } = await getSiteContent()
  // Popular prestations: real sub-categories (2 per top category), each routable
  // at /<slug> like any category.
  const popular = categories
    .flatMap((c) => (catalog.nodeBySlug[c.slug]?.childrenSlugs || []).slice(0, 2).map((s) => catalog.nodeBySlug[s]))
    .filter(Boolean)
    .slice(0, 8)
  return (
    <>
      <JsonLd data={faqLd(FAQS)} />

      {/* HERO */}
      <section style={{ position: "relative", borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg,#5E35B1 100%,#4527A0)" }}>
          <Photo label="Ambiance salon de beauté" >
            <Image src="/main/hero.jpeg" alt="Ambiance salon de beauté" fill style={{ objectFit: "cover" }} />
          </Photo>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,rgba(10, 0, 22, 1) 0%,rgba(16, 1, 36, 0.85) 46%,rgba(74,20,140,0.28) 78%,rgba(74,20,140,0.08) 100%)", pointerEvents: "none" }} />
        <div className="wrap" style={{ position: "relative", padding: "76px 24px 64px", pointerEvents: "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "6px 14px", fontSize: 11.5, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>
            {hero.badge}
          </div>
          <h1 className="serif" style={{ fontSize: 46, lineHeight: 1.12, maxWidth: 580, color: "#FFFFFF", marginTop: 16, marginBottom: 0, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            {hero.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, marginTop: 12, maxWidth: 460, lineHeight: 1.6, textShadow: "0 1px 12px rgba(0,0,0,0.55)" }}>
            {hero.subtitle}
          </p>
          <SearchBar />
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", pointerEvents: "auto" }}>
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="pill" style={{ fontSize: 12.5, fontWeight: 700, background: "rgba(255,253,248,0.96)", border: "1px solid rgba(42,36,28,0.1)", borderRadius: 999, padding: "7px 15px", whiteSpace: "nowrap", color: "#2A241C" }}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SALONS À PROXIMITÉ */}
      <section className="wrap" style={{ padding: "34px 24px 60px" }}>
        <H2 sub="Tunis et environs">Salons à proximité</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 18, marginTop: 18 }}>
          {nearby.map((s) => <SalonCard key={s.slug} salon={s} />)}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)" }}>
        <div className="wrap" style={{ padding: "48px 24px" }}>
          <H2 className="serif">Comment ça marche</H2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18, marginTop: 24 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={s.i} style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{ height: 170, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
                  <Photo label={["Cliente qui choisit son salon", "Coiffeuse au travail", "Cliente détendue au spa"][i]} />
                </div>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(124,77,255,0.12)", color: "var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, margin: "0 auto" }}>{s.i}</div>
                <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 12 }}>{s.t}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, marginTop: 6 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 36, justifyContent: "center", marginTop: 38, flexWrap: "wrap", borderTop: "1px solid var(--line-soft)", paddingTop: 28 }}>
            {STATS.map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div className="serif" style={{ fontSize: 28, color: "var(--gold-dark)" }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESTATIONS POPULAIRES */}
      <section className="wrap" style={{ padding: "44px 24px 8px" }}>
        <H2 sub="réservez directement la prestation qu'il vous faut">Prestations populaires</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12, marginTop: 16 }}>
          {popular.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`} className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "15px 17px", display: "flex", alignItems: "center", gap: 12, color: "var(--ink)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{catalog.nodeBySlug[s.top]?.name}</div>
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 800 }}>→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* REZERVY DANS VOTRE VILLE */}
      <section className="wrap" style={{ padding: "40px 24px 8px" }}>
        <H2 sub="coiffure, barbier, onglerie & spa partout en Tunisie">Rezervy dans votre ville</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "24px 20px", marginTop: 18 }}>
          {topCats.map((cat, i) => {
            const cityList = catCities[i].slice(0, 10)
            if (!cityList.length) return null
            return (
              <div key={cat.slug}>
                <Link href={`/${cat.slug}`} style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(124,77,255,0.12)", color: "var(--gold-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flex: "none" }}>{cat.name[0]}</span>
                  {cat.name}
                </Link>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 11 }}>
                  {cityList.map((c) => (
                    <Link key={c.slug} href={`/${cat.slug}/${c.slug}`} className="link-soft" style={{ fontSize: 12.5, color: "var(--muted)", padding: "3px 0" }}>
                      {cat.name} à {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="wrap" style={{ padding: "40px 24px 8px" }}>
        <H2 className="serif" style={{ fontSize: 22 }}>Elles nous font confiance</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 16 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.n} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--amber)", letterSpacing: 2 }}>★★★★★</div>
              <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.7, marginTop: 10 }}>« {t.txt} »</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#2A1A08" }}>{t.ini}</div>
                <div><div style={{ fontWeight: 800, fontSize: 12.5 }}>{t.n}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{t.city}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DERNIERS ARTICLES */}
      <section className="wrap" style={{ padding: "40px 24px 8px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <H2 className="serif" sub="conseils beauté & bien-être" style={{ fontSize: 22 }}>Nos derniers articles</H2>
          <div style={{ flex: 1 }} />
          <Link href="/blog" className="link-soft" style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-dark)" }}>Voir tout le blog →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18, marginTop: 16 }}>
          {latestPosts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "block", color: "var(--ink)" }}>
              <div style={{ height: 150, position: "relative" }}><PostCover post={p} sizes="(max-width: 780px) 100vw, 300px" /></div>
              <div style={{ padding: "14px 16px" }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{catLabel(p)}</span>
                <div className="serif" style={{ fontSize: 16.5, marginTop: 7, lineHeight: 1.3 }}>{p.title}</div>
                <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 7 }}>{p.excerpt}</p>
                <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 10 }}>{formatDate(p.date)} · {p.readMins} min</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ + CONTACT */}
      <section className="wrap" style={{ padding: "40px 24px" }}>
        <H2 className="serif" style={{ fontSize: 22 }}>Questions fréquentes</H2>
        <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: 28, marginTop: 16, alignItems: "start" }}>
          <FaqAccordion faqs={FAQS} />
          <ContactCard />
        </div>
      </section>

      {/* PRO CTA */}
      <section className="wrap" style={{ padding: "0 24px 56px" }}>
        <div style={{ background: "linear-gradient(140deg,#5E35B1,#7C4DFF)", borderRadius: 22, padding: "36px 32px", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 220, height: 150, flex: "none", borderRadius: 16, overflow: "hidden" }}><Photo label="Gérante devant son salon" /></div>
          <div style={{ minWidth: 260, flex: 1 }}>
            <h2 className="serif" style={{ fontSize: 24, color: "#FFFFFF" }}>Vous gérez un salon, un barbershop ou un spa ?</h2>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, marginTop: 8, maxWidth: 520 }}>
              Rejoignez Rezervy Pro : agenda intelligent, rappels SMS anti no-show, encaissement Flouci &amp; e-Dinar, fiches clients et statistiques — dès 49 TND/mois.
            </div>
          </div>
          <Link href="/devenir-partenaire" style={{ background: "#FFFFFF", color: "#2A241C", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap", flex: "none" }}>
            Découvrir Rezervy Pro
          </Link>
        </div>
      </section>
    </>
  )
}
