"use client"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

const ICON = {
  dash: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  profil: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  rdv: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  favoris: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  fid: "M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 20.2 6.8 18.1l1-5.8L3.5 8.2l5.9-.9z",
}
const SECTIONS = [
  { href: "/compte", l: "Tableau de bord", icon: "dash" },
  { href: "/compte/profil", l: "Mon profil", icon: "profil" },
  { href: "/compte/rendez-vous", l: "Mes rendez-vous", icon: "rdv" },
  { href: "/compte/favoris", l: "Mes favoris", icon: "favoris" },
  { href: "/compte/abonnements", l: "Abonnements & fidélité", icon: "fid" },
]

export default function CompteLayout({ children }) {
  const { user, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname() || "/compte"

  useEffect(() => { if (ready && !user) router.replace("/connexion?next=" + encodeURIComponent(pathname)) }, [ready, user, pathname, router])
  if (!ready || !user) return null

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "34px 24px 60px", overflowX: "hidden" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--gold)", color: "#FDF8EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flex: "none" }}>{user.initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="serif" style={{ fontSize: 23 }}>{user.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || user.phone} · cliente depuis janvier 2026</div>
        </div>
      </div>

      <div className="account-layout" style={{ marginTop: 24 }}>
        <nav className="account-nav">
          <div className="account-navlist">
            {SECTIONS.map((s) => {
              const on = s.href === "/compte" ? pathname === "/compte" : pathname.startsWith(s.href)
              return (
                <Link key={s.href} href={s.href} className="account-nav-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 11, fontSize: 13.5, fontWeight: on ? 800 : 600, color: on ? "var(--gold-dark)" : "var(--muted-2)", background: on ? "rgba(169,124,72,0.1)" : "transparent", border: on ? "1px solid rgba(169,124,72,0.3)" : "1px solid transparent", whiteSpace: "nowrap" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[s.icon]} /></svg>{s.l}
                </Link>
              )
            })}
          </div>
        </nav>

        <div style={{ minWidth: 0, overflowX: "hidden" }}>{children}</div>
      </div>
    </div>
  )
}
