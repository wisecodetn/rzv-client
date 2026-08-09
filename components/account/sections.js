"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "../AuthProvider"
import { useFavorites } from "../FavoritesProvider"
import Photo from "../Photo"

const RDV_UP = [
  { mo: "juil.", dd: "25", sv: "Coupe & brushing", t: "10h00", stf: "Amira", salon: "Maison Yasmine, La Marsa", st: "Confirmé", stC: "var(--green)", stBg: "rgba(62,142,117,0.12)", ref: "RZV-4821" },
  { mo: "août", dd: "02", sv: "Balayage + patine", t: "14h00", stf: "Amira", salon: "Maison Yasmine, La Marsa", st: "Acompte payé", stC: "var(--gold-dark)", stBg: "rgba(169,124,72,0.13)", ref: "RZV-4907" },
]
const RDV_PAST = [
  { when: "8 juil. 2026", sv: "Brushing", amt: 35 },
  { when: "21 juin 2026", sv: "Coloration complète", amt: 140 },
  { when: "30 mai 2026", sv: "Coupe & brushing", amt: 60 },
]

const Card = ({ children, style }) => <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, ...style }}>{children}</div>
const H = ({ children }) => <div className="serif" style={{ fontSize: 21, marginBottom: 4 }}>{children}</div>

/* ── Tableau de bord ─────────────────────────────────────────────── */
export function Dashboard() {
  const { user } = useAuth()
  const { count } = useFavorites()
  if (!user) return null
  const first = user.name.split(" ")[0]
  const next = RDV_UP[0]
  const stats = [
    { l: "Prochains RDV", v: RDV_UP.length, href: "/compte/rendez-vous" },
    { l: "Points fidélité", v: 340, href: "/compte/abonnements" },
    { l: "Favoris", v: count, href: "/compte/favoris" },
    { l: "Abonnement", v: "Actif", href: "/compte/abonnements" },
  ]
  return (
    <>
      <H>Bonjour {first} 👋</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Voici un aperçu de votre compte Rezervy.</div>

      <div style={{ background: "linear-gradient(135deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 20, color: "#F8F0E2", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 58, textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "9px 0", flex: "none" }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#D9BE97" }}>{next.mo}</div>
          <div style={{ fontSize: 21, fontWeight: 800 }}>{next.dd}</div>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D9BE97" }}>Prochain rendez-vous</div>
          <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{next.sv}</div>
          <div style={{ fontSize: 12.5, color: "#E7D9C2", marginTop: 2 }}>{next.t} · avec {next.stf} · {next.salon}</div>
        </div>
        <Link href={`/rdv/${next.ref}`} style={{ background: "var(--gold-light)", color: "#2A1A08", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }}>Gérer</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 14 }}>
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", textAlign: "left", display: "block", color: "var(--ink)" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.l}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <Link href="/recherche" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 11, padding: "12px 20px", fontWeight: 800, fontSize: 13 }}>Réserver un nouveau rendez-vous</Link>
        <Link href="/compte/favoris" className="btn-outline" style={{ background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 11, padding: "12px 20px", fontWeight: 800, fontSize: 13 }}>Voir mes favoris</Link>
      </div>
    </>
  )
}

/* ── Mon profil ──────────────────────────────────────────────────── */
export function Profil() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [saved, setSaved] = useState(false)
  const [notifSms, setNotifSms] = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)
  if (!user) return null
  const inp = { width: "100%", background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "var(--ink)", outline: "none" }
  const label = { fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", display: "block", marginBottom: 6 }
  const save = (e) => { e.preventDefault(); updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim() }); setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <>
      <H>Mon profil</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos informations personnelles et vos préférences.</div>

      <Card>
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            <label><span style={label}>Nom complet</span><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></label>
            <label><span style={label}>Téléphone</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 …" style={inp} /></label>
          </div>
          <label style={{ display: "block", marginTop: 14 }}><span style={label}>E-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} /></label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button type="submit" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 11, padding: "11px 22px", fontWeight: 800, fontSize: 13 }}>Enregistrer</button>
            {saved && <span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700 }}>✓ Profil mis à jour</span>}
          </div>
        </form>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Préférences de notification</div>
        {[["SMS", "Rappels et confirmations par SMS", notifSms, setNotifSms], ["E-mail", "Reçus, offres et nouveautés par e-mail", notifEmail, setNotifEmail]].map(([t, d, val, set]) => (
          <label key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--line-soft)", cursor: "pointer" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{d}</div>
            </div>
            <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--gold)", flex: "none" }} />
          </label>
        ))}
      </Card>

      <Card style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Sécurité</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Modifiez votre mot de passe pour sécuriser votre compte.</div>
          </div>
          <Link href="/reinitialiser-mot-de-passe" className="btn-outline" style={{ background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" }}>Changer le mot de passe</Link>
        </div>
      </Card>
    </>
  )
}

/* ── Mes rendez-vous ─────────────────────────────────────────────── */
export function Rendezvous() {
  return (
    <>
      <H>Mes rendez-vous</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
        {RDV_UP.map((rv) => (
          <Card key={rv.ref} style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 58, textAlign: "center", background: "var(--bg)", borderRadius: 12, padding: "9px 0", flex: "none" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>{rv.mo}</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{rv.dd}</div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{rv.sv}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{rv.t} · avec {rv.stf} · {rv.salon}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 12px", background: rv.stBg, color: rv.stC, whiteSpace: "nowrap" }}>{rv.st}</span>
            <Link href={`/rdv/${rv.ref}`} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "9px 15px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", flex: "none" }}>Gérer</Link>
          </Card>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Historique</div>
      <Card style={{ marginTop: 10, padding: 0, overflow: "hidden" }}>
        {RDV_PAST.map((rp, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 18px", borderBottom: i < RDV_PAST.length - 1 ? "1px solid var(--line-soft)" : "none", fontSize: 13 }}>
            <div style={{ color: "var(--muted)", width: 120, fontSize: 12.5 }}>{rp.when}</div>
            <div style={{ fontWeight: 700, flex: 1, minWidth: 0 }}>{rp.sv}</div>
            <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{rp.amt} TND</div>
            <div style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700, whiteSpace: "nowrap" }}>Re-réserver</div>
          </div>
        ))}
      </Card>
    </>
  )
}

/* ── Mes favoris ─────────────────────────────────────────────────── */
export function Favoris() {
  const { favs, removeFav } = useFavorites()
  const [salons, setSalons] = useState([])
  useEffect(() => {
    let alive = true
    Promise.all(favs.map((slug) => fetch(`/api/salon/${slug}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
      .then((list) => { if (alive) setSalons(list.filter(Boolean)) })
    return () => { alive = false }
  }, [favs])
  return (
    <>
      <H>Mes favoris</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos salons préférés, à portée de clic.</div>
      {favs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontWeight: 800, color: "var(--muted)" }}>Aucun favori pour le moment</div>
          <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6 }}>Ajoutez des salons à vos favoris depuis leur page.</div>
          <Link href="/recherche" className="btn-outline" style={{ display: "inline-block", marginTop: 14, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>Explorer les salons</Link>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {salons.map((s) => (
            <div key={s.slug} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", position: "relative" }}>
              <div style={{ height: 120, position: "relative" }}>
                <Photo label={`Photo — ${s.name}`} />
                <button onClick={() => removeFav(s.slug)} aria-label="Retirer des favoris" style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(253,248,239,0.94)", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(26,18,8,0.25)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </button>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <Link href={`/salon/${s.slug}`} style={{ fontWeight: 800, fontSize: 13.5, color: "var(--ink)" }}>{s.name}</Link>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{s.kind} · {s.city}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gold-dark)" }}>★ {s.rate}</span>
                  <span style={{ fontSize: 11.5, color: "var(--muted)" }}>dès {s.from} TND</span>
                  <span style={{ flex: 1 }} />
                  <Link href={`/salon/${s.slug}/reserver`} style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 9, padding: "7px 13px", fontWeight: 800, fontSize: 11.5, whiteSpace: "nowrap" }} className="btn-gold">Réserver</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ── Abonnements & fidélité ──────────────────────────────────────── */
export function Fidelite() {
  return (
    <>
      <H>Abonnements & fidélité</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 4 }}>
        <div style={{ background: "linear-gradient(150deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 22, color: "#F8F0E2" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#D9BE97" }}>Points fidélité</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>340 <span style={{ fontSize: 15, fontWeight: 700, color: "#D9BE97" }}>pts</span></div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.18)", borderRadius: 99, marginTop: 14, overflow: "hidden" }}><div style={{ width: "68%", height: "100%", background: "var(--gold-light)", borderRadius: 99 }} /></div>
          <div style={{ fontSize: 12, color: "#D9BE97", marginTop: 8 }}>Encore 160 pts pour un brushing offert (500 pts)</div>
        </div>
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Parrainage</div>
          <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.65, marginTop: 8 }}>Offrez <b style={{ color: "var(--ink)" }}>−20%</b> à une amie sur sa première visite — et gagnez <b style={{ color: "var(--ink)" }}>50 pts</b> à chaque venue.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1, background: "var(--bg)", border: "1px dashed rgba(169,124,72,0.5)", borderRadius: 10, padding: "10px 14px", fontWeight: 800, letterSpacing: "0.08em", textAlign: "center" }}>INES25</div>
            <button className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5 }}>Partager</button>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>3 amies parrainées · 150 pts gagnés</div>
        </Card>
      </div>

      <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mon abonnement</div>
      <Card style={{ marginTop: 10, border: "1px solid rgba(169,124,72,0.35)", padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="serif" style={{ fontSize: 18, color: "var(--gold-dark)" }}>Brushing Illimité</div>
          <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "3px 10px", background: "rgba(62,142,117,0.12)", color: "var(--green)" }}>Actif</span>
          <div style={{ flex: 1 }} />
          <div style={{ fontWeight: 800 }}>129 <span style={{ fontSize: 11.5, color: "var(--gold)" }}>TND/mois</span></div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>1 brushing par semaine + −10% sur toutes les colorations, chez Maison Yasmine.</div>
        <div style={{ display: "flex", gap: 24, marginTop: 16, borderTop: "1px solid var(--line-soft)", paddingTop: 14, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>Utilisation — juillet</div><div style={{ fontWeight: 800, fontSize: 14, marginTop: 3 }}>3 / 4 brushings</div></div>
          <div><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>Prochaine facture</div><div style={{ fontWeight: 800, fontSize: 14, marginTop: 3 }}>1 août 2026</div></div>
          <div style={{ flex: 1 }} />
          <button style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "9px 15px", fontWeight: 700, fontSize: 12, alignSelf: "center", whiteSpace: "nowrap", flex: "none" }}>Gérer l'abonnement</button>
        </div>
      </Card>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14 }}>Paiement automatique par carte •••• 4127 — reçu envoyé par email chaque mois.</div>
    </>
  )
}
