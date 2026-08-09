"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../AuthProvider"

const STEPS = [
  ["1", "Partagez votre code", "Envoyez votre code de parrainage à vos amies."],
  ["2", "Elles réservent", "Elles profitent de −20% sur leur première visite."],
  ["3", "Vous gagnez", "Vous recevez 50 points à chacune de leurs venues."],
]

export default function ParrainagePanel() {
  const { user } = useAuth()
  const code = user ? (user.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "AMI") + "25" : "REZERVY25"
  const link = `https://rezervy.tn/?ref=${code}`
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(`Réserve ton salon sur Rezervy avec mon code ${code} et profite de −20% : ${link}`)}`

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <div style={{ background: "linear-gradient(150deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 24, color: "#F8F0E2" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#D9BE97" }}>Votre code</div>
          <div className="serif" style={{ fontSize: 34, marginTop: 8, letterSpacing: "0.04em" }}>{code}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={copy} style={{ background: "var(--gold-light)", color: "#2A1A08", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>{copied ? "✓ Copié" : "Copier le code"}</button>
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(253,248,239,0.14)", color: "#FDF8EF", border: "1px solid rgba(253,248,239,0.3)", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5 }}>Partager sur WhatsApp</a>
          </div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Ce que vous gagnez</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {[["−20%", "pour votre amie sur sa 1re réservation"], ["50 pts", "pour vous à chaque venue de votre filleule"], ["Sans limite", "parrainez autant d'amies que vous voulez"]].map(([v, d]) => (
              <div key={d} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "var(--gold-dark)", width: 78, flex: "none" }}>{v}</span>
                <span style={{ fontSize: 13, color: "var(--muted-2)" }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="serif" style={{ fontSize: 20, margin: "34px 0 12px" }}>Comment ça marche</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {STEPS.map(([n, t, d]) => (
          <div key={n} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(169,124,72,0.12)", color: "var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{n}</div>
            <div style={{ fontWeight: 800, fontSize: 14, marginTop: 12 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 5 }}>{d}</div>
          </div>
        ))}
      </div>

      {!user && (
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 20 }}>
          <Link href="/connexion" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Connectez-vous</Link> pour obtenir votre code personnalisé et suivre vos parrainages.
        </div>
      )}
    </>
  )
}
