"use client"
import { useState } from "react"

const SLOTS = ["Jeu 24, 11h30", "Jeu 24, 15h00", "Ven 25, 16h30", "Lun 28, 10h00", "Lun 28, 14h00", "Mar 29, 9h30"]

export default function ManageRdv({ code = "RZV-4821" }) {
  const [state, setState] = useState("view") // view | res | done | cancelled
  const [pick, setPick] = useState(null)
  const [when, setWhen] = useState("ven. 25 juillet, 10h00")

  const sel = (on) => (on ? ["rgba(169,124,72,0.6)", "rgba(169,124,72,0.09)"] : ["var(--line-2)", "transparent"])

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--muted)", background: "var(--surface-2)", borderRadius: 999, padding: "7px 15px", width: "fit-content" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v2 M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z" /></svg>
        Lien sécurisé reçu par SMS
      </div>
      <h1 className="serif" style={{ fontSize: 26, marginTop: 16, marginBottom: 0, fontWeight: 400 }}>Votre rendez-vous</h1>

      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 20, marginTop: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>Coupe &amp; brushing</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{when} · avec Amira · Maison Yasmine, La Marsa</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Réf. {code} · acompte payé : 18 TND (Flouci)</div>
        {state === "view" && (
          <>
            <div style={{ display: "flex", gap: 9, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={() => { setState("res"); setPick(null) }} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 11, padding: "11px 18px", fontWeight: 800, fontSize: 12.5, flex: "none" }}>Reprogrammer</button>
              <button onClick={() => setState("cancelled")} style={{ background: "transparent", border: "1px solid var(--red-soft)", color: "var(--red)", borderRadius: 11, padding: "11px 18px", fontWeight: 700, fontSize: 12.5, flex: "none" }}>Annuler le rendez-vous</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>Annulation gratuite jusqu'à 24h avant — au-delà, l'acompte est conservé par le salon.</div>
          </>
        )}
      </div>

      {state === "res" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 20, marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nouveaux créneaux disponibles — Amira</div>
          <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
            {SLOTS.map((l, i) => {
              const on = pick === i
              const [bd, bg] = sel(on)
              return <button key={i} onClick={() => setPick(i)} style={{ fontSize: 12.5, fontWeight: 700, border: `1px solid ${bd}`, background: bg, borderRadius: 10, padding: "9px 14px", color: on ? "var(--gold-dark)" : "var(--muted-2)", whiteSpace: "nowrap" }}>{l}</button>
            })}
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
            <div style={{ flex: 1 }} />
            <button onClick={() => setState("view")} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 12.5 }}>Annuler</button>
            <button onClick={() => { if (pick != null) { setWhen(SLOTS[pick]); setState("done") } }} style={{ background: pick != null ? "var(--gold)" : "#E2D9C6", color: pick != null ? "#FDF8EF" : "var(--faint)", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, cursor: pick != null ? "pointer" : "default" }}>Confirmer le nouveau créneau</button>
          </div>
        </div>
      )}

      {state === "done" && (
        <div style={{ background: "var(--green-soft)", border: "1px solid var(--green-soft)", borderRadius: 14, padding: "14px 18px", marginTop: 14, fontSize: 13, color: "var(--green)", fontWeight: 700 }}>✓ Rendez-vous reprogrammé — confirmation SMS envoyée.</div>
      )}
      {state === "cancelled" && (
        <div style={{ background: "rgba(192,91,91,0.07)", border: "1px solid var(--red-soft)", borderRadius: 14, padding: "14px 18px", marginTop: 14, fontSize: 13, color: "var(--red)", fontWeight: 700 }}>Rendez-vous annulé. Votre acompte de 18 TND sera remboursé sous 3 jours ouvrés.</div>
      )}
    </div>
  )
}
