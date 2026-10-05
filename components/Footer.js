import Link from "next/link"
import { getCategories, getCities } from "@/lib/data"
import Logo from "./brand/Logo"
import NewsletterForm from "./newsletter/NewsletterForm"

const Social = ({ d, label }) => (
  <a href="#" aria-label={label} className="pill" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--line-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--muted-2)" }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  </a>
)

const Col = ({ title, children }) => (
  <div>
    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 14 }}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{children}</div>
  </div>
)
const textOf = (ch) => (Array.isArray(ch) ? ch.map(textOf).join("") : typeof ch === "string" || typeof ch === "number" ? String(ch) : "")
/* prefetch={false}: the footer sits on every page and its ~25 links would each
   be fully prefetched on scroll — ~100 RSC requests per page load for pages
   visitors rarely open. Navigation still works, it just fetches on click. */
const F = ({ href, children }) => (
  <Link href={href} prefetch={false} title={textOf(children).trim() || "Rezervy"} className="link-soft" style={{ fontSize: 13, color: "var(--muted)" }}>{children}</Link>
)

export default async function Footer() {
  const [categories, cities] = await Promise.all([getCategories(), getCities()])
  const footCities = cities.slice(0, 6)
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--footer-bg)", marginTop: 8 }}>
      <div className="wrap" style={{ padding: "40px 24px 20px" }}>
        {/* Newsletter */}
        <section className="nl-band" aria-labelledby="nl-band-title">
          <div className="nl-band-text">
            <h2 id="nl-band-title" className="nl-band-title">La newsletter Rezervy</h2>
            <p className="nl-band-sub">Nouveaux salons, conseils beauté et nouveautés — un e-mail de temps en temps, jamais de spam.</p>
          </div>
          <div className="nl-band-form">
            <NewsletterForm source="footer" />
            <p className="nl-fine">
              Désinscription en un clic. <Link href="/confidentialite" prefetch={false}>Confidentialité</Link>
            </p>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 30 }} className="footer-grid">
          {/* Brand */}
          <div>
            <Logo size={28} wordSize={24} />
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginTop: 10, maxWidth: 260 }}>
              La façon la plus simple de réserver coiffure, barbier, onglerie et spa en Tunisie — en ligne, 24h/24, sans frais.
            </p>
            <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
              <Social label="Instagram" d={<><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></>} />
              <Social label="Facebook" d={<path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />} />
              <Social label="TikTok" d={<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />} />
            </div>
          </div>

          <Col title="Découvrir">
            {categories.map((c) => <F key={c.slug} href={`/${c.slug}`}>{c.name}</F>)}
          </Col>
          <Col title="Villes populaires">
            {footCities.map((c) => <F key={c.slug} href={`/recherche/${c.slug}`}>Salons à {c.name}</F>)}
          </Col>
          <Col title="Rezervy">
            <F href="/devenir-partenaire">Devenir partenaire</F>
            <F href="/qui-sommes-nous">Qui sommes-nous</F>
            <F href="/blog">Blog</F>
            <F href="/carte-cadeau">Carte cadeau</F>
            <F href="/parrainage">Parrainage</F>
            <F href="/contact">Nous contacter</F>
          </Col>
          <Col title="Aide">
            <F href="/centre-aide">Centre d'aide</F>
            <F href="/assistant">Assistant Rezervy</F>
            <F href="/gerer-rendez-vous">Gérer un rendez-vous</F>
            <F href="/conditions-generales">Conditions générales</F>
            <F href="/confidentialite">Confidentialité</F>
          </Col>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 36, paddingTop: 18, borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--muted)" }}>
          <span>© 2026 Rezervy — la beauté, sur rendez-vous</span>
          <div style={{ flex: 1 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Tunisie · Français</span>
          <a href="https://pro.rezervy.io" target="_blank" rel="noopener noreferrer" className="link-soft" style={{ color: "var(--muted)" }}>Espace professionnel</a>
          <span>
            Conçu et développé par{" "}
            <a href="https://wisecode.tn" target="_blank" rel="noopener" className="link-soft" style={{ color: "var(--ink)", fontWeight: 700 }}>Wise Code</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
