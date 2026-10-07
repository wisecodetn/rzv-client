import Link from "next/link"
import PageShell from "@/components/PageShell"
import { SITE } from "@/lib/site"
import { getPlans, fromLabel } from "@/lib/plans"
import { pageMeta } from "@/lib/meta"
import { getSiteContent } from "@/lib/site-content"

export const metadata = pageMeta({
  title: "Qui sommes-nous",
  description: "Rezervy, la marketplace beauté de Tunisie : notre mission, nos valeurs et l'équipe derrière la réservation en ligne de coiffure, barbier, onglerie et spa.",
  path: "/qui-sommes-nous",
})

const VALUES = [
  { t: "Simple", d: "Réserver en ligne 24h/24 — sans appel, sans attente." },
  { t: "Transparent", d: "Prix affichés avant de réserver, paiement au salon et confirmation par e-mail." },
  { t: "Local", d: "Nous soutenons les salons tunisiens avec des outils modernes de gestion." },
]

export default async function QuiSommesNous() {
  // The same figures as the home page, managed in admin (Site client →
  // Chiffres clés) with live {salons}/{villes} counts. These used to be
  // constants: "480+ salons", "65 000 rendez-vous / mois", "4,8/5".
  const [plans, { stats: STATS }] = await Promise.all([getPlans(), getSiteContent()])
  return (
    <PageShell
      title="Qui sommes-nous"
      subtitle="Rezervy est né d'une idée simple : réserver un rendez-vous beauté devrait être aussi facile que commander un taxi."
    >
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "24px 26px" }}>
        <div className="serif" style={{ fontSize: 20, marginBottom: 10 }}>Notre mission</div>
        <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8 }}>
          Nous connectons les clientes et les salons, barbershops et spas de Tunisie sur une seule
          plateforme. Pour vous : trouver, comparer et réserver en ligne, à toute heure. Pour les professionnels :
          un agenda intelligent, des rappels automatiques par e-mail et le suivi des encaissements — pour remplir
          leur planning et fidéliser leur clientèle.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 16 }}>
        {STATS.map((s) => (
          <div key={s.l} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
            <div className="serif" style={{ fontSize: 28, color: "var(--gold-dark)" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <h2 className="serif" style={{ fontSize: 20, margin: "34px 0 12px", fontWeight: 400 }}>Nos valeurs</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {VALUES.map((v) => (
          <div key={v.t} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--gold-dark)" }}>{v.t}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginTop: 6 }}>{v.d}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 20, padding: "30px 28px", marginTop: 34, textAlign: "center", color: "#FFFFFF" }}>
        <div className="serif" style={{ fontSize: 22 }}>Vous gérez un salon ?</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 8, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>Rejoignez Rezervy Pro et développez votre activité{plans ? ` — ${fromLabel(plans)}` : ""}.</div>
        <Link href="/devenir-partenaire" className="btn-on-dark" style={{ display: "inline-block", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 13.5, marginTop: 18 }}>Devenir partenaire</Link>
      </div>
    </PageShell>
  )
}
