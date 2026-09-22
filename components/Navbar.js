"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "./AuthProvider"
import { useCatalog } from "./CatalogProvider"
import ThemeToggle from "./ThemeToggle"

/* Account sections — mirrored from app/compte/layout.js. On mobile the in-page
   account nav is hidden, so this popup IS the account navigation. */
const ACCT_ICON = {
  dash: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  profil: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  rdv: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  favoris: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  fid: "M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 20.2 6.8 18.1l1-5.8L3.5 8.2l5.9-.9z",
}
const ACCT_SECTIONS = [
  { href: "/compte", l: "Tableau de bord", icon: "dash" },
  { href: "/compte/profil", l: "Mon profil", icon: "profil" },
  { href: "/compte/rendez-vous", l: "Mes rendez-vous", icon: "rdv" },
  { href: "/compte/favoris", l: "Mes favoris", icon: "favoris" },
  { href: "/compte/abonnements", l: "Abonnements & fidélité", icon: "fid" },
]

export default function Navbar() {
  const path = usePathname() || "/"
  const { user, logout } = useAuth()
  const { categories, categoryChildren } = useCatalog()
  const PRIMARY = categories.slice(0, 4)
  const [menu, setMenu] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setMenu(false); setAcctOpen(false) }, [path])
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) { setMenu(false); setAcctOpen(false) } }
    const onEsc = (e) => e.key === "Escape" && (setMenu(false), setAcctOpen(false))
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onEsc)
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc) }
  }, [])

  // While the mega menu is open, lock the page scroll — the menu scrolls itself.
  useEffect(() => {
    if (!menu) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => { document.documentElement.style.overflow = prev }
  }, [menu])

  const active = (slug) => path === `/${slug}` || path.startsWith(`/${slug}/`)
  const catLink = (on) => ({ fontSize: 13.5, fontWeight: on ? 800 : 600, color: on ? "var(--gold-dark)" : "var(--ink)", padding: "4px 2px" })

  return (
    <header ref={ref} style={{ background: "var(--header-bg)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 60 }}>
      <div className="wrap" style={{ padding: "13px 24px", display: "flex", alignItems: "center", gap: 18 }}>
        {/* Mobile menu — icon only, to the left of the logo */}
        <button className="nav-menu-btn" onClick={() => { setAcctOpen(false); setMenu((m) => !m) }} aria-label="Catégories" style={{ alignItems: "center", justifyContent: "center", background: menu ? "rgba(0,0,0,0.1)" : "transparent", border: "1px solid var(--line-2)", borderRadius: 10, width: 38, height: 38, color: menu ? "var(--gold-dark)" : "var(--ink)", flex: "none", padding: 0 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 6h16 M4 12h16 M4 18h16" /></svg>
        </button>

        <Link href="/" title="Rezervy — Accueil" className="serif" style={{ fontSize: 23, color: "var(--ink)", letterSpacing: "0.01em", flex: "none" }}>Rezervy</Link>

        {/* Desktop category nav */}
        <nav className="nav-cats" style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: 8 }}>
          {PRIMARY.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} title={`${c.name} en Tunisie`} className="nav-underline" style={catLink(active(c.slug))}>{c.name}</Link>
          ))}
          <button onClick={() => { setAcctOpen(false); setMenu((m) => !m) }} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", fontSize: 13.5, fontWeight: 700, color: menu ? "var(--gold-dark)" : "var(--muted)" }}>
            Voir plus <span style={{ fontSize: 10, transform: menu ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
          </button>
        </nav>

        <div style={{ flex: 1 }} />

        {/* Pro */}
        <Link href="/devenir-partenaire" className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--line-2)", borderRadius: 999, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", flex: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16v13H4z M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M4 13h16" /></svg>
          <span className="nav-pro-label">Je suis professionnel</span>
        </Link>

        <ThemeToggle />

        {/* User / login */}
        <div style={{ position: "relative", flex: "none" }}>
          {user ? (
            <button onClick={() => { setMenu(false); setAcctOpen((u) => !u) }} aria-label="Mon compte" style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", color: "var(--on-gold)", border: "none", fontSize: 12.5, fontWeight: 800 }}>{user.initials}</button>
          ) : (
            <Link href="/connexion" className="btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 12.5, fontWeight: 800 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "none" }} className="login-icon-mobile">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="login-text">Se connecter</span>
            </Link>
          )}
          {user && acctOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 220, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 14, boxShadow: "0 16px 40px var(--shadow-strong)", overflow: "hidden", zIndex: 70 }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{user.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || user.phone}</div>
              </div>
              {ACCT_SECTIONS.map((s) => {
                const on = s.href === "/compte" ? path === "/compte" : path.startsWith(s.href)
                return (
                  <Link key={s.href} href={s.href} title={s.l} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: on ? "var(--gold-dark)" : "var(--ink)", fontWeight: on ? 800 : 600, background: on ? "rgba(0,0,0,0.08)" : "transparent" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", opacity: on ? 1 : 0.65 }}><path d={ACCT_ICON[s.icon]} /></svg>
                    {s.l}
                  </Link>
                )
              })}
              <button onClick={() => { logout(); setAcctOpen(false) }} className="row-hover" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13, color: "var(--red)", fontWeight: 600, background: "transparent", border: "none", borderTop: "1px solid var(--line)" }}>Se déconnecter</button>
            </div>
          )}
        </div>
      </div>

      {/* Mega popup — all categories + sub-services */}
      {menu && (
        <>
          <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: "0 0 0 0", top: 0, background: "transparent", zIndex: 1 }} />
          {/* maxHeight + internal scroll: on mobile the menu is taller than the
              viewport — without this the bottom is unreachable (header is sticky). */}
          <div className="autocomplete-scroll" style={{ position: "absolute", left: 0, right: 0, top: "100%", maxHeight: "calc(100dvh - 70px)", overflowY: "auto", overscrollBehavior: "contain", background: "var(--card)", borderBottom: "1px solid var(--line-2)", boxShadow: "0 22px 50px var(--shadow)", zIndex: 2 }}>
            <div className="wrap" style={{ padding: "26px 24px 30px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 22 }}>
                {categories.map((c) => (
                  <div key={c.slug}>
                    <Link href={`/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 13.5, color: "var(--ink)" }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(0,0,0,0.12)", color: "var(--gold-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flex: "none" }}>{c.name[0]}</span>
                      {c.name}
                    </Link>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 9 }}>
                      {/* ~25 sub-category links: prefetching them all the moment
                          the menu opens is a burst of requests for nothing. */}
                      {categoryChildren(c.slug).slice(0, 5).map((s) => (
                        <Link key={s.slug} href={`/${s.slug}`} prefetch={false} className="link-soft" style={{ fontSize: 12.5, color: "var(--muted)", padding: "3px 0" }}>{s.name}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Rezervy couvre 24 gouvernorats — Tunis, Sfax, Sousse, Nabeul, Bizerte…</span>
                <div style={{ flex: 1 }} />
                <Link href="/recherche" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 10, padding: "9px 16px", fontSize: 12.5, fontWeight: 800 }}>Explorer tous les salons</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
