"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const path = usePathname() || "/"
  const acctOn = path.startsWith("/compte")
  const homeOn = !acctOn && !path.startsWith("/rdv")
  const navStyle = (on) => ({ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? "var(--gold-dark)" : "var(--muted)" })

  return (
    <header
      style={{
        background: "rgba(253,251,246,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--line)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="wrap" style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 22 }}>
        <Link href="/" className="serif" style={{ fontSize: 22, color: "var(--ink)", letterSpacing: "0.01em" }}>
          Rezervy
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/" style={navStyle(homeOn)}>Explorer</Link>
        <Link href="/compte" style={navStyle(acctOn)}>Mes rendez-vous</Link>
        <Link
          href="/compte"
          aria-label="Mon compte"
          style={{
            width: 34, height: 34, borderRadius: "50%", background: "var(--gold)", color: "#FDF8EF",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
          }}
        >
          IB
        </Link>
      </div>
    </header>
  )
}
