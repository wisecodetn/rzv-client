/**
 * "Vérifié par Rezervy" — the trust badge our team awards from the admin
 * after checking a salon. It says Rezervy checked the salon, not that it is
 * open or bookable (that is publication, decided by the salon's profile).
 *
 * `VerifiedMark`: the small seal shown after a salon's name (cards, listings).
 * `VerifiedPill`: the labelled badge on the salon page.
 * Both draw in the theme's ink, so they read in light and dark.
 */
const SEAL =
  "M12 1.8l2.4 1.75 2.95-.2 1.03 2.77 2.53 1.53-.7 2.88 1.2 2.7-2.2 1.97-.42 2.93-2.94.48-1.93 2.24-2.72-1.16L9.08 22l-1.93-2.24-2.94-.48-.42-2.93-2.2-1.97 1.2-2.7-.7-2.88 2.53-1.53 1.03-2.77 2.95.2z"

export function VerifiedMark({ size = 15, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Vérifié par Rezervy"
      style={{ flex: "none", verticalAlign: "-0.15em", ...style }}
    >
      <title>Vérifié par Rezervy</title>
      <path d={SEAL} fill="var(--ink)" />
      <path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function VerifiedPill({ style }) {
  return (
    <span
      title="Ce salon a été vérifié par l’équipe Rezervy"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, color: "var(--ink)",
        background: "var(--accent-soft)", border: "1px solid var(--line-strong)", borderRadius: 999, padding: "4px 11px 4px 7px",
        whiteSpace: "nowrap", ...style,
      }}
    >
      <VerifiedMark size={15} style={{ verticalAlign: 0 }} />
      Vérifié par Rezervy
    </span>
  )
}
