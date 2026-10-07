import Link from "next/link"

/**
 * An honest placeholder for a feature that is announced but not built. The
 * gift-card form used to report "Carte cadeau envoyée !" without sending or
 * charging anything, and the referral page handed out codes no booking would
 * accept — a button that lies is worse than no button.
 */
export default function ComingSoon({ children }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "24px 26px", maxWidth: 640 }}>
      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 11px", background: "var(--accent-soft)", color: "var(--gold-dark)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
        Bientôt disponible
      </span>
      <div style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.7, marginTop: 12 }}>{children}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <Link href="/recherche" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 13.5 }}>
          Trouver un salon
        </Link>
        <Link href="/contact" className="btn-outline" style={{ background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 13.5 }}>
          Nous contacter
        </Link>
      </div>
    </div>
  )
}
