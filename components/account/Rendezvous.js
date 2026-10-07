"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useDialogFocus } from "@/lib/use-dialog-focus"
import { errorText } from "@/lib/errors"
import { Card, H, STATUS, dMo, dDd, dTime, dFull, dLong, durLabel, payInfo, useAccountFetch, LoadError, accountAction, Empty } from "./shared"

/* ── Liste d'attente ─────────────────────────────────────────────────
   Requests the customer made instead of booking a créneau. Shown only when
   there are some; a freed slot the salon proposes appears here with the time
   it is held until. */
const WL_STATUS = {
  waiting: { l: "En attente d'un créneau", c: "var(--gold-dark)", bg: "var(--accent-soft)" },
  invited: { l: "Créneau proposé", c: "var(--green)", bg: "var(--green-soft)" },
  declined: { l: "Proposition déclinée", c: "var(--muted)", bg: "var(--accent-soft)" },
}

function WaitlistRequests() {
  const { data, reload } = useAccountFetch("waitlist")
  const [leaving, setLeaving] = useState(null)
  const rows = Array.isArray(data) ? data : []
  if (!rows.length) return null

  const leave = async (w) => {
    if (!window.confirm(`Retirer votre demande « ${w.service} » chez ${w.salon?.name} ?`)) return
    setLeaving(w.id)
    // Only refreshed on success — a failed request used to look like it worked.
    const err = await accountAction(`/api/account/waitlist/${w.id}`, "DELETE", "Impossible de retirer la demande. Réessayez.")
    setLeaving(null)
    if (err) window.alert(err)
    else reload()
  }

  return (
    <>
      <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Liste d'attente</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {rows.map((w) => {
          const st = WL_STATUS[w.status] || WL_STATUS.waiting
          return (
            <Card key={w.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800, fontSize: 14, minWidth: 0 }}>{w.service}</div>
                <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 12px", background: st.bg, color: st.c, whiteSpace: "nowrap" }}>{st.l}</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => leave(w)} disabled={leaving === w.id} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {leaving === w.id ? "Retrait…" : "Retirer ma demande"}
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>
                {w.salon?.slug ? (
                  <Link href={`/salon/${w.salon.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{w.salon.name}</Link>
                ) : (
                  w.salon?.name
                )}
                {" · "}Disponibilité : <b style={{ color: "var(--muted-2)" }}>{w.window}</b>
              </div>
              {w.offer && (
                <div style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700, marginTop: 7, lineHeight: 1.6 }}>
                  Le salon vous propose : <span style={{ textTransform: "capitalize" }}>{dLong(w.offer.startAt)}</span> à {dTime(w.offer.startAt)} — réservé pour vous jusqu'à {dTime(w.offer.holdUntil)}.
                  {w.salon?.phone ? (
                    <> Appelez le <a href={`tel:${w.salon.phone.replace(/\s/g, "")}`} style={{ color: "var(--green)", textDecoration: "underline" }}>{w.salon.phone}</a> pour confirmer.</>
                  ) : (
                    " Le salon vous contactera pour confirmer."
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}

/* ── Mes rendez-vous ─────────────────────────────────────────────── */
export function Rendezvous() {
  const { data, loading, error, reload } = useAccountFetch("bookings")
  const [cancelling, setCancelling] = useState(null)
  const [reviewing, setReviewing] = useState(null) // the past booking being rated
  const upcoming = data?.upcoming || []
  const past = data?.past || []

  const cancel = async (b) => {
    if (!window.confirm(`Annuler « ${b.service} » du ${dFull(b.startAt)} ?`)) return
    setCancelling(b.id)
    const err = await accountAction(`/api/account/bookings/${b.id}/cancel`, "POST", "Annulation impossible. Réessayez ou contactez le salon.")
    setCancelling(null)
    if (err) window.alert(err)
    else reload()
  }

  return (
    <>
      <H>Mes rendez-vous</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos réservations à venir et votre historique.</div>

      {loading ? (
        <Card role="status" style={{ textAlign: "center", padding: "30px 20px", color: "var(--muted)", fontSize: 13 }}>Chargement…</Card>
      ) : error ? (
        <LoadError error={error} reload={reload} />
      ) : upcoming.length === 0 ? (
        <Empty title="Aucun rendez-vous à venir" sub="Trouvez votre salon et réservez en ligne en quelques clics." cta="Réserver un rendez-vous" href="/recherche" />
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
                  <Link href={`/salon/${b.salon?.slug}`} title={b.salon?.name || "Rezervy"} style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-dark)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "8px 13px" }}>Voir le salon</Link>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: "var(--faint)" }}>Annulable jusqu'au début du rendez-vous</span>
                  {b.canCancel && (
                    <Link href={`/salon/${b.salon?.slug}/reserver?resched=${b.id}`} title="Reprogrammer ce rendez-vous" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 12, whiteSpace: "nowrap", flex: "none" }}>
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

      <WaitlistRequests />

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
                    {b.payment === "refund" && <span style={{ color: "var(--faint)", fontSize: 11.5 }}> · remboursement indiqué par le salon</span>}
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
                  {b.salon && <Link href={`/salon/${b.salon.slug}/reserver`} style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700, whiteSpace: "nowrap" }}>Réserver à nouveau</Link>}
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

function Stars({ value, onChange, label }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} sur 5`}
          aria-pressed={n === value}
          // Empty stars are outlined and drawn in --faint: the old hairline grey
          // was 1.3:1, an unreadable control (non-text contrast needs 3:1).
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 20, lineHeight: 1, color: n <= value ? "var(--gold)" : "var(--faint)" }}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  )
}

function ReviewModal({ booking, onClose, onDone }) {
  const boxRef = useRef(null)
  useDialogFocus(true, boxRef)
  // Escape closes, like every other dialog on the site.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])
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
      setErr(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 90 }}>
      <div ref={boxRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="review-title" onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, width: "100%", maxWidth: 460, padding: 22, maxHeight: "90vh", overflow: "auto", outline: "none" }}>
        <h2 id="review-title" style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>
          {prev ? "Modifier votre avis sur" : "Votre avis sur"} {booking.salon?.name}
        </h2>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
          {booking.service} · {dFull(booking.startAt)}
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {CRITERIA.map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 150 }}>{label}</div>
              <Stars label={label} value={scores[key]} onChange={(n) => setScores((s) => ({ ...s, [key]: n }))} />
            </div>
          ))}
        </div>

        <textarea
          aria-label="Votre avis"
          aria-describedby="review-help"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Racontez votre visite — ce qui vous a plu, ce qui pourrait être mieux."
          style={{ width: "100%", marginTop: 14, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", fontFamily: "inherit" }}
        />
        <div id="review-help" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
          Publié sur la page du salon sous votre prénom et l’initiale de votre nom (ex. « Sana B. »). 10 caractères minimum.
          {prev
            ? " Vous avez un seul avis par salon : celui-ci remplacera le précédent."
            : " Vous pourrez le modifier après une prochaine visite."}
        </div>
        {err && <div role="alert" style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 700, marginTop: 8 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} disabled={busy} style={{ background: "none", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "10px 16px", fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", cursor: "pointer" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={!complete || busy} style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 12.5, fontWeight: 800, cursor: complete && !busy ? "pointer" : "default", opacity: complete && !busy ? 1 : 0.55 }}>
            {busy ? "Envoi…" : prev ? "Mettre à jour mon avis" : "Publier mon avis"}
          </button>
        </div>
      </div>
    </div>
  )
}
