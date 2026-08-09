"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [ville, setVille] = useState("")

  const go = () => {
    const p = new URLSearchParams()
    if (q.trim()) p.set("q", q.trim())
    if (ville.trim()) p.set("ville", ville.trim())
    router.push("/recherche" + (p.toString() ? `?${p}` : ""))
  }
  const onKey = (e) => e.key === "Enter" && go()
  const inp = { flex: 1, minWidth: 130, background: "transparent", border: "none", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: "var(--ink)", outline: "none" }

  return (
    <div
      style={{
        display: "flex", gap: 8, marginTop: 26, flexWrap: "wrap", maxWidth: 680,
        background: "rgba(253,251,246,0.94)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        borderRadius: 16, padding: 8, boxShadow: "0 18px 50px rgba(26,18,8,0.35)", pointerEvents: "auto",
      }}
    >
      <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Quel service ? Ex. balayage, coupe homme…" style={{ ...inp, flex: 2, minWidth: 200 }} />
      <div style={{ width: 1, background: "var(--line-2)", margin: "8px 0" }} />
      <input value={ville} onChange={(e) => setVille(e.target.value)} onKeyDown={onKey} placeholder="Où ? Ex. La Marsa" style={inp} />
      <button onClick={go} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 11, padding: "12px 22px", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap", flex: "none" }}>
        Rechercher
      </button>
    </div>
  )
}
