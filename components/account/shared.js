"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { errorText } from "@/lib/errors"

/* Shared by the account sections (one file per page of /compte). */

export const Card = ({ children, style, ...rest }) => <div {...rest} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, ...style }}>{children}</div>
/** Each account section is its own page: its title is the page's h1. */
export const H = ({ children }) => <h1 className="serif" style={{ fontSize: 21, margin: "0 0 4px", fontWeight: 400 }}>{children}</h1>

/* ── Booking display helpers ─────────────────────────────────────── */
export const STATUS = {
  pending: { l: "En attente", c: "var(--gold-dark)", bg: "rgba(0,0,0,0.13)" },
  confirmed: { l: "Confirmé", c: "var(--green)", bg: "var(--green-soft)" },
  completed: { l: "Terminé", c: "var(--muted)", bg: "var(--accent-soft)" },
  cancelled: { l: "Annulé", c: "var(--red)", bg: "var(--red-soft)" },
  noshow: { l: "Non honoré", c: "var(--red)", bg: "var(--red-soft)" },
}
export const dMo = (iso) => new Date(iso).toLocaleDateString("fr-FR", { month: "short" })
export const dDd = (iso) => new Date(iso).getDate()
export const dTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")
export const dFull = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
export const dLong = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
export const durLabel = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}` : `${min} min`)

/** Payment recap line — mirrors the /rdv detail view ("acompte payé : …"). */
export const payInfo = (b) => {
  // No online payment: every amount here was handed over at the salon.
  if (b.coveredBy) return { c: "var(--gold-dark)", t: `✓ Séance de votre carnet « ${b.coveredBy} » — rien à régler` }
  if (b.payment === "deposit") return { c: "var(--gold-dark)", t: `✓ Avance réglée : ${b.depositTnd} TND — reste ${b.amountTnd - b.depositTnd} TND à régler au salon` }
  if (b.payment === "paid") return { c: "var(--gold-dark)", t: `✓ Réglé : ${b.amountTnd} TND` }
  if (b.payment === "refund") return { c: "var(--muted)", t: `Avance de ${b.depositTnd} TND — à voir avec le salon` }
  return { c: "var(--muted)", t: `Paiement sur place — total de ${b.amountTnd} TND` }
}

/**
 * One account API read. A failure is reported as `error` ("session" when the
 * login has expired, "network"/"server" otherwise) — it used to come back as
 * empty data, so an outage read as "Aucun rendez-vous" and 0 points.
 */
export function useAccountFetch(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch(`/api/account/${path}`)
      .then(async (r) => {
        if (!alive) return
        if (r.ok) setData(await r.json())
        else setError(r.status === 401 ? "session" : "server")
      })
      .catch(() => { if (alive) setError("network") })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path, tick])
  return { data, loading, error, reload }
}

/** What to show instead of a section's content when its data didn't load. */
export function LoadError({ error, reload }) {
  const session = error === "session"
  return (
    <Card role="alert" style={{ textAlign: "center", padding: "30px 20px" }}>
      <div style={{ fontWeight: 800, color: "var(--ink)" }}>
        {session ? "Votre session a expiré" : "Impossible de charger ces informations"}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>
        {session
          ? "Reconnectez-vous pour retrouver vos rendez-vous."
          : error === "network"
            ? "Connexion impossible. Vérifiez votre réseau et réessayez."
            : "Le service est momentanément indisponible. Réessayez dans un instant."}
      </div>
      {session ? (
        <Link
          href={`/connexion?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/compte")}`}
          className="btn-gold"
          style={{ display: "inline-block", marginTop: 14, background: "var(--gold)", color: "var(--on-gold)", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 13 }}
        >
          Se reconnecter
        </Link>
      ) : (
        <button
          type="button"
          onClick={reload}
          className="btn-outline"
          style={{ marginTop: 14, background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          Réessayer
        </button>
      )}
    </Card>
  )
}

/** POST/DELETE an account action; returns null on success, else a French message. */
export async function accountAction(url, method, fallback) {
  try {
    const res = await fetch(url, { method })
    if (res.ok) return null
    const d = await res.json().catch(() => null)
    return d?.message || fallback
  } catch (e) {
    return errorText(e, fallback)
  }
}

export const Empty = ({ title, sub, cta, href }) => (
  <Card style={{ textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontWeight: 800, color: "var(--muted)" }}>{title}</div>
    {sub && <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6 }}>{sub}</div>}
    {cta && <Link href={href} className="btn-outline" style={{ display: "inline-block", marginTop: 14, background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>{cta}</Link>}
  </Card>
)
