import Link from "next/link"
import PageShell from "@/components/PageShell"
import FaqAccordion from "@/components/FaqAccordion"
import { getSiteContent } from "@/lib/site-content"

export const metadata = {
  title: "Centre d'aide",
  description: "Besoin d'aide ? Retrouvez les réponses aux questions les plus fréquentes sur la réservation, le paiement, l'annulation et la fidélité Rezervy.",
  alternates: { canonical: "/centre-aide" },
}

const TOPICS = [
  { t: "Réserver", d: "Trouver un salon, choisir un créneau, confirmer.", icon: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { t: "Paiement & acompte", d: "Flouci, e-Dinar, carte et acomptes.", icon: "M2 7h20v13H2z M2 11h20 M6 15h4" },
  { t: "Annuler / déplacer", d: "Gérer un rendez-vous existant.", icon: "M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4" },
  { t: "Fidélité & abonnements", d: "Points, parrainage et forfaits.", icon: "M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 20.2 6.8 18.1l1-5.8L3.5 8.2l5.9-.9z" },
]

export default async function CentreAide() {
  const { faqs: FAQS } = await getSiteContent()
  return (
    <PageShell
      title="Centre d'aide"
      subtitle="Trouvez rapidement une réponse. Si vous ne trouvez pas, notre équipe est là pour vous."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {TOPICS.map((t) => (
          <div key={t.t} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,0,0,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
            </span>
            <div style={{ fontWeight: 800, fontSize: 14, marginTop: 12 }}>{t.t}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.55 }}>{t.d}</div>
          </div>
        ))}
      </div>

      <div className="serif" style={{ fontSize: 20, margin: "34px 0 4px" }}>Questions fréquentes</div>
      <FaqAccordion faqs={FAQS} />

      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Vous n'avez pas trouvé votre réponse ?</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Notre équipe vous répond sous 24h.</div>
        </div>
        <Link href="/contact" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>Nous contacter</Link>
      </div>
    </PageShell>
  )
}
