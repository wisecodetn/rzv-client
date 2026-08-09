"use client"
import { useState } from "react"

const field = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 10,
  padding: "10px 12px", fontSize: 13, color: "var(--ink)", marginTop: 8, outline: "none",
}

export default function ContactCard() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", msg: "" })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); setSent(true) }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(169,124,72,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>Une autre question ?</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Notre équipe vous répond sous 24h.</div>
        </div>
      </div>

      {sent ? (
        <div style={{ marginTop: 18, background: "rgba(62,142,117,0.1)", border: "1px solid rgba(62,142,117,0.35)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 20, fontWeight: 800 }}>✓</div>
          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 10, color: "var(--green)" }}>Message envoyé !</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 5, lineHeight: 1.6 }}>Merci{form.name ? ` ${form.name.split(" ")[0]}` : ""}, nous vous recontactons très vite.</div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 16 }}>
          <input required placeholder="Votre nom" value={form.name} onChange={set("name")} style={field} />
          <input required type="email" placeholder="Votre e-mail" value={form.email} onChange={set("email")} style={field} />
          <textarea required placeholder="Votre message…" value={form.msg} onChange={set("msg")} rows={3} style={{ ...field, resize: "vertical", minHeight: 76, fontFamily: "inherit" }} />
          <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 12, border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 13.5, color: "var(--on-gold)" }}>Envoyer le message</button>
        </form>
      )}

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="mailto:contact@rezervy.io" className="link-soft" style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", gap: 9, alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></svg>
          contact@rezervy.io
        </a>
        <a href="tel:+21671000000" className="link-soft" style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", gap: 9, alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg>
          +216 71 000 000
        </a>
      </div>
    </div>
  )
}
