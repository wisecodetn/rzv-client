import { SITE } from "@/lib/site"
import { getPlans, fromLabel, formatPrice } from "@/lib/plans"
import Image from "next/image"
import Photo from "@/components/Photo"
import { pageMeta } from "@/lib/meta"
import { getCoverage } from "@/lib/data"

// Today rzv-pro.wisecode.tn, pro.rezervy.io at launch (NEXT_PUBLIC_PRO_URL).
const PRO_URL = SITE.proUrl

// Price and trial come from the plans billing actually charges (see lib/plans).
const offer = (pl) =>
  [pl ? `${fromLabel(pl).replace(/^d/, "D")}` : "", pl?.trialDays ? `essai gratuit ${pl.trialDays} jours` : ""].filter(Boolean).join(", ")

export async function generateMetadata() {
  const pl = await getPlans()
  const tail = offer(pl)
  return pageMeta({
    title: "Devenir partenaire — Rezervy Pro pour les salons",
    description: `Développez votre salon, barbershop ou spa avec Rezervy Pro : agenda intelligent, rappels par e-mail, suivi des encaissements, fiches clients et statistiques.${tail ? ` ${tail}.` : ""}`,
    path: "/devenir-partenaire",
  })
}

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const BENEFITS = [
  { t: "Agenda intelligent", d: "Planning multi-praticien, réservation en ligne 24h/24, gestion des créneaux et des pauses en un clic.", d2: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { t: "Rappels automatiques", d: "Confirmation et rappel envoyés par e-mail à vos clientes avant chaque rendez-vous.", d2: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { t: "Suivi des encaissements", d: "Avances et soldes enregistrés à chaque rendez-vous — le paiement se fait au salon.", d2: "M2 7h20v13H2z M2 11h20 M6 15h4" },
  { t: "Fiches clients & fidélité", d: "Annuaire partagé, historique des visites, notes et points de fidélité de chaque cliente.", d2: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87" },
  { t: "Statistiques & revenus", d: "Chiffre d'affaires, taux d'occupation, prestations les plus rentables — vos chiffres, en clair.", d2: "M3 3v18h18 M7 14l3-3 3 3 4-5" },
  { t: "Liste d'attente", d: "Proposez les créneaux libérés aux clientes en attente, directement dans leur compte.", d2: "M12 8v4l3 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
]

export default async function PartnerPage() {
  const [pl, { cities }] = await Promise.all([getPlans(), getCoverage()])
  // Real figures only: salons and cities on the site right now (this block
  // used to claim "+50% de réservations", "4× moins de no-show"…).
  const salonCount = Object.values(cities).reduce((t, n) => t + n, 0)
  const STATS = [
    ...(salonCount > 0 ? [{ v: String(salonCount), l: salonCount > 1 ? "salons en ligne sur Rezervy" : "salon en ligne sur Rezervy" }] : []),
    ...(Object.keys(cities).length > 0 ? [{ v: String(Object.keys(cities).length), l: Object.keys(cities).length > 1 ? "villes couvertes" : "ville couverte" }] : []),
    { v: "24h/24", l: "réservable, même fermé" },
    { v: "0 %", l: "de commission sur vos rendez-vous" },
  ]
  return (
    <>
      {/* Hero */}
      <section style={{ position: "relative", background: "linear-gradient(120deg,#1a1a1a,#000000 58%,#333333)", color: "#FFFFFF" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Photo label="Gérante devant son salon">
            <Image src="/main/pro-manage.webp" alt="Gérante devant son salon" fill sizes="100vw" loading="eager" fetchPriority="high" style={{ objectFit: "cover" }} />
          </Photo>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.65) 46%,rgba(0,0,0,0.3) 78%,rgba(0,0,0,0.15) 100%)", pointerEvents: "none" }} />
        <div className="wrap" style={{ position: "relative", padding: "72px 24px 66px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "6px 14px", fontSize: 11.5, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>
            Rezervy Pro · pour les salons, barbershops & spas
          </div>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.1, maxWidth: 640, marginTop: 16, marginBottom: 0, fontWeight: 400 }}>
            Développez votre salon avec Rezervy Pro
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15.5, marginTop: 14, maxWidth: 560, lineHeight: 1.65 }}>
            Rejoignez les salons de Tunisie qui reçoivent leurs réservations en ligne. Un agenda 24h/24, des rappels automatiques
            par e-mail et le suivi de vos encaissements{pl ? ` — le tout ${fromLabel(pl)}` : ""}.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "#FFFFFF", color: "#000000", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 800, fontSize: 14 }}>Devenir partenaire</a>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "14px 24px", fontWeight: 700, fontSize: 14 }}>Déjà partenaire ? Se connecter</a>
          </div>
          <div style={{ display: "flex", gap: 34, marginTop: 40, flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.l}>
                <div className="serif" style={{ fontSize: 30, color: "#e0e0e0" }}>{s.v}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="wrap" style={{ padding: "54px 24px 20px" }}>
        <div className="serif" style={{ fontSize: 27, textAlign: "center" }}>Tout ce qu'il faut pour remplir votre agenda</div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", textAlign: "center", marginTop: 8, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Une seule plateforme pour la réservation, l'encaissement, vos clientes et vos statistiques.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 30 }}>
          {BENEFITS.map((b) => (
            <div key={b.t} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 22px 24px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={b.d2} /></div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 14 }}>{b.t}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginTop: 6 }}>{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How to join */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)", marginTop: 34 }}>
        <div className="wrap" style={{ padding: "48px 24px" }}>
          <div className="serif" style={{ fontSize: 24, textAlign: "center" }}>Rejoignez Rezervy en 3 étapes</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18, marginTop: 26 }}>
            {[["1", "Créez votre demande", "Renseignez votre établissement : notre équipe vérifie votre demande avant d’ouvrir votre compte."], ["2", "Configurez votre salon", "Prestations, équipe, horaires et moyens de paiement en quelques minutes."], ["3", "Recevez vos réservations", "Votre page publique est en ligne : les clientes réservent, vous êtes notifié·e."]].map(([i, t, d]) => (
              <div key={i} style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, margin: "0 auto" }}>{i}</div>
                <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 12 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, marginTop: 6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / final CTA */}
      <section className="wrap" style={{ padding: "48px 24px 64px" }}>
        <div style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 22, padding: "40px 34px", textAlign: "center", color: "#FFFFFF" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Abonnement mensuel ou annuel</div>
          <div className="serif" style={{ fontSize: 34, marginTop: 10 }}>{pl ? fromLabel(pl).replace(/^d/, "D") : "Nos offres Rezervy Pro"}</div>
          {/* The plans on sale, straight from billing — names, prices, taglines. */}
          {pl && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 22, textAlign: "left" }}>
              {pl.plans.map((p) => (
                <div key={p.tier} style={{ border: `1px solid ${p.featured ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.22)"}`, borderRadius: 16, padding: "16px 18px", background: "rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</span>
                    {p.featured && <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "2px 9px", background: "#FFFFFF", color: "#000000" }}>Recommandé</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className="serif" style={{ fontSize: 26 }}>{formatPrice(p.price)}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}> {p.currency}/{p.period}</span>
                  </div>
                  {p.yearlyPrice != null && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>ou {formatPrice(p.yearlyPrice)} {p.currency}/an</div>}
                  {p.tagline && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginTop: 8 }}>{p.tagline}</div>}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 18, maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            {pl?.trialDays ? `Essai gratuit ${pl.trialDays} jours. ` : ""}Pas de commission sur vos rendez-vous : vos clientes vous règlent directement, vous gardez 100 % de ce qu’elles paient.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "#FFFFFF", color: "#000000", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 800, fontSize: 14 }}>{pl?.trialDays ? "Commencer l’essai gratuit" : "Faire une demande"}</a>
          </div>
        </div>
      </section>
    </>
  )
}
