import { SITE } from "@/lib/site"

const PRO_URL = "https://pro.rezervy.tn"

export const metadata = {
  title: "Devenir partenaire — Rezervy Pro pour les salons",
  description:
    "Développez votre salon, barbershop ou spa avec Rezervy Pro : agenda intelligent, rappels SMS anti no-show, encaissement Flouci & e-Dinar, fiches clients et statistiques. Dès 49 TND/mois, essai gratuit 14 jours.",
  alternates: { canonical: "/devenir-partenaire" },
  openGraph: {
    title: "Devenir partenaire — Rezervy Pro · Rezervy",
    description: "Agenda intelligent, rappels SMS anti no-show, encaissement en ligne, fiches clients et stats. Dès 49 TND/mois.",
    url: `${SITE.url}/devenir-partenaire`,
  },
}

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const BENEFITS = [
  { t: "Agenda intelligent", d: "Planning multi-praticien, réservation en ligne 24h/24, gestion des créneaux et des pauses en un clic.", d2: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { t: "Rappels SMS anti no-show", d: "Confirmation et rappel automatiques par SMS — jusqu'à 4× moins d'absences et de créneaux perdus.", d2: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { t: "Encaissement en ligne", d: "Acomptes automatiques par Flouci, e-Dinar SmartPay ou carte. Le solde se règle au salon.", d2: "M2 7h20v13H2z M2 11h20 M6 15h4" },
  { t: "Fiches clients & fidélité", d: "Annuaire partagé, historique, préférences, points de fidélité et parrainage intégrés.", d2: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87" },
  { t: "Statistiques & revenus", d: "Chiffre d'affaires, taux d'occupation, prestations les plus rentables — vos chiffres, en clair.", d2: "M3 3v18h18 M7 14l3-3 3 3 4-5" },
  { t: "Liste d'attente & marketing", d: "Remplissez les créneaux libérés automatiquement et relancez vos clientes par SMS.", d2: "M12 8v4l3 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
]
const STATS = [
  { v: "+50%", l: "de réservations en ligne" },
  { v: "4×", l: "moins de no-show" },
  { v: "50%", l: "des RDV pris hors horaires" },
  { v: "24h/24", l: "réservable, même fermé" },
]

export default function PartnerPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(120deg,#4527A0,#5E35B1 58%,#7C4DFF)", color: "#FFFFFF" }}>
        <div className="wrap" style={{ padding: "72px 24px 66px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(253,248,239,0.14)", border: "1px solid rgba(253,248,239,0.25)", borderRadius: 999, padding: "6px 14px", fontSize: 11.5, fontWeight: 700, color: "#F0E4CE", letterSpacing: "0.04em" }}>
            Rezervy Pro · pour les salons, barbershops & spas
          </div>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.1, maxWidth: 640, marginTop: 16, marginBottom: 0, fontWeight: 400 }}>
            Développez votre salon avec Rezervy Pro
          </h1>
          <p style={{ color: "rgba(253,248,239,0.9)", fontSize: 15.5, marginTop: 14, maxWidth: 560, lineHeight: 1.65 }}>
            Rejoignez 480+ établissements en Tunisie. Un agenda qui se remplit tout seul, des rappels SMS qui suppriment
            les no-show, et l'encaissement Flouci & e-Dinar — le tout dès 49 TND/mois.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "#FFFFFF", color: "#7C4DFF", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 800, fontSize: 14 }}>Devenir partenaire</a>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "14px 24px", fontWeight: 700, fontSize: 14 }}>Voir une démo</a>
          </div>
          <div style={{ display: "flex", gap: 34, marginTop: 40, flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.l}>
                <div className="serif" style={{ fontSize: 30, color: "#B388FF" }}>{s.v}</div>
                <div style={{ fontSize: 12.5, color: "rgba(253,248,239,0.75)", marginTop: 2 }}>{s.l}</div>
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
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,77,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={b.d2} /></div>
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
            {[["1", "Créez votre demande", "Renseignez votre établissement et vos documents — validation sous 48h."], ["2", "Configurez votre salon", "Prestations, équipe, horaires et moyens de paiement en quelques minutes."], ["3", "Recevez vos réservations", "Votre page publique est en ligne : les clientes réservent, vous êtes notifié·e."]].map(([i, t, d]) => (
              <div key={i} style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(124,77,255,0.12)", color: "var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, margin: "0 auto" }}>{i}</div>
                <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 12 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, marginTop: 6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / final CTA */}
      <section className="wrap" style={{ padding: "48px 24px 64px" }}>
        <div style={{ background: "linear-gradient(140deg,#5E35B1,#7C4DFF)", borderRadius: 22, padding: "40px 34px", textAlign: "center", color: "#FFFFFF" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Sans engagement</div>
          <div className="serif" style={{ fontSize: 34, marginTop: 10 }}>Dès 49 TND / mois</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 8, maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Essai gratuit 14 jours. Pas de commission sur vos rendez-vous, pas de frais cachés — vous gardez 100% de vos revenus.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <a href={PRO_URL} target="_blank" rel="noopener noreferrer" style={{ background: "#FFFFFF", color: "#7C4DFF", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 800, fontSize: 14 }}>Commencer gratuitement</a>
          </div>
        </div>
      </section>
    </>
  )
}
