import Link from "next/link"
import Photo from "@/components/Photo"
import SearchBar from "@/components/SearchBar"
import SalonCard from "@/components/SalonCard"
import FaqAccordion from "@/components/FaqAccordion"
import ContactCard from "@/components/ContactCard"
import JsonLd from "@/components/JsonLd"
import { faqLd } from "@/lib/jsonld"
import { getFeaturedSalons, getCategories, getCities, HOW_STEPS, POP_SVCS, TESTIMONIALS, FAQS, STATS } from "@/lib/data"

export const metadata = {
  alternates: { canonical: "/" },
}

const H2 = ({ children, sub }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
    <div className="serif" style={{ fontSize: 22 }}>{children}</div>
    {sub && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{sub}</div>}
  </div>
)

export default async function Home() {
  const [nearby, categories, cities] = await Promise.all([getFeaturedSalons(4), getCategories(), getCities()])
  return (
    <>
      <JsonLd data={faqLd(FAQS)} />

      {/* HERO */}
      <section style={{ position: "relative", borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg,#241A10,#4A3620 55%,#2A1F12)" }}>
          <Photo label="Ambiance salon de beauté" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,rgba(26,18,8,0.92) 0%,rgba(26,18,8,0.72) 46%,rgba(26,18,8,0.28) 78%,rgba(26,18,8,0.08) 100%)", pointerEvents: "none" }} />
        <div className="wrap" style={{ position: "relative", padding: "76px 24px 64px", pointerEvents: "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(253,248,239,0.14)", backdropFilter: "blur(6px)", border: "1px solid rgba(253,248,239,0.25)", borderRadius: 999, padding: "6px 14px", fontSize: 11.5, fontWeight: 700, color: "#F0E4CE", letterSpacing: "0.04em" }}>
            ★ 4,8 / 5 · 65 000 rendez-vous chaque mois
          </div>
          <h1 className="serif" style={{ fontSize: 46, lineHeight: 1.12, maxWidth: 580, color: "#FDF8EF", marginTop: 16, marginBottom: 0, textShadow: "0 2px 24px rgba(26,18,8,0.4)", fontWeight: 400 }}>
            Réservez votre moment beauté, partout en Tunisie
          </h1>
          <p style={{ color: "rgba(253,248,239,0.9)", fontSize: 15, marginTop: 12, maxWidth: 460, lineHeight: 1.6, textShadow: "0 1px 12px rgba(26,18,8,0.55)" }}>
            Coiffure, barbier, onglerie, spa — réservation en ligne 24h/24, confirmation par SMS.
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
          <div className="serif" style={{ fontSize: 24, textAlign: "center" }}>Comment ça marche</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 24 }}>
            {["Cliente qui choisit son salon", "Coiffeuse au travail", "Cliente détendue au spa"].map((l, i) => (
              <div key={i} style={{ height: 170, borderRadius: 16, overflow: "hidden" }}><Photo label={l} /></div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18, marginTop: 22 }}>
            {HOW_STEPS.map((s) => (
              <div key={s.i} style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(169,124,72,0.12)", color: "var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, margin: "0 auto" }}>{s.i}</div>
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

      {/* SERVICES POPULAIRES */}
      <section className="wrap" style={{ padding: "44px 24px 8px" }}>
        <H2 sub="prix moyens constatés en Tunisie">Services populaires</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12, marginTop: 16 }}>
          {POP_SVCS.map((p) => (
            <Link key={p.n} href={`/${p.cat}`} className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "15px 17px", display: "flex", alignItems: "center", gap: 12, color: "var(--ink)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{p.n}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{p.c}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>dès <span style={{ fontWeight: 800, color: "var(--ink)" }}>{p.p} TND</span></div>
            </Link>
          ))}
        </div>
      </section>

      {/* REZERVY DANS VOTRE VILLE */}
      <section className="wrap" style={{ padding: "40px 24px 8px" }}>
        <H2 sub="coiffure, barbier, onglerie & spa partout en Tunisie">Rezervy dans votre ville</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "24px 20px", marginTop: 18 }}>
          {categories.slice(0, 4).map((cat) => (
            <div key={cat.slug}>
              <Link href={`/${cat.slug}`} style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(169,124,72,0.12)", color: "var(--gold-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flex: "none" }}>{cat.name[0]}</span>
                {cat.name}
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 11 }}>
                {cities.map((c) => (
                  <Link key={c.slug} href={`/${cat.slug}/${c.slug}`} className="link-soft" style={{ fontSize: 12.5, color: "var(--muted)", padding: "3px 0" }}>
                    {cat.name} à {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="wrap" style={{ padding: "40px 24px 8px" }}>
        <div className="serif" style={{ fontSize: 22 }}>Elles nous font confiance</div>
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

      {/* FAQ + CONTACT */}
      <section className="wrap" style={{ padding: "40px 24px" }}>
        <div className="serif" style={{ fontSize: 22 }}>Questions fréquentes</div>
        <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: 28, marginTop: 16, alignItems: "start" }}>
          <FaqAccordion faqs={FAQS} />
          <ContactCard />
        </div>
      </section>

      {/* PRO CTA */}
      <section className="wrap" style={{ padding: "0 24px 56px" }}>
        <div style={{ background: "linear-gradient(140deg,#3A2B1A,#6B4E2E)", borderRadius: 22, padding: "36px 32px", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 220, height: 150, flex: "none", borderRadius: 16, overflow: "hidden" }}><Photo label="Gérante devant son salon" /></div>
          <div style={{ minWidth: 260, flex: 1 }}>
            <div className="serif" style={{ fontSize: 24, color: "#F8F0E2" }}>Vous gérez un salon, un barbershop ou un spa ?</div>
            <div style={{ fontSize: 13, color: "#D9BE97", lineHeight: 1.7, marginTop: 8, maxWidth: 520 }}>
              Rejoignez Rezervy Pro : agenda intelligent, rappels SMS anti no-show, encaissement Flouci &amp; e-Dinar, fiches clients et statistiques — dès 49 TND/mois.
            </div>
          </div>
          <Link href="/devenir-partenaire" style={{ background: "var(--gold-light)", color: "#2A1A08", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap", flex: "none" }}>
            Découvrir Rezervy Pro
          </Link>
        </div>
      </section>
    </>
  )
}
