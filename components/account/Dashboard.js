"use client"
import Link from "next/link"
import { useAuth } from "../AuthProvider"
import { H, dMo, dDd, dTime, useAccountFetch, LoadError } from "./shared"

/* ── Tableau de bord ─────────────────────────────────────────────── */
export function Dashboard() {
  const { user } = useAuth()
  const { data: ov, error: ovErr, reload: ovReload } = useAccountFetch("overview")
  if (!user) return null
  const first = user.name.split(" ")[0]
  const next = ov?.nextBooking
  const stats = [
    { l: "Prochains RDV", v: ov ? ov.counts.upcoming : "…", href: "/compte/rendez-vous" },
    { l: "Points fidélité", v: ov ? ov.counts.points : "…", href: "/compte/abonnements" },
    { l: "Favoris", v: ov ? ov.counts.favorites : "…", href: "/compte/favoris" },
    { l: "Visites", v: ov ? ov.counts.visits : "…", href: "/compte/rendez-vous" },
  ]
  return (
    <>
      <H>Bonjour {first} 👋</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Voici un aperçu de votre compte Rezervy.</div>
      {ovErr && <div style={{ marginBottom: 14 }}><LoadError error={ovErr} reload={ovReload} /></div>}

      {next ? (
        <div style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 18, padding: 20, color: "#FFFFFF", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 58, textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "9px 0", flex: "none" }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>{dMo(next.startAt)}</div>
            <div style={{ fontSize: 21, fontWeight: 800 }}>{dDd(next.startAt)}</div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.9)" }}>Prochain rendez-vous</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{next.service}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{dTime(next.startAt)} · {next.salon?.name}{next.salon?.city ? `, ${next.salon.city}` : ""}</div>
          </div>
          <Link href="/compte/rendez-vous" style={{ background: "#FFFFFF", color: "#000000", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }}>Gérer</Link>
        </div>
      ) : (
        <div style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 18, padding: 22, color: "#FFFFFF", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Aucun rendez-vous à venir</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>Trouvez votre salon et réservez en quelques clics.</div>
          </div>
          <Link href="/recherche" style={{ background: "#FFFFFF", color: "#000000", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }}>Réserver</Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 14 }}>
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", textAlign: "left", display: "block", color: "var(--ink)", minWidth: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.l}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <Link href="/recherche" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 11, padding: "12px 20px", fontWeight: 800, fontSize: 13 }}>Réserver un nouveau rendez-vous</Link>
        <Link href="/compte/favoris" className="btn-outline" style={{ background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 11, padding: "12px 20px", fontWeight: 800, fontSize: 13 }}>Voir mes favoris</Link>
      </div>
    </>
  )
}
