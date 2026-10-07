"use client" // Error boundaries must be Client Components
import { useEffect } from "react"
import Link from "next/link"

/**
 * Something failed while rendering a page — most often the API being briefly
 * unreachable (the site no longer falls back to invented salons). Rendered
 * inside the root layout, so the navbar and footer stay usable.
 */
export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="wrap" role="alert" style={{ padding: "64px 24px 90px", maxWidth: 640, textAlign: "center" }}>
      <h1 className="serif" style={{ fontSize: 30, margin: 0, fontWeight: 400 }}>Un problème est survenu</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 12, lineHeight: 1.65 }}>
        Cette page n&apos;a pas pu s&apos;afficher. Cela arrive parfois quelques instants : réessayez, ou revenez à
        l&apos;accueil. Vos réservations ne sont pas affectées.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="btn-gold"
          style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
        >
          Réessayer
        </button>
        <Link href="/" className="btn-outline" style={{ background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14 }}>
          Retour à l&apos;accueil
        </Link>
      </div>
      {error?.digest && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 22 }}>Référence : {error.digest}</div>}
    </div>
  )
}
