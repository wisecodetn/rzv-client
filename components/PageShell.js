import Link from "next/link"

/** Shared header for simple content pages: breadcrumb + serif title + subtitle. */
export default function PageShell({ title, subtitle, crumb, children, maxWidth = 1120 }) {
  return (
    <div className="wrap" style={{ padding: "32px 24px 72px", maxWidth }}>
      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{crumb || title}</span>
      </nav>
      <h1 className="serif" style={{ fontSize: 34, margin: "14px 0 0", fontWeight: 400 }}>{title}</h1>
      {subtitle && <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>{subtitle}</p>}
      <div style={{ marginTop: 26 }}>{children}</div>
    </div>
  )
}

export function Section({ h, children }) {
  return (
    <section style={{ marginTop: 26 }}>
      {h && <div className="serif" style={{ fontSize: 19, marginBottom: 10 }}>{h}</div>}
      <div style={{ fontSize: 13.5, color: "var(--muted-2)", lineHeight: 1.8 }}>{children}</div>
    </section>
  )
}
