import Link from "@/components/Link"

/**
 * Mode vitrine — a salon Rezervy shows before it has joined: no booking, no
 * contact (the API sends none). Said plainly where the "Réserver" button and the
 * contact card would be, with the way in for the salon itself.
 *
 * `compact`: one line, for the header and the phone bar.
 */
export default function PreviewNotice({ name, compact = false, style }) {
  if (compact) {
    return (
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, ...style }}>
        Réservation en ligne bientôt disponible
      </span>
    )
  }
  return (
    <div style={{ background: "var(--card)", border: "1px dashed var(--accent-line)", borderRadius: 16, padding: "16px 18px", ...style }}>
      <div style={{ fontWeight: 800, fontSize: 13.5 }}>Fiche vitrine</div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "6px 0 10px" }}>
        {name} n’est pas encore sur Rezervy. La réservation en ligne et ses coordonnées seront disponibles dès que le salon
        rejoindra Rezervy.
      </p>
      <Link href="/devenir-partenaire" style={{ fontSize: 12.5, fontWeight: 800, color: "var(--gold-dark)" }}>
        C’est votre salon ? Rejoignez Rezervy →
      </Link>
    </div>
  )
}
