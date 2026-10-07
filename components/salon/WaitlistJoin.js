"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { errorText } from "@/lib/errors"

/* Join the salon's waiting list instead of picking a créneau.

   Only rendered for salons whose plan includes the waiting list (the API says
   so on the salon: `salon.waitlist`), and the API checks again on submit. The
   request lands in the salon's own Liste d'attente; when a slot frees up the
   salon proposes it, and the customer sees it in "Mes rendez-vous".

   The window is stated, not typed: "when" and "what time of day" map exactly
   onto what the salon's matching understands. */

const WHEN = [
  { id: "asap", label: "Dès que possible" },
  { id: "this_week", label: "Cette semaine" },
  { id: "weekend", label: "Ce week-end" },
  { id: "specific", label: "Un jour précis" },
]
const MOMENT = [
  { id: "any", label: "Peu importe" },
  { id: "morning", label: "Le matin" },
  { id: "afternoon", label: "L'après-midi" },
  { id: "evening", label: "En fin de journée" },
]

const lbl = { fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }
const chip = (on) => ({
  fontSize: 12.5,
  fontWeight: 700,
  border: `1px solid ${on ? "var(--ink)" : "var(--line-2)"}`,
  background: on ? "var(--line-soft)" : "var(--card)",
  color: on ? "var(--ink)" : "var(--muted-2)",
  borderRadius: 10,
  padding: "8px 13px",
  cursor: "pointer",
})
const dayKey = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`

export default function WaitlistJoin({ salon, svc, staffId, date, user, authReady, full = false }) {
  const router = useRouter()
  const [open, setOpen] = useState(full)
  const [when, setWhen] = useState(full && date ? "specific" : "asap")
  const [moment, setMoment] = useState("any")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [joined, setJoined] = useState(null)

  // A full day is the most common reason to be here: open on it, that day pre-picked.
  useEffect(() => {
    if (full && date) setWhen("specific")
  }, [full, date])

  const dateLabel = date ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : ""
  const needsDate = when === "specific" && !date

  const signIn = () => {
    const back = `/salon/${salon.slug}/reserver?svc=${encodeURIComponent(svc.id)}`
    router.push(`/connexion?next=${encodeURIComponent(back)}`)
  }

  const join = async () => {
    if (needsDate || busy) return
    setBusy(true)
    setErr("")
    try {
      const res = await fetch("/api/account/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salonSlug: salon.slug,
          ...(svc.isPack ? { packageId: svc.packId } : { serviceId: svc.id, staffId: staffId && staffId !== "any" ? staffId : null }),
          window: when,
          moment,
          date: when === "specific" && date ? dayKey(date) : null,
          note: note.trim() || null,
        }),
      })
      const d = await res.json().catch(() => null)
      if (res.status === 401) return signIn()
      if (!res.ok) throw new Error(d?.message || "Impossible de rejoindre la liste d'attente.")
      setJoined(d)
    } catch (e) {
      setErr(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const box = {
    marginTop: 16,
    background: "var(--bg)",
    border: "1px solid var(--line-2)",
    borderRadius: 14,
    padding: "16px 18px",
  }

  if (joined) {
    return (
      <div style={box}>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--green)" }}>✓ Vous êtes sur la liste d'attente</div>
        <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 6, lineHeight: 1.6 }}>
          {joined.service} · <b style={{ color: "var(--ink)" }}>{joined.window}</b>. Si un créneau se libère, {salon.name} vous le
          proposera{user?.phone ? <> et pourra vous joindre au <b style={{ color: "var(--ink)" }}>{user.phone}</b></> : null}.
          <br />
          Suivez ou retirez votre demande dans{" "}
          <Link href="/compte/rendez-vous" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Mes rendez-vous</Link>.
        </div>
      </div>
    )
  }

  if (!open && !full) {
    return (
      <div style={{ ...box, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>Aucun créneau ne vous convient ?</div>
          <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 3 }}>
            Rejoignez la liste d'attente : le salon vous proposera un créneau dès qu'il s'en libère un.
          </div>
        </div>
        <button onClick={() => setOpen(true)} style={{ ...chip(true), padding: "9px 15px" }}>Rejoindre la liste d'attente</button>
      </div>
    )
  }

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--gold-dark)" }}>
        {full ? "Cette journée est complète — rejoignez la liste d'attente" : "Liste d'attente"}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 5, lineHeight: 1.6 }}>
        Dites-nous quand vous êtes disponible. Si un créneau se libère pour <b style={{ color: "var(--ink)" }}>{svc.n}</b>, le salon vous le
        proposera en priorité.
      </div>

      <div style={{ ...lbl, marginTop: 14 }}>Quand ?</div>
      <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
        {WHEN.map((w) => (
          <button type="button" key={w.id} aria-pressed={when === w.id} onClick={() => setWhen(w.id)} style={chip(when === w.id)}>
            {w.id === "specific" && date ? <span style={{ textTransform: "capitalize" }}>{`Le ${dateLabel}`}</span> : w.label}
          </button>
        ))}
      </div>
      {needsDate && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 7 }}>Choisissez le jour dans le calendrier ci-dessus.</div>
      )}

      <div style={{ ...lbl, marginTop: 14 }}>À quel moment ?</div>
      <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
        {MOMENT.map((m) => (
          <button type="button" key={m.id} aria-pressed={moment === m.id} onClick={() => setMoment(m.id)} style={chip(moment === m.id)}>{m.label}</button>
        ))}
      </div>

      <label htmlFor="wl-note" style={{ ...lbl, display: "block", marginTop: 14 }}>
        Message au salon <span style={{ textTransform: "none", fontWeight: 600, letterSpacing: 0 }}>(optionnel)</span>
      </label>
      <textarea
        id="wl-note"
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 300))}
        rows={2}
        placeholder="Ex. : disponible dès 15 min de préavis"
        style={{ width: "100%", marginTop: 8, background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", fontFamily: "inherit" }}
      />

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        {authReady && !user ? (
          <button onClick={signIn} className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
            Se connecter pour rejoindre
          </button>
        ) : (
          <button
            onClick={join}
            disabled={needsDate || busy}
            className={needsDate || busy ? undefined : "btn-gold"}
            style={{ background: needsDate || busy ? "var(--line-2)" : "var(--gold)", color: needsDate || busy ? "var(--faint)" : "var(--on-gold)", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5, cursor: needsDate || busy ? "default" : "pointer" }}
          >
            {busy ? "Envoi…" : "Rejoindre la liste d'attente"}
          </button>
        )}
        {!full && (
          <button type="button" onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", padding: 0, font: "inherit", fontSize: 12, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}>Annuler</button>
        )}
      </div>
      {err && <div role="alert" style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, marginTop: 8 }}>{err}</div>}
    </div>
  )
}
