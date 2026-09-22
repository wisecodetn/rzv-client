import Link from "next/link"

const SUGGESTIONS = [
  { href: "/qui-sommes-nous", l: "Qui sommes-nous", d: "Notre mission", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 16v-4 M12 8h.01" },
  { href: "/carte-cadeau", l: "Carte cadeau", d: "Offrir un moment beauté", icon: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" },
  { href: "/parrainage", l: "Parrainage", d: "Invitez, gagnez des points", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8" },
  { href: "/contact", l: "Nous contacter", d: "On vous répond sous 24h", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6" },
  { href: "/centre-aide", l: "Centre d'aide", d: "Questions fréquentes", icon: "M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3 M12 17h.01 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
  { href: "/gerer-rendez-vous", l: "Gérer un rendez-vous", d: "Avec votre référence", icon: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { href: "/conditions-generales", l: "Conditions générales", d: "Nos CGU", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6" },
  { href: "/confidentialite", l: "Confidentialité", d: "Vos données", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" },
]

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "56px 24px 80px", maxWidth: 900, textAlign: "center" }}>
      <div className="serif" style={{ fontSize: 84, lineHeight: 1, color: "var(--gold)", letterSpacing: "0.02em" }}>404</div>
      <h1 className="serif" style={{ fontSize: 30, margin: "12px 0 0", fontWeight: 400 }}>Page introuvable</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 10, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.65 }}>
        La page que vous cherchez a été déplacée ou n'existe plus. Voici quelques pistes pour retrouver votre chemin.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <Link href="/" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14 }}>Retour à l'accueil</Link>
        <Link href="/recherche" className="btn-outline" style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.45)", color: "var(--gold-dark)", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14 }}>Explorer les salons</Link>
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 44, marginBottom: 14 }}>Pages utiles</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12, textAlign: "left" }}>
        {SUGGESTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card-hover" style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", color: "var(--ink)" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(0,0,0,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 800, fontSize: 13.5 }}>{s.l}</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{s.d}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
