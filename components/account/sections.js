"use client"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../AuthProvider"
import { useFavorites } from "../FavoritesProvider"
import Photo from "../Photo"

const Card = ({ children, style }) => <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, ...style }}>{children}</div>
const H = ({ children }) => <div className="serif" style={{ fontSize: 21, marginBottom: 4 }}>{children}</div>

/* ── Booking display helpers ─────────────────────────────────────── */
const STATUS = {
  pending: { l: "En attente", c: "var(--amber)", bg: "rgba(201,162,39,0.13)" },
  confirmed: { l: "Confirmé", c: "var(--green)", bg: "var(--green-soft)" },
  completed: { l: "Terminé", c: "var(--muted)", bg: "rgba(42,36,28,0.08)" },
  cancelled: { l: "Annulé", c: "var(--red)", bg: "var(--red-soft)" },
  noshow: { l: "Non honoré", c: "var(--red)", bg: "var(--red-soft)" },
}
const dMo = (iso) => new Date(iso).toLocaleDateString("fr-FR", { month: "short" })
const dDd = (iso) => new Date(iso).getDate()
const dTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")
const dFull = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
const dLong = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
const durLabel = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}` : `${min} min`)

/** Payment recap line — mirrors the /rdv detail view ("acompte payé : …"). */
const payInfo = (b) => {
  if (b.payment === "deposit") return { c: "var(--green)", t: `✓ Acompte payé par carte : ${b.depositTnd} TND — solde de ${b.amountTnd - b.depositTnd} TND à régler au salon` }
  if (b.payment === "paid") return { c: "var(--green)", t: `✓ Payé en ligne : ${b.amountTnd} TND` }
  if (b.payment === "refund") return { c: "var(--muted)", t: `Acompte de ${b.depositTnd} TND — remboursement sous 3 jours ouvrés` }
  return { c: "var(--muted)", t: `Paiement sur place — total de ${b.amountTnd} TND` }
}

function useAccountFetch(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/account/${path}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setData(d) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path, tick])
  return { data, loading, reload }
}

const Empty = ({ title, sub, cta, href }) => (
  <Card style={{ textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontWeight: 800, color: "var(--muted)" }}>{title}</div>
    {sub && <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6 }}>{sub}</div>}
    {cta && <Link href={href} className="btn-outline" style={{ display: "inline-block", marginTop: 14, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>{cta}</Link>}
  </Card>
)

/* ── Tableau de bord ─────────────────────────────────────────────── */
export function Dashboard() {
  const { user } = useAuth()
  const { data: ov } = useAccountFetch("overview")
  if (!user) return null
  const first = user.name.split(" ")[0]
  const next = ov?.nextBooking
  const stats = [
    { l: "Prochains RDV", v: ov ? ov.counts.upcoming : "…", href: "/compte/rendez-vous" },
    { l: "Points fidélité", v: ov ? ov.counts.points : "…", href: "/compte/abonnements" },
    { l: "Favoris", v: ov ? ov.counts.favorites : "…", href: "/compte/favoris" },
    { l: "Visites", v: ov ? ov.counts.visits : "…", href: "/compte/rendez-vous" },
  ]
  return (
    <>
      <H>Bonjour {first} 👋</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Voici un aperçu de votre compte Rezervy.</div>

      {next ? (
        <div style={{ background: "linear-gradient(135deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 20, color: "#F8F0E2", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 58, textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "9px 0", flex: "none" }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#D9BE97" }}>{dMo(next.startAt)}</div>
            <div style={{ fontSize: 21, fontWeight: 800 }}>{dDd(next.startAt)}</div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D9BE97" }}>Prochain rendez-vous</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{next.service}</div>
            <div style={{ fontSize: 12.5, color: "#E7D9C2", marginTop: 2 }}>{dTime(next.startAt)} · {next.salon?.name}{next.salon?.city ? `, ${next.salon.city}` : ""}</div>
          </div>
          <Link href="/compte/rendez-vous" style={{ background: "var(--gold-light)", color: "#2A1A08", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }}>Gérer</Link>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(135deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 22, color: "#F8F0E2", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Aucun rendez-vous à venir</div>
            <div style={{ fontSize: 12.5, color: "#D9BE97", marginTop: 4 }}>Trouvez votre salon et réservez en 30 secondes.</div>
          </div>
          <Link href="/recherche" style={{ background: "var(--gold-light)", color: "#2A1A08", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }}>Réserver</Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 14 }}>
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="lift" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", textAlign: "left", display: "block", color: "var(--ink)", minWidth: 0 }}>
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
  const save = async (e) => {
    e.preventDefault()
    try {
      await updateUser({ name: name.trim(), phone: phone.trim() }) // email change needs verification — later
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* keep the form as-is on failure */ }
  }

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
  const { data, loading, reload } = useAccountFetch("bookings")
  const [cancelling, setCancelling] = useState(null)
  const [reviewing, setReviewing] = useState(null) // the past booking being rated
  const upcoming = data?.upcoming || []
  const past = data?.past || []

  const cancel = async (b) => {
    if (!window.confirm(`Annuler « ${b.service} » du ${dFull(b.startAt)} ?`)) return
    setCancelling(b.id)
    try {
      await fetch(`/api/account/bookings/${b.id}/cancel`, { method: "POST" })
      reload()
    } finally {
      setCancelling(null)
    }
  }

  return (
    <>
      <H>Mes rendez-vous</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos réservations à venir et votre historique.</div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "30px 20px", color: "var(--faint)", fontSize: 13 }}>Chargement…</Card>
      ) : upcoming.length === 0 ? (
        <Empty title="Aucun rendez-vous à venir" sub="Trouvez votre salon et réservez en ligne en 30 secondes." cta="Réserver un rendez-vous" href="/recherche" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4, minWidth: 0 }}>
          {upcoming.map((b) => {
            const st = STATUS[b.status] || STATUS.pending
            const pay = payInfo(b)
            const where = [b.salon?.area, b.salon?.city].filter(Boolean).join(", ")
            return (
              <Card key={b.id} style={{ minWidth: 0, padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 16, padding: 18, flexWrap: "wrap", minWidth: 0 }}>
                  <div style={{ width: 58, textAlign: "center", background: "var(--bg)", borderRadius: 12, padding: "10px 0", flex: "none", alignSelf: "flex-start" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>{dMo(b.startAt)}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{dDd(b.startAt)}</div>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5, minWidth: 0 }}>{b.service}</div>
                      <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 12px", background: st.bg, color: st.c, whiteSpace: "nowrap" }}>{st.l}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 5, fontWeight: 600 }}>
                      {dLong(b.startAt)} à {dTime(b.startAt)} · {durLabel(b.durationMin)}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>
                      <Link href={`/salon/${b.salon?.slug}`} title={b.salon?.name || "Rezervy"} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{b.salon?.name}</Link>
                      {b.salon?.address ? ` · ${b.salon.address}` : ""}{where ? `, ${where}` : ""}
                    </div>
                    <div style={{ fontSize: 12.5, color: pay.c, fontWeight: 700, marginTop: 6 }}>{pay.t}</div>
                    <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>Réf. {b.ref}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap", padding: "11px 18px", borderTop: "1px solid var(--line-soft)", background: "var(--bg)" }}>
                  {b.salon?.phone && (
                    <a href={`tel:${b.salon.phone.replace(/\s/g, "")}`} title={`Appeler ${b.salon.name}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--muted-2)", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "8px 13px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      {b.salon.phone}
                    </a>
                  )}
                  <Link href={`/salon/${b.salon?.slug}`} title={b.salon?.name || "Rezervy"} style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-dark)", border: "1px solid rgba(169,124,72,0.45)", borderRadius: 10, padding: "8px 13px" }}>Voir le salon</Link>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: "var(--faint)" }}>Annulation gratuite jusqu'à 24h avant</span>
                  {b.canCancel && (
                    <Link href={`/salon/${b.salon?.slug}/reserver?resched=${b.id}`} title="Reprogrammer ce rendez-vous" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 12, whiteSpace: "nowrap", flex: "none" }}>
                      Reprogrammer
                    </Link>
                  )}
                  {b.canCancel && (
                    <button onClick={() => cancel(b)} disabled={cancelling === b.id} style={{ background: "transparent", border: "1px solid var(--red-soft)", color: "var(--red)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", flex: "none", cursor: "pointer" }}>
                      {cancelling === b.id ? "Annulation…" : "Annuler"}
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {past.length > 0 && (
        <>
          <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Historique</div>
          <Card style={{ marginTop: 10, padding: 0, overflow: "hidden" }}>
            {past.map((b, i) => {
              const st = STATUS[b.status] || STATUS.completed
              return (
                <div key={b.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 18px", borderBottom: i < past.length - 1 ? "1px solid var(--line-soft)" : "none", fontSize: 13, flexWrap: "wrap" }}>
                  <div style={{ color: "var(--muted)", width: 110, fontSize: 12.5, flex: "none" }}>{dFull(b.startAt)}</div>
                  <div style={{ fontWeight: 700, flex: 1, minWidth: 140 }}>{b.service}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "3px 10px", background: st.bg, color: st.c }}>{st.l}</span>
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
                    {b.amountTnd} TND
                    {b.payment === "refund" && <span style={{ color: "var(--faint)", fontSize: 11.5 }}> · acompte remboursé</span>}
                    {b.payment === "deposit" && <span style={{ color: "var(--faint)", fontSize: 11.5 }}> · acompte {b.depositTnd} TND payé</span>}
                  </div>
                  {b.review && (
                    <span title={b.review.text} style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      Votre avis : <b style={{ color: "var(--gold-dark)" }}>★ {b.review.stars}/5</b>
                    </span>
                  )}
                  {b.canReview && (
                    <button onClick={() => setReviewing(b)} style={{ fontSize: 12, fontWeight: 800, color: "var(--gold-dark)", background: "none", border: "1px solid var(--line-strong)", borderRadius: 9, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {b.review ? "Modifier mon avis" : "Laisser un avis"}
                    </button>
                  )}
                  {b.salon && <Link href={`/salon/${b.salon.slug}/reserver`} style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700, whiteSpace: "nowrap" }}>Re-réserver</Link>}
                </div>
              )
            })}
          </Card>
        </>
      )}

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => { setReviewing(null); reload() }}
        />
      )}
    </>
  )
}

/* ── Laisser un avis ─────────────────────────────────────────────────
   Only reachable from a completed appointment, so a rating is always tied to a
   visit that actually happened. */
const CRITERIA = [
  ["welcome", "Accueil"],
  ["cleanliness", "Propreté"],
  ["quality", "Qualité de la prestation"],
  ["value", "Rapport qualité-prix"],
]

function Stars({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} sur 5`}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 20, lineHeight: 1, color: n <= value ? "var(--gold)" : "var(--line-strong)" }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewModal({ booking, onClose, onDone }) {
  const prev = booking.review
  const [scores, setScores] = useState({
    welcome: prev?.welcome ?? 0,
    cleanliness: prev?.cleanliness ?? 0,
    quality: prev?.quality ?? 0,
    value: prev?.value ?? 0,
  })
  const [text, setText] = useState(prev?.text ?? "")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const complete = CRITERIA.every(([k]) => scores[k] > 0) && text.trim().length >= 10

  const submit = async () => {
    setBusy(true)
    setErr("")
    try {
      const res = await fetch(`/api/account/bookings/${booking.id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...scores, text: text.trim() }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) throw new Error(d?.message || "Votre avis n'a pas pu être envoyé.")
      onDone()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 90 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, width: "100%", maxWidth: 460, padding: 22, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>
          {prev ? "Modifier votre avis sur" : "Votre avis sur"} {booking.salon?.name}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
          {booking.service} · {dFull(booking.startAt)}
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {CRITERIA.map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 150 }}>{label}</div>
              <Stars value={scores[key]} onChange={(n) => setScores((s) => ({ ...s, [key]: n }))} />
            </div>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Racontez votre visite — ce qui vous a plu, ce qui pourrait être mieux."
          style={{ width: "100%", marginTop: 14, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", fontFamily: "inherit" }}
        />
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 4 }}>
          Publié sur la page du salon sous votre prénom. 10 caractères minimum.
          {prev
            ? " Vous avez un seul avis par salon : celui-ci remplacera le précédent."
            : " Vous pourrez le modifier après une prochaine visite."}
        </div>
        {err && <div style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 700, marginTop: 8 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} disabled={busy} style={{ background: "none", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "10px 16px", fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", cursor: "pointer" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={!complete || busy} style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 12.5, fontWeight: 800, cursor: complete && !busy ? "pointer" : "default", opacity: complete && !busy ? 1 : 0.55 }}>
            {busy ? "Envoi…" : prev ? "Mettre à jour mon avis" : "Publier mon avis"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Mes favoris ─────────────────────────────────────────────────── */
export function Favoris() {
  const { salons, ready, removeFav } = useFavorites()
  return (
    <>
      <H>Mes favoris</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos salons préférés, à portée de clic.</div>
      {!ready ? (
        <Card style={{ textAlign: "center", padding: "30px 20px", color: "var(--faint)", fontSize: 13 }}>Chargement…</Card>
      ) : salons.length === 0 ? (
        <Empty title="Aucun favori pour le moment" sub="Ajoutez des salons à vos favoris depuis leur page." cta="Explorer les salons" href="/recherche" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, minWidth: 0 }}>
          {salons.map((s) => (
            <div key={s.slug} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", position: "relative", minWidth: 0 }}>
              <div style={{ height: 120, position: "relative" }}>
                <Photo label={`Photo — ${s.name}`} />
                <button onClick={() => removeFav(s.slug)} aria-label="Retirer des favoris" style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(253,248,239,0.94)", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(26,18,8,0.25)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </button>
              </div>
              <div style={{ padding: "12px 14px", minWidth: 0 }}>
                <Link href={`/salon/${s.slug}`} style={{ fontWeight: 800, fontSize: 13.5, color: "var(--ink)" }}>{s.name || s.slug}</Link>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{s.kind}{s.city ? ` · ${s.city}` : ""}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                  {s.rate && <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gold-dark)" }}>★ {s.rate}</span>}
                  {s.from != null && <span style={{ fontSize: 11.5, color: "var(--muted)" }}>dès {s.from} TND</span>}
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
  const { data: ov } = useAccountFetch("overview")
  const points = ov?.loyalty?.points ?? 0
  const visits = ov?.loyalty?.visits ?? 0
  const rewardAt = ov?.loyalty?.rewardAt ?? 500
  const pct = Math.min(100, Math.round((points / rewardAt) * 100))
  const memberships = ov?.memberships || []

  return (
    <>
      <H>Abonnements & fidélité</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 4, minWidth: 0 }}>
        <div style={{ background: "linear-gradient(150deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: 22, color: "#F8F0E2", minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#D9BE97" }}>Points fidélité</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{points} <span style={{ fontSize: 15, fontWeight: 700, color: "#D9BE97" }}>pts</span></div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.18)", borderRadius: 99, marginTop: 14, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--gold-light)", borderRadius: 99 }} /></div>
          <div style={{ fontSize: 12, color: "#D9BE97", marginTop: 8 }}>
            {points >= rewardAt ? "Récompense débloquée — parlez-en à votre salon !" : `Encore ${rewardAt - points} pts pour une récompense (${rewardAt} pts)`}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(233,217,194,0.75)", marginTop: 10 }}>1 point par TND dépensé, crédité après chaque visite honorée · {visits} visite{visits > 1 ? "s" : ""}</div>
        </div>
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Parrainage</div>
            <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "2px 9px", background: "rgba(169,124,72,0.12)", color: "var(--gold-dark)" }}>Bientôt disponible</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.65, marginTop: 8 }}>
            Offrez <b style={{ color: "var(--ink)" }}>−20%</b> à une amie sur sa première visite — et gagnez <b style={{ color: "var(--ink)" }}>50 pts</b> à chaque venue. Le programme arrive très bientôt.
          </div>
          <Link href="/parrainage" className="btn-outline" style={{ display: "inline-block", marginTop: 14, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5 }}>En savoir plus</Link>
        </Card>
      </div>

      <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mes abonnements</div>
      {memberships.length === 0 ? (
        <Card style={{ marginTop: 10, padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--muted)" }}>Aucun abonnement actif</div>
          <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6, lineHeight: 1.6 }}>
            Certains salons proposeront bientôt des formules illimitées (brushing, barbe…) à prix fixe mensuel. Vous les retrouverez ici.
          </div>
        </Card>
      ) : null}
    </>
  )
}
