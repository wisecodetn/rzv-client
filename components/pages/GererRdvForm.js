"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function GererRdvForm() {
  const router = useRouter()
  const [ref, setRef] = useState("")
  const [err, setErr] = useState("")

  const submit = (e) => {
    e.preventDefault()
    const code = ref.trim().toUpperCase()
    if (!/^RZV-\d{3,5}$/.test(code)) { setErr("Référence invalide. Format attendu : RZV-1234."); return }
    router.push(`/rdv/${code}`)
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "24px 24px" }}>
        <form onSubmit={submit}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", display: "block", marginBottom: 6 }}>Référence du rendez-vous</span>
          <input value={ref} onChange={(e) => { setRef(e.target.value); setErr("") }} placeholder="RZV-4821" style={{ width: "100%", background: "var(--bg)", border: `1px solid ${err ? "var(--red-soft)" : "var(--line-2)"}`, borderRadius: 11, padding: "12px 13px", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: "var(--ink)", outline: "none" }} />
          {err && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginTop: 8 }}>{err}</div>}
          <button type="submit" className="btn-gold" style={{ width: "100%", background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 14, marginTop: 14 }}>Voir mon rendez-vous</button>
        </form>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14, lineHeight: 1.6 }}>
          La référence figure dans le SMS et l'e-mail de confirmation. Vous avez un compte ?{" "}
          <Link href="/compte/rendez-vous" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Voir mes rendez-vous</Link>.
        </div>
      </div>
    </div>
  )
}
