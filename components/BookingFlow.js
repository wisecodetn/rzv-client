"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"
import { flatServices } from "@/lib/salon-utils"

const DEPOSIT_PCT = 30
const fmtD = (m) => (m >= 60 ? Math.floor(m / 60) + "h" + (m % 60 ? String(m % 60).padStart(2, "0") : "") : m + " min")
const T = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0")
const sel = (on) => (on ? ["rgba(169,124,72,0.6)", "rgba(169,124,72,0.09)"] : ["var(--line-2)", "transparent"])
// Slots come from the API — the salon's own hours, its agenda and the chosen
// service's duration. A fixed 9h–17h30 grid was wrong for every salon that
// closes at another hour.
const PAY = [
  ["Carte bancaire", "Acompte sécurisé (Stripe)"],
  ["Sur place", "Au salon"],
]
const PAY_ONSITE = 1
const lbl = { fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }

/** YYYY-MM-DD in the visitor's own timezone — the salon's calendar day. */
const dayKey = (dt) => {
  const p = (n) => String(n).padStart(2, "0")
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`
}

/* Pending booking, persisted across the login/signup redirect so a guest's
   selections are never lost. One pending booking at a time; 1h TTL. */
const PENDING_KEY = "rzv_pending_booking"
const savePending = (data) => { try { localStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, savedAt: Date.now() })) } catch {} }
const clearPending = () => { try { localStorage.removeItem(PENDING_KEY) } catch {} }
const loadPending = (salonSlug) => {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null")
    if (!p || p.salonSlug !== salonSlug) return null
    if (Date.now() - (p.savedAt || 0) > 60 * 60 * 1000) { clearPending(); return null }
    return p
  } catch { return null }
}

/* One-page booking (single prestation — matches the Rezervy reservation UI):
   prestation card = service + "Avec qui ?" avatar tiles + month calendar +
   créneaux. Sticky aside = recap + acompte + CTA. */
export default function BookingFlow({ salon, preselect = null, confirmOnArrival = false, paidSessionId = null, cancelSessionId = null, reschedId = null }) {
  const router = useRouter()
  const { user, ready: authReady } = useAuth()
  const flat = useMemo(() => flatServices(salon), [salon])
  const staff = salon.team

  // `preselect` is a service id from the salon page's "Réserver" link.
  const preIdx = useMemo(() => {
    if (preselect == null) return null
    const i = flat.findIndex((s) => String(s.id) === String(preselect))
    return i >= 0 ? i : null
  }, [flat, preselect])
  const [svcI, setSvcI] = useState(preIdx)
  const [staffId, setStaffId] = useState("any")
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [payI, setPayI] = useState(0)
  const [view, setView] = useState("pick") // "pick" → "recap" (résumé) → booked
  const [booked, setBooked] = useState(null) // the server-confirmed booking
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState("")
  const [promoInput, setPromoInput] = useState("")
  const [promo, setPromo] = useState(null)   // { code, discountTnd, totalTnd, … }
  const [promoErr, setPromoErr] = useState("")
  const [promoBusy, setPromoBusy] = useState(false)
  const [wlPhone, setWlPhone] = useState("")
  const [wlJoined, setWlJoined] = useState(false)
  const restoredRef = useRef(false)
  const verifiedRef = useRef(false)
  const cancelledRef = useRef(false)
  // Reschedule mode (?resched=<bookingId>): the existing booking being moved,
  // or "missing" when it can't be rescheduled (past/cancelled/not yours).
  const [resched, setResched] = useState(null)
  const reschedRef = useRef(false)

  // Load the booking being rescheduled, lock its prestation, preselect its
  // praticien·ne, and open the calendar on its current month.
  useEffect(() => {
    if (!reschedId || reschedRef.current || !authReady) return
    if (!user) {
      router.push(`/connexion?next=${encodeURIComponent(`/salon/${salon.slug}/reserver?resched=${reschedId}`)}`)
      return
    }
    reschedRef.current = true
    ;(async () => {
      try {
        const res = await fetch("/api/account/bookings")
        const data = await res.json().catch(() => null)
        const b = data?.upcoming?.find((x) => x.id === reschedId && x.canCancel)
        if (!b || b.salon?.slug !== salon.slug) { setResched("missing"); return }
        const svcName = b.service.replace(/ \(avec .+\)$/, "")
        const i = flat.findIndex((s) => s.n === svcName)
        if (i < 0) { setResched("missing"); return }
        const withWho = / \(avec (.+)\)$/.exec(b.service)?.[1]
        const member = withWho ? staff.find((p) => p.n.split(" ")[0] === withWho) : null
        setSvcI(i)
        if (member && flat[i].who.includes(member.id)) setStaffId(member.id)
        const cur = new Date(b.startAt)
        setYm({ y: cur.getFullYear(), m: cur.getMonth() })
        setResched(b)
      } catch {
        setResched("missing")
      }
    })()
  }, [reschedId, authReady, user, router, salon.slug, flat, staff])

  /** Reschedule confirm: move the booking to the picked slot — no new
   *  reservation, no payment step (a paid deposit follows the booking). */
  const rescheduleBooking = async () => {
    if (!resched || resched === "missing") return
    setSubmitting(true)
    setSubmitErr("")
    try {
      const startAt = new Date(date)
      startAt.setHours(Math.floor(time / 60), time % 60, 0, 0)
      const res = await fetch(`/api/account/bookings/${resched.id}/reschedule`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          startAt: startAt.toISOString(),
          staffName: staffId === "any" ? "any" : staff.find((p) => p.id === staffId)?.n.split(" ")[0],
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.status === 401) {
        router.push(`/connexion?next=${encodeURIComponent(`/salon/${salon.slug}/reserver?resched=${reschedId}`)}`)
        return
      }
      if (!res.ok) {
        if (data?.code === "booking/bad-date") setTime(null)
        throw new Error(data?.message || "La reprogrammation a échoué. Réessayez.")
      }
      setBooked({ ...data, rescheduled: true })
    } catch (ex) {
      setSubmitErr(ex.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Back from Stripe via "Retour" (?paycancel=1&session_id=…): the reservation
  // was created before the hand-off — delete it server-side so an abandoned
  // payment never leaves a booking behind. The pending selections survive, so
  // the restore effect below brings the résumé back for a retry.
  useEffect(() => {
    if (!cancelSessionId || cancelledRef.current || !authReady || !user) return
    cancelledRef.current = true
    fetch("/api/account/bookings/cancel-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: cancelSessionId }),
    }).catch(() => {})
    setSubmitErr("Paiement annulé — la réservation n'a pas été enregistrée. Réessayez ou choisissez le paiement sur place.")
  }, [cancelSessionId, authReady, user])

  // Back from Stripe Checkout (?paid=1&session_id=…): once the session cookie
  // is refreshed (authReady), verify server-side and show the confirmation.
  useEffect(() => {
    if (!paidSessionId || verifiedRef.current || !authReady) return
    if (!user) {
      router.push(`/connexion?next=${encodeURIComponent(`/salon/${salon.slug}/reserver?paid=1&session_id=${paidSessionId}`)}`)
      return
    }
    verifiedRef.current = true
    ;(async () => {
      setSubmitting(true)
      try {
        const res = await fetch("/api/account/bookings/verify-payment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId: paidSessionId }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.message || "La vérification du paiement a échoué.")
        clearPending()
        setBooked(data)
      } catch (ex) {
        setSubmitErr(ex.message)
      } finally {
        setSubmitting(false)
      }
    })()
  }, [paidSessionId, authReady, user, router, salon.slug])

  // Restore a pending booking (saved before a login redirect, or an abandoned
  // tab) once auth state is known. Every restored field is re-validated; if we
  // arrived via ?confirm=1 and everything still holds, jump straight to the
  // résumé — the user never re-picks anything.
  useEffect(() => {
    if (!authReady || restoredRef.current || reschedId) return
    restoredRef.current = true
    const p = loadPending(salon.slug)
    if (!p) return
    const i = flat.findIndex((s) => s.n === p.svcName)
    if (i < 0) { clearPending(); return }
    const stf = p.staffId === "any" || flat[i].who.includes(p.staffId) ? p.staffId : "any"
    setSvcI(i)
    setStaffId(stf)
    if (typeof p.payI === "number" && p.payI >= 0 && p.payI < PAY.length) setPayI(p.payI)
    // The saved selection is restored as-is; availability is fetched right
    // after and drops the slot if the salon no longer offers it. Re-deriving it
    // here would mean a second, divergent copy of the availability rules.
    const dt = p.dateISO ? new Date(p.dateISO) : null
    const validDate = dt && !isNaN(dt.getTime()) && dt >= today
    let validTime = false
    if (validDate) {
      setDate(dt)
      setYm({ y: dt.getFullYear(), m: dt.getMonth() })
      if (p.time != null) {
        const t = new Date(dt)
        t.setHours(Math.floor(p.time / 60), p.time % 60, 0, 0)
        validTime = t.getTime() > Date.now() + 15 * 60 * 1000
        if (validTime) setTime(p.time)
      }
    }
    if (confirmOnArrival && user && validDate && validTime) setView("recap")
  }, [authReady, user, salon.slug, flat, staff, today, confirmOnArrival, reschedId])

  const svc = svcI != null ? flat[svcI] : null
  const subtotal = svc ? svc.p : 0
  // The discount is whatever the SERVER said this code is worth for this basket.
  const discount = promo ? Math.min(promo.discountTnd, subtotal) : 0
  const total = Math.max(0, subtotal - discount)
  const totalM = svc ? svc.m : 0
  const deposit = total > 0 ? Math.max(1, Math.round((total * DEPOSIT_PCT) / 100)) : 0
  const durB = Math.max(totalM, 30)
  const elig = svc ? staff.filter((p) => svc.who.includes(p.id)) : staff

  /* Real availability, in two queries with different lifetimes: the month the
     visitor is LOOKING at (open/closed/full per day) and the day they have
     SELECTED (its slots). Fetching both from one call tied to the selected date
     meant the calendar only ever knew the 62 days after today — every later
     month came back empty and rendered as open, closed Mondays included. */
  const [item, setItem] = useState(null)
  useEffect(() => {
    setItem(!svc?.id ? null : staffId && staffId !== "any" ? `${svc.id}:${staffId}` : String(svc.id))
  }, [svc?.id, staffId])

  const [monthAvail, setMonthAvail] = useState(null)
  const [monthLoading, setMonthLoading] = useState(false)
  const [dayAvail, setDayAvail] = useState(null)
  const [availLoading, setAvailLoading] = useState(false)
  const [availErr, setAvailErr] = useState("")

  const ask = (qs) =>
    fetch(`/api/salon/${encodeURIComponent(salon.slug)}/availability?${qs}`).then(async (r) => {
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.message || "Disponibilités indisponibles.")
      return d
    })

  // The displayed month — refetched on every month change, which the single
  // effect never did.
  useEffect(() => {
    if (!item) { setMonthAvail(null); return }
    const first = new Date(ym.y, ym.m, 1)
    const from = first < today ? today : first
    const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
    let alive = true
    setMonthLoading(true)
    setAvailErr("")
    ask(new URLSearchParams({ items: item, date: dayKey(from), days: String(daysIn + 1) }))
      .then((d) => alive && setMonthAvail(d))
      .catch((e) => { if (alive) { setMonthAvail(null); setAvailErr(e.message) } })
      .finally(() => alive && setMonthLoading(false))
    return () => { alive = false }
  }, [salon.slug, item, ym.y, ym.m])

  // The selected day's slots.
  useEffect(() => {
    if (!item || !date) { setDayAvail(null); return }
    let alive = true
    setAvailLoading(true)
    setAvailErr("")
    ask(new URLSearchParams({ items: item, date: dayKey(date), days: "1" }))
      .then((d) => alive && setDayAvail(d))
      .catch((e) => { if (alive) { setDayAvail(null); setAvailErr(e.message) } })
      .finally(() => alive && setAvailLoading(false))
    return () => { alive = false }
  }, [salon.slug, item, date])

  /** Per-day state from the API calendar, keyed by YYYY-MM-DD. */
  const calByDay = useMemo(() => {
    const m = {}
    for (const c of monthAvail?.calendar ?? []) m[c.date] = c
    for (const c of dayAvail?.calendar ?? []) m[c.date] = c
    return m
  }, [monthAvail, dayAvail])

  /** Last bookable day, from the API (admin's booking horizon). */
  const maxDate = useMemo(() => {
    const src = monthAvail?.maxDate || dayAvail?.maxDate
    if (!src) return null
    const [y, m, d] = src.split("-").map(Number)
    return new Date(y, m - 1, d)
  }, [monthAvail, dayAvail])

  const dayInfo = (dt) => calByDay[dayKey(dt)] ?? null
  const isClosed = (dt) => dayInfo(dt)?.closed === true
  const isFull = (dt) => dayInfo(dt)?.full === true
  /** No answer yet for this day — never treat that as "open". */
  const isUnknown = (dt) => !!item && dayInfo(dt) === null

  // Slots for the selected day, straight from the API (already filtered for
  // lead time, staff and existing bookings).
  const slots = useMemo(() => {
    if (!date || !dayAvail || dayAvail.date !== dayKey(date)) return []
    return dayAvail.slots ?? []
  }, [dayAvail, date])
  const dateFull = date ? isFull(date) : false

  // Keep the chosen time across service/staff changes; the effect refetches and
  // a slot that no longer exists is dropped when the new list arrives.
  useEffect(() => {
    if (time != null && slots.length && !slots.includes(time)) setTime(null)
  }, [slots, time])

  const pickSvc = (i) => {
    const nextStaff = staffId !== "any" && !flat[i].who.includes(staffId) ? "any" : staffId
    setStaffId(nextStaff)
    setSvcI(i)
    setTime(null)
  }
  const pickStaff = (id) => {
    setStaffId(id)
    setTime(null)
  }

  const ready = svc && date && time != null && !dateFull && !submitting
  const hint = !svc ? "Choisissez une prestation" : !date ? "Choisissez une date" : dateFull ? "Cette journée est complète" : time == null ? "Choisissez un créneau" : null

  /** Step 2/3: persist the selections, then either route a guest to sign-in
   *  (they come back on ?confirm=1 with everything restored) or show the résumé. */
  const goConfirm = () => {
    if (!ready) return
    if (reschedId) { rescheduleBooking(); return } // no recap/payment step — just move the slot
    savePending({
      salonSlug: salon.slug,
      svcName: svc.n,
      staffId,
      dateISO: date.toISOString(),
      time,
      payI,
    })
    if (authReady && !user) {
      router.push(`/connexion?next=${encodeURIComponent(`/salon/${salon.slug}/reserver?confirm=1`)}`)
      return
    }
    setSubmitErr("")
    setView("recap")
    try { window.scrollTo({ top: 0 }) } catch {}
  }

  /** Step 4: final confirmation → real reservation on the API. */
  const createBooking = async () => {
    setSubmitting(true)
    setSubmitErr("")
    try {
      const startAt = new Date(date)
      startAt.setHours(Math.floor(time / 60), time % 60, 0, 0)
      const res = await fetch("/api/account/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salonSlug: salon.slug,
          services: [svc.n],
          staffName: staffId === "any" ? "any" : staff.find((p) => p.id === staffId)?.n.split(" ")[0],
          startAt: startAt.toISOString(),
          // Online payment is not offered yet, so the booking is always
          // settled at the salon. The API still supports Stripe; nothing in
          // the UI can reach it.
          payment: "onsite",
          promoCode: promo?.code || undefined,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.status === 401) {
        router.push(`/connexion?next=${encodeURIComponent(`/salon/${salon.slug}/reserver?confirm=1`)}`)
        return
      }
      if (!res.ok) {
        // Slot no longer bookable (passed / taken meanwhile) → back to the
        // picker with the message visible, so the user chooses a new créneau.
        if (data?.code === "booking/bad-date" || data?.code === "booking/service-not-found") {
          setTime(null)
          setView("pick")
        }
        throw new Error(data?.message || "La réservation a échoué. Réessayez.")
      }
      // Card deposit → hand over to Stripe's hosted page; we come back on
      // ?paid=1 (verified server-side) or ?paycancel=1 (reservation deleted).
      // Pending stays saved so a cancelled payment restores the résumé.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      clearPending()
      setBooked(data)
    } catch (ex) {
      setSubmitErr(ex.message)
    } finally {
      setSubmitting(false)
    }
  }

  /** Ask the API what this code is worth for the current basket. */
  const applyPromo = async () => {
    const code = promoInput.trim()
    if (!code || !svc) return
    setPromoBusy(true)
    setPromoErr("")
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ salonSlug: salon.slug, code, services: [svc.n] }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Ce code promo est invalide.")
      setPromo(data)
    } catch (ex) {
      setPromo(null)
      setPromoErr(ex.message)
    } finally {
      setPromoBusy(false)
    }
  }
  const clearPromo = () => { setPromo(null); setPromoInput(""); setPromoErr("") }
  // A code is validated against a basket — changing the prestation invalidates it.
  useEffect(() => { setPromo(null); setPromoErr("") }, [svcI])

  const dateLabel = date ? date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : null
  const staffLabel = staffId === "any" ? "Sans préférence" : staff.find((p) => p.id === staffId)?.n.split(" ")[0]

  if (booked) {
    const ref = booked.ref
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "40px 30px", textAlign: "center", marginTop: 24, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--green-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <span style={{ color: "var(--green)", fontSize: 26, fontWeight: 800 }}>✓</span>
        </div>
        <div className="serif" style={{ fontSize: 24, marginTop: 16 }}>{booked.rescheduled ? "Rendez-vous reprogrammé" : "Réservation confirmée"}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.7 }}>
          {booked.service}{time != null ? <> · {booked.rescheduled ? "nouveau créneau : " : ""}{dateLabel} à {T(time)}</> : null}<br />
          Référence <span style={{ fontWeight: 800, color: "var(--ink)" }}>{ref}</span> · en attente de confirmation du salon<br />
          {booked.payment === "deposit"
            ? <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Acompte payé par carte — {booked.rescheduled ? "il reste valable pour le nouveau créneau" : "solde à régler au salon"}</span>
            : <span>Paiement sur place — total de {booked.amountTnd} TND à régler au salon</span>}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <Link href={`/salon/${salon.slug}`} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 11, padding: "11px 18px", fontWeight: 700, fontSize: 12.5 }}>Retour au salon</Link>
          <button onClick={() => router.push("/compte/rendez-vous")} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 12.5 }}>Voir mes rendez-vous</button>
        </div>
      </div>
    )
  }

  /* ── Reschedule mode: loading / not-reschedulable states ── */
  if (reschedId && resched === "missing") {
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "40px 30px", textAlign: "center", marginTop: 24, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
        <div className="serif" style={{ fontSize: 22 }}>Ce rendez-vous ne peut plus être reprogrammé</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.7 }}>Il est peut-être passé, annulé ou introuvable.</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <Link href="/compte/rendez-vous" className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 12.5 }}>Voir mes rendez-vous</Link>
        </div>
      </div>
    )
  }
  if (reschedId && !resched) {
    return <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--faint)", fontSize: 13 }}>Chargement du rendez-vous…</div>
  }

  /* ── Step 4 : page de confirmation (résumé) ── */
  if (view === "recap" && svc && date && time != null) {
    const longDate = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    const row = { display: "flex", alignItems: "baseline", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 13.5 }
    const k = { color: "var(--muted)", width: 110, flex: "none", fontSize: 12.5 }
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <button onClick={() => setView("pick")} style={{ background: "none", border: "none", fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 12 }}>‹ Modifier ma réservation</button>
        <h1 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 400 }}>Confirmez votre réservation</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Vérifiez le résumé ci-dessous avant de valider.</p>

        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 24px", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#333333,#000000)", color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, flex: "none" }}>{salon.ini}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{salon.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{salon.address}, {salon.city}</div>
            </div>
          </div>

          <div style={row}><span style={k}>Prestation</span><span style={{ fontWeight: 800, flex: 1 }}>{svc.n}</span><span style={{ color: "var(--muted)", fontSize: 12.5 }}>{svc.d}</span><span style={{ fontWeight: 800 }}>{svc.p} TND</span></div>
          <div style={row}><span style={k}>Praticien·ne</span><span style={{ fontWeight: 700 }}>{staffLabel}</span></div>
          <div style={row}><span style={k}>Date & heure</span><span style={{ fontWeight: 700, textTransform: "capitalize" }}>{longDate} à {T(time)}</span></div>
          {discount > 0 && (
            <div style={row}>
              <span style={k}>Code {promo.code}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontWeight: 800, color: "var(--green)" }}>−{discount} TND</span>
            </div>
          )}
          <div style={{ ...row, borderBottom: "none" }}>
            <span style={k}>Total{totalM > 0 ? ` · ${fmtD(totalM)}` : ""}</span>
            <span style={{ flex: 1 }} />
            <span className="serif" style={{ fontSize: 24 }}>
              {discount > 0 && <span style={{ fontSize: 14, color: "var(--faint)", textDecoration: "line-through", marginRight: 8 }}>{subtotal}</span>}
              {total} <span style={{ fontSize: 13 }}>TND</span>
            </span>
          </div>

          {/* Promo code — the discount is computed and re-checked server-side */}
          <div style={{ ...lbl, marginTop: 16 }}>Code promo</div>
          {promo ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, background: "var(--green-soft)", border: "1px solid var(--green-soft)", borderRadius: 10, padding: "9px 12px" }}>
              <span style={{ fontWeight: 800, fontSize: 12.5, color: "var(--green)" }}>{promo.code}</span>
              <span style={{ fontSize: 12, color: "var(--muted-2)" }}>
                −{discount} TND{promo.capped ? " (plafond atteint)" : ""}
              </span>
              <span style={{ flex: 1 }} />
              <button onClick={clearPromo} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}>Retirer</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoErr("") }}
                onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                placeholder="Votre code"
                style={{ flex: 1, minWidth: 0, background: "var(--bg)", border: `1px solid ${promoErr ? "var(--red-soft)" : "var(--line-2)"}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "var(--ink)", outline: "none" }}
              />
              <button onClick={applyPromo} disabled={promoBusy || !promoInput.trim()} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", cursor: "pointer", opacity: promoBusy || !promoInput.trim() ? 0.6 : 1 }}>
                {promoBusy ? "…" : "Appliquer"}
              </button>
            </div>
          )}
          {promoErr && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginTop: 6 }}>{promoErr}</div>}

          <button onClick={createBooking} disabled={submitting} className="btn-gold" style={{ width: "100%", marginTop: 16, background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "14px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Envoi…" : "Confirmer la réservation"}
          </button>
          {submitErr && <div style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 700, textAlign: "center", marginTop: 10 }}>{submitErr}</div>}

          <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}>
            {`Aucun paiement en ligne — total de ${total} TND à régler sur place.`}
            <br />✓ Confirmation & rappel par SMS{user ? <> · connecté·e en tant que <b style={{ color: "var(--ink)" }}>{user.email}</b></> : null}
          </div>
        </div>
      </div>
    )
  }

  /* ── Month calendar (render fn — keeps DOM stable across re-renders) ── */
  const renderCal = () => {
    const first = new Date(ym.y, ym.m, 1)
    const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
    const startWd = (first.getDay() + 6) % 7
    const label = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    const canPrev = new Date(ym.y, ym.m + 1, 0) > today
    // Forward navigation stops at the salon's booking horizon (an admin
    // setting, sent by the API). Unbounded, the calendar happily walked to
    // 2056 and offered slots the booking gate would refuse.
    const canNext = !maxDate || new Date(ym.y, ym.m + 1, 1) <= maxDate
    const nav = (delta) => setYm(({ y, m }) => { const nm = m + delta; if (nm < 0) return { y: y - 1, m: 11 }; if (nm > 11) return { y: y + 1, m: 0 }; return { y, m: nm } })
    const cells = []
    for (let i = 0; i < startWd; i++) cells.push(null)
    for (let d = 1; d <= daysIn; d++) cells.push(d)
    const navBtn = { width: 30, height: 30, borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => nav(-1)} disabled={!canPrev} style={{ ...navBtn, opacity: canPrev ? 1 : 0.35 }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 14.5, fontWeight: 800, textTransform: "capitalize" }}>{label}</div>
          <button onClick={() => nav(1)} disabled={!canNext} style={{ ...navBtn, opacity: canNext ? 1 : 0.35 }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, fontSize: 11, color: "var(--faint)", fontWeight: 800, textAlign: "center", margin: "12px 0 4px" }}>
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const dt = new Date(ym.y, ym.m, d)
            const past = dt < today
            const closed = isClosed(dt)
            const tooFar = maxDate && dt > maxDate
            const unknown = isUnknown(dt)
            const dis = past || closed || tooFar || unknown
            const on = date && dt.getTime() === date.getTime()
            return (
              <button key={i} disabled={dis} onClick={() => { setDate(dt); setTime(null); setWlJoined(false) }}
                title={closed ? "Fermé" : tooFar ? "Trop loin — réservations pas encore ouvertes" : isFull(dt) ? "Complet" : undefined}
                style={{ height: 38, borderRadius: "50%", width: 38, margin: "0 auto", border: "none", cursor: dis ? "default" : "pointer", fontSize: 13, fontWeight: on ? 800 : 600, background: on ? "var(--gold)" : "transparent", color: dis ? "var(--faint)" : on ? "#FDF8EF" : "var(--ink)", textDecoration: closed ? "line-through" : "none" }}>
                {d}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Salon header */}
      <Link href={`/salon/${salon.slug}`} style={{ fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 700, display: "inline-block", marginBottom: 10 }}>← Retour</Link>
      <h1 className="serif" style={{ fontSize: 27, margin: 0, fontWeight: 400 }}>{salon.name}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, fontSize: 12.5, color: "var(--muted)", flexWrap: "wrap" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>
        <span>{salon.address}, {salon.city}</span>
        <span style={{ color: "var(--gold-dark)", fontWeight: 800 }}>★ {salon.rate}</span>
        <span>({salon.rev} avis)</span>
      </div>

      {reschedId && resched && resched !== "missing" && (
        <div style={{ marginTop: 16, background: "rgba(169,124,72,0.08)", border: "1px solid rgba(169,124,72,0.35)", borderRadius: 14, padding: "13px 18px", fontSize: 12.5, color: "var(--muted-2)", lineHeight: 1.6 }}>
          <b style={{ color: "var(--gold-dark)" }}>Reprogrammation</b> — Réf. <b style={{ color: "var(--ink)" }}>{resched.ref}</b> · actuellement le{" "}
          <b style={{ color: "var(--ink)", textTransform: "capitalize" }}>{new Date(resched.startAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {new Date(resched.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")}</b>.
          Choisissez un nouveau créneau ci-dessous{resched.payment === "deposit" ? " — votre acompte payé reste valable" : ""}.
        </div>
      )}

      <div className="booking-grid" style={{ marginTop: 20 }}>
        {/* ── Main: the prestation card ── */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span className="serif" style={{ fontSize: 20, color: "var(--gold-dark)" }}>1.</span>
            <h2 className="serif" style={{ fontSize: 20, margin: 0, fontWeight: 400 }}>Prestation & disponibilités</h2>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "20px 22px", marginTop: 14 }}>
            {/* service (or picker) */}
            {svc ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <div className="serif" style={{ fontSize: 19 }}>{svc.n}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>◷ {svc.d} · <strong style={{ color: "var(--ink)" }}>{svc.p} TND</strong></div>
                <div style={{ flex: 1 }} />
                {!reschedId && <span onClick={() => { setSvcI(null); setTime(null) }} style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-dark)", cursor: "pointer" }}>Modifier</span>}
              </div>
            ) : (
              <>
                <div className="serif" style={{ fontSize: 19 }}>Choisir une prestation</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginTop: 12 }}>
                  {flat.map((s, i) => (
                    <button key={i} onClick={() => pickSvc(i)} style={{ border: "1px solid var(--line-2)", background: "transparent", borderRadius: 12, padding: "11px 13px", textAlign: "left", cursor: "pointer" }}>
                      <div style={{ display: "flex", fontSize: 12.5, fontWeight: 700, gap: 7 }}>
                        <span style={{ flex: 1, minWidth: 0 }}>{s.n}</span>
                        <span style={{ color: "var(--gold-dark)", whiteSpace: "nowrap" }}>{s.p} TND</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{s.cat} · {s.d}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Avec qui ? — avatar tiles */}
            {svc && (
              <>
                <div style={{ ...lbl, marginTop: 18 }}>Avec qui ? <span style={{ textTransform: "none", fontWeight: 600, letterSpacing: 0 }}>(optionnel)</span></div>
                <div style={{ display: "flex", gap: 9, marginTop: 10, flexWrap: "wrap" }}>
                  {[{ id: "any", n: "Sans préférence", r: "Premier·ère disponible", c: null, ini: "✦" }, ...elig].map((p) => {
                    const on = staffId === p.id
                    return (
                      <button key={p.id} onClick={() => pickStaff(p.id)} style={{ position: "relative", width: 96, border: `1.5px solid ${on ? "var(--gold)" : "var(--line-2)"}`, background: on ? "rgba(169,124,72,0.07)" : "var(--card)", borderRadius: 14, padding: "12px 8px 10px", textAlign: "center", cursor: "pointer" }}>
                        {on && <span style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "var(--gold)", color: "#FDF8EF", fontSize: 10, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                        <span style={{ width: 38, height: 38, borderRadius: "50%", background: p.c || "rgba(169,124,72,0.15)", color: p.c ? "#2A1A08" : "var(--gold-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: p.c ? 12 : 15, fontWeight: 800 }}>{p.ini}</span>
                        <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.id === "any" ? "Sans préf." : p.n.split(" ")[0]}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.id === "any" ? "1er·ère dispo" : p.r}</div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* calendar + slots */}
            {svc && (
              <>
                <div style={{ ...lbl, marginTop: 20 }}>Choisir une date & heure</div>
                <div style={{ maxWidth: 420, marginTop: 12 }}>{renderCal()}</div>

                {date && !dateFull && (
                  <>
                    <div style={{ ...lbl, marginTop: 16 }}>Créneaux disponibles</div>
                    <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                      {slots.map((m) => {
                        const on = time === m
                        const [bd, bg] = sel(on)
                        return <button key={m} onClick={() => setTime(m)} style={{ fontSize: 12.5, fontWeight: 700, border: `1px solid ${bd}`, background: bg, borderRadius: 10, padding: "9px 15px", color: on ? "var(--gold-dark)" : "var(--muted-2)", cursor: "pointer" }}>{T(m)}</button>
                      })}
                      {availLoading && !slots.length && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Recherche des créneaux…</div>}
                      {availErr && <div style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 600 }}>{availErr}</div>}
                      {!availLoading && !availErr && !slots.length && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Aucun créneau ce jour — essayez une autre date.</div>}
                    </div>
                  </>
                )}
                {date && dateFull && (
                  <div style={{ marginTop: 16, background: "rgba(201,162,39,0.09)", border: "1px solid rgba(201,162,39,0.35)", borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: "#8A6A17" }}>Cette journée est complète</div>
                    {!wlJoined ? (
                      <>
                        <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 5, lineHeight: 1.6 }}>Rejoignez la liste d'attente : si un créneau se libère, vous recevrez un SMS avec un lien prioritaire, valable 30 minutes.</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                          <input value={wlPhone} onChange={(e) => setWlPhone(e.target.value)} placeholder="+216 …" style={{ flex: 1, minWidth: 160, background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--ink)", outline: "none" }} />
                          <button onClick={() => setWlJoined(true)} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5 }}>Rejoindre la liste d'attente</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700, marginTop: 8 }}>✓ Vous êtes sur la liste d'attente — nous vous préviendrons par SMS.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Sticky aside: recap + acompte + CTA ── */}
        <aside className="booking-aside">
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
            <div style={{ ...lbl }}>Votre rendez-vous</div>
            <div style={{ marginTop: 10 }}>
              {!svc ? (
                <div style={{ fontSize: 12.5, color: "var(--faint)" }}>Aucune prestation sélectionnée</div>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 700, flex: 1, minWidth: 0 }}>{svc.n}</span>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{staffLabel}</span>
                  <span style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{svc.p} TND</span>
                </div>
              )}
              <div style={{ display: "flex", marginTop: 10, fontSize: 12.5 }}>
                <span style={{ color: "var(--muted)", width: 60 }}>Date</span>
                <span style={{ fontWeight: 700, textTransform: "capitalize" }}>{dateLabel || "—"}{time != null ? ` · ${T(time)}` : ""}</span>
              </div>
            </div>

            {discount > 0 && (
              <div style={{ display: "flex", marginTop: 10, fontSize: 12.5 }}>
                <span style={{ color: "var(--muted)", flex: 1 }}>Code {promo.code}</span>
                <span style={{ fontWeight: 800, color: "var(--green)" }}>−{discount} TND</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid var(--line-soft)", marginTop: 12, paddingTop: 12, display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Total{totalM > 0 ? ` · ${fmtD(totalM)}` : ""}</span>
              <span style={{ flex: 1 }} />
              <span className="serif" style={{ fontSize: 22 }}>
                {discount > 0 && <span style={{ fontSize: 13, color: "var(--faint)", textDecoration: "line-through", marginRight: 7 }}>{subtotal}</span>}
                {total} <span style={{ fontSize: 13 }}>TND</span>
              </span>
            </div>


            <button onClick={goConfirm} disabled={!ready} className={ready ? "btn-gold" : undefined} style={{ width: "100%", marginTop: 14, background: ready ? "var(--gold)" : "#E2D9C6", color: ready ? "#FDF8EF" : "var(--faint)", border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 800, fontSize: 13.5, cursor: ready ? "pointer" : "default" }}>
              {reschedId
                ? submitting ? "Reprogrammation…" : "Confirmer le nouveau créneau"
                : authReady && !user ? "Se connecter et réserver" : "Vérifier et confirmer"}
            </button>
            {hint && <div style={{ fontSize: 11.5, color: "var(--faint)", textAlign: "center", marginTop: 8 }}>{hint}</div>}
            {submitErr && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, textAlign: "center", marginTop: 8 }}>{submitErr}</div>}

            <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}>
              {reschedId
                ? resched?.payment === "deposit"
                  ? "Le paiement ne change pas — votre acompte payé reste valable pour le nouveau créneau."
                  : "Le paiement ne change pas — réglez sur place comme prévu."
                : `Aucun paiement en ligne — total de ${total} TND à régler sur place.`}
              <br />✓ Confirmation & rappel par SMS
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
