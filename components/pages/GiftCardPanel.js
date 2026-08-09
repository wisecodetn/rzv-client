"use client"
import { useState } from "react"

const AMOUNTS = [25, 50, 100, 150, 200]

export default function GiftCardPanel() {
  const [amount, setAmount] = useState(50)
  const [to, setTo] = useState("")
  const [email, setEmail] = useState("")
  const [from, setFrom] = useState("")
  const [msg, setMsg] = useState("")
  const [sent, setSent] = useState(false)
  const inp = { width: "100%", background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "var(--ink)", outline: "none", marginTop: 8 }
  const label = { fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)" }
  const submit = (e) => { e.preventDefault(); setSent(true) }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)", gap: 22, alignItems: "start" }} className="faq-grid">
      {/* Gift card visual + amounts */}
      <div>
        <div style={{ background: "linear-gradient(135deg,#3A2B1A,#6B4E2E 60%,#2A1F12)", borderRadius: 18, padding: "26px 24px", color: "#F8F0E2", position: "relative", overflow: "hidden", minHeight: 190 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D9BE97" }}>Carte cadeau</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 6 }}>Rezervy</div>
          <div className="serif" style={{ fontSize: 44, marginTop: 22 }}>{amount} <span style={{ fontSize: 20, color: "#D9BE97" }}>TND</span></div>
          <div style={{ fontSize: 12, color: "#D9BE97", marginTop: 6 }}>Valable dans tous les salons partenaires · 12 mois</div>
        </div>
        <div style={{ ...label, marginTop: 18 }}>Montant</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {AMOUNTS.map((a) => (
            <button key={a} onClick={() => setAmount(a)} style={{ fontSize: 13, fontWeight: 700, borderRadius: 999, padding: "9px 16px", cursor: "pointer", background: amount === a ? "rgba(169,124,72,0.12)" : "var(--card)", border: `1px solid ${amount === a ? "rgba(169,124,72,0.5)" : "var(--line-2)"}`, color: amount === a ? "var(--gold-dark)" : "var(--muted-2)" }}>{a} TND</button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 22px 24px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "18px 6px" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 22, fontWeight: 800 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 12 }}>Carte cadeau envoyée !</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>Une carte de <b style={{ color: "var(--ink)" }}>{amount} TND</b>{to ? <> a été envoyée à <b style={{ color: "var(--ink)" }}>{to}</b></> : ""}. Merci de faire plaisir avec Rezervy.</div>
            <button onClick={() => setSent(false)} className="btn-outline" style={{ marginTop: 16, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>Offrir une autre carte</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>À qui l'offrir ?</div>
            <label style={{ display: "block" }}><span style={label}>Nom du destinataire</span><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Nom" style={inp} required /></label>
            <label style={{ display: "block", marginTop: 12 }}><span style={label}>E-mail du destinataire</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amie@exemple.tn" style={inp} required /></label>
            <label style={{ display: "block", marginTop: 12 }}><span style={label}>De la part de</span><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Votre nom" style={inp} required /></label>
            <label style={{ display: "block", marginTop: 12 }}><span style={label}>Message (optionnel)</span><textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Un petit mot…" rows={3} style={{ ...inp, resize: "vertical", minHeight: 70, fontFamily: "inherit" }} /></label>
            <button type="submit" className="btn-gold" style={{ width: "100%", background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 14, marginTop: 16 }}>Offrir la carte · {amount} TND</button>
          </form>
        )}
      </div>
    </div>
  )
}
