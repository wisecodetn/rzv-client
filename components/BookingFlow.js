"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { flatServices } from "@/lib/salon-utils"

const DEPOSIT_PCT = 30
const fmtD = (m) => (m >= 60 ? Math.floor(m / 60) + "h" + (m % 60 ? String(m % 60).padStart(2, "0") : "") : m + " min")
const T = (m) => Math.floor(m / 60) + "h" + String(m % 60).padStart(2, "0")
const sel = (on) => (on ? ["rgba(169,124,72,0.6)", "rgba(169,124,72,0.09)"] : ["var(--line-2)", "transparent"])
const DATES = [
  { l: "Auj.", sub: "aujourd'hui" }, { l: "Demain", sub: "11 créneaux" }, { l: "Ven", sub: "6 créneaux" },
  { l: "Sam", sub: "Complet", full: true }, { l: "Dim", sub: "Fermé", closed: true }, { l: "Lun", sub: "9 créneaux" },
]
const SLOTS = [540, 570, 600, 660, 690, 750, 780, 840, 870, 930, 990, 1050]
const PAY = [
  ["Flouci", "Paiement mobile instantané"], ["e-Dinar SmartPay", "Carte postale e-Dinar"],
  ["Carte bancaire", "Visa, Mastercard"], ["Sur place", "Espèces ou carte au salon"],
]

export default function BookingFlow({ salon, preselect = null }) {
  const router = useRouter()
  const flat = useMemo(() => flatServices(salon), [salon])
  const staff = salon.team

  const [step, setStep] = useState(1)
  const [svcs, setSvcs] = useState(preselect != null && flat[preselect] ? [preselect] : [])
  const [staffId, setStaffId] = useState(null)
  const [dateI, setDateI] = useState(0)
  const [time, setTime] = useState(null)
  const [payI, setPayI] = useState(0)
  const [booked, setBooked] = useState(false)
  const [wlPhone, setWlPhone] = useState("")
  const [wlJoined, setWlJoined] = useState(false)

  const svcSel = svcs.map((i) => flat[i])
  const total = svcSel.reduce((t, x) => t + x.p, 0)
  const totalM = svcSel.reduce((t, x) => t + x.m, 0)
  const deposit = Math.max(1, Math.round((total * DEPOSIT_PCT) / 100))
  const staffIds = staff.map((p) => p.id)
  const okStaff = svcSel.length ? staffIds.filter((id) => svcSel.every((x) => x.who.includes(id))) : staffIds
  const stf = staff.find((p) => p.id === staffId)
  const stI = Math.max(0, staffIds.indexOf(staffId))
  const durB = Math.max(totalM, 30)
  const dateFull = !!DATES[dateI].full

  const toggleSvc = (i) => {
    const ns = svcs.includes(i) ? svcs.filter((j) => j !== i) : [...svcs, i]
    setTime(null)
    if (staffId && !ns.map((j) => flat[j]).every((x) => x.who.includes(staffId))) setStaffId(null)
    setSvcs(ns)
  }
  const proceed = step === 1 ? svcs.length > 0 : step === 2 ? !!staffId : step === 3 ? time != null && !dateFull : true
  const next = () => {
    if (!proceed) return
    step < 4 ? setStep(step + 1) : setBooked(true)
  }

  const sumSvc = svcSel.map((x) => x.n).join(" + ") || "—"
  const sumStaff = stf ? stf.n.split(" ")[0] : "—"
  const sumWhen = time != null ? DATES[dateI].l.toLowerCase() + " à " + T(time) : "—"

  const steps = ["Services", "Praticien(ne)", "Créneau", "Acompte"]
  const cardBox = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, marginTop: 18 }
  const lbl = { fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }

  if (booked) {
    const ref = "RZV-" + (4000 + ((total * 7 + totalM) % 900))
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "40px 30px", textAlign: "center", marginTop: 24 }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(62,142,117,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <span style={{ color: "var(--green)", fontSize: 26, fontWeight: 800 }}>✓</span>
        </div>
        <div className="serif" style={{ fontSize: 24, marginTop: 16 }}>Réservation confirmée</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.7 }}>
          {sumSvc} · {sumWhen} avec {sumStaff}<br />
          Référence <span style={{ fontWeight: 800, color: "var(--ink)" }}>{ref}</span> · confirmation envoyée par SMS
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <Link href={`/salon/${salon.slug}`} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 11, padding: "11px 18px", fontWeight: 700, fontSize: 12.5 }}>Retour au salon</Link>
          <button onClick={() => router.push("/compte")} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 12.5 }}>Voir mes rendez-vous</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Link href={`/salon/${salon.slug}`} style={{ fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 700, display: "inline-block", marginBottom: 14 }}>← {salon.name}</Link>
      <h1 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 400 }}>Réserver</h1>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
        {steps.map((l, i) => {
          const n = i + 1, cur = step === n, done = step > n
          return (
            <button key={l} onClick={() => n < step && setStep(n)} style={{ flex: 1, background: "none", border: "none", textAlign: "left", padding: 0 }}>
              <div style={{ height: 4, borderRadius: 99, background: cur ? "var(--gold)" : done ? "rgba(169,124,72,0.45)" : "#E2D9C6" }} />
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 6, color: cur ? "var(--gold-dark)" : done ? "var(--gold)" : "var(--faint)" }}>{n} · {l}</div>
            </button>
          )
        })}
      </div>

      <div style={cardBox}>
        {step === 1 && (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={lbl}>Services — sélection multiple</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700 }}>{svcs.length ? `${svcs.length} · ${fmtD(totalM)} · ${total} TND` : "Aucun service"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8, marginTop: 12 }}>
              {flat.map((s, i) => {
                const on = svcs.includes(i)
                const [bd, bg] = sel(on)
                return (
                  <button key={i} onClick={() => toggleSvc(i)} style={{ border: `1px solid ${bd}`, background: bg, borderRadius: 12, padding: "11px 13px", textAlign: "left" }}>
                    <div style={{ display: "flex", fontSize: 12.5, fontWeight: 700, gap: 7, alignItems: "center" }}>
                      <span style={{ width: 15, height: 15, borderRadius: 5, border: `1.5px solid ${on ? "var(--gold)" : "rgba(42,36,28,0.3)"}`, background: on ? "var(--gold)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FDF8EF", fontSize: 10, fontWeight: 900, flex: "none" }}>{on ? "✓" : ""}</span>
                      <span>{s.n}</span>
                      <span style={{ flex: 1 }} />
                      <span style={{ color: "var(--gold-dark)" }}>{s.p} TND</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, paddingLeft: 24 }}>{s.cat} · {s.d}</div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={lbl}>Avec qui ?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
              {staff.map((p) => {
                const dis = !okStaff.includes(p.id), on = staffId === p.id
                const [bd, bg] = sel(on)
                return (
                  <button key={p.id} onClick={() => !dis && (setStaffId(p.id), setTime(null))} style={{ display: "flex", alignItems: "center", gap: 11, border: `1px solid ${bd}`, background: bg, borderRadius: 12, padding: "11px 13px", opacity: dis ? 0.4 : 1, textAlign: "left" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: p.c, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#2A1A08", flex: "none" }}>{p.ini}</span>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{p.n}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.r}</div></div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: dis ? "var(--faint)" : "var(--green)" }}>{dis ? "Ne réalise pas ces services" : "Disponible"}</div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={lbl}>Date</div>
            <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
              {DATES.map((d, i) => {
                const on = dateI === i
                const [bd, bg] = sel(on && !d.closed)
                return (
                  <button key={i} onClick={() => !d.closed && (setDateI(i), setTime(null))} style={{ border: `1px solid ${bd}`, background: bg, borderRadius: 11, padding: "9px 15px", textAlign: "center", opacity: d.closed ? 0.45 : 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? "var(--gold-dark)" : "var(--ink)", whiteSpace: "nowrap" }}>{d.l}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: d.full ? "var(--amber)" : d.closed ? "var(--faint)" : "var(--muted)", marginTop: 2, whiteSpace: "nowrap" }}>{d.sub}</div>
                  </button>
                )
              })}
            </div>
            {!dateFull && (
              <>
                <div style={{ ...lbl, marginTop: 18 }}>Heure — disponibilités de {stf ? stf.n.split(" ")[0] : "l'équipe"}</div>
                <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                  {SLOTS.map((m) => {
                    const free = !!staffId && (((m / 30 + dateI * 3 + stI * 2) | 0) % 4 !== 1) && m + durB <= 1140
                    const on = time === m
                    const [bd, bg] = sel(on)
                    return (
                      <button key={m} onClick={() => free && setTime(m)} style={{ fontSize: 12.5, fontWeight: 700, border: `1px solid ${free ? bd : "var(--line-soft)"}`, background: free ? bg : "var(--line-soft)", borderRadius: 10, padding: "8px 14px", color: on ? "var(--gold-dark)" : free ? "var(--muted-2)" : "var(--faint)", textDecoration: free ? "none" : "line-through", cursor: free ? "pointer" : "default" }}>{T(m)}</button>
                    )
                  })}
                </div>
              </>
            )}
            {dateFull && (
              <div style={{ marginTop: 18, background: "rgba(201,162,39,0.09)", border: "1px solid rgba(201,162,39,0.35)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "#8A6A17" }}>Cette journée est complète</div>
                {!wlJoined ? (
                  <>
                    <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 5, lineHeight: 1.6 }}>Rejoignez la liste d'attente : si un créneau se libère, vous recevrez un SMS avec un lien de réservation prioritaire, valable 30 minutes.</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <input value={wlPhone} onChange={(e) => setWlPhone(e.target.value)} placeholder="+216 …" style={{ flex: 1, minWidth: 160, background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--ink)", outline: "none" }} />
                      <button onClick={() => setWlJoined(true)} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 12.5 }}>Rejoindre la liste d'attente</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--green)", fontWeight: 700, marginTop: 8 }}>✓ Vous êtes sur la liste d'attente — nous vous préviendrons par SMS.</div>
                )}
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div style={lbl}>Récapitulatif</div>
            <div style={{ background: "var(--bg)", borderRadius: 14, padding: "16px 18px", marginTop: 10, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <Row k="Services" v={sumSvc} />
              <Row k="Avec" v={sumStaff} />
              <Row k="Quand" v={sumWhen} />
              <div style={{ display: "flex", borderTop: "1px solid var(--line)", paddingTop: 9, marginTop: 3 }}>
                <div style={{ color: "var(--muted)", width: 110 }}>Total</div>
                <div style={{ fontWeight: 800 }}>{total} TND <span style={{ fontWeight: 600, color: "var(--muted)", fontSize: 12 }}>· acompte {deposit} TND</span></div>
              </div>
            </div>
            <div style={{ ...lbl, marginTop: 18 }}>Paiement de l'acompte</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8, marginTop: 10 }}>
              {PAY.map(([l, sub], i) => {
                const on = payI === i
                const [bd, bg] = sel(on)
                return (
                  <button key={l} onClick={() => setPayI(i)} style={{ border: `1px solid ${bd}`, background: bg, borderRadius: 12, padding: "12px 14px", textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: on ? "var(--gold-dark)" : "var(--ink)" }}>{l}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{sub}</div>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 14, background: "rgba(169,124,72,0.08)", border: "1px solid rgba(169,124,72,0.25)", borderRadius: 12, padding: "12px 15px", fontSize: 12.5, color: "var(--gold-dark)" }}>
              {payI === 3
                ? `Aucun paiement en ligne — le salon peut demander une confirmation SMS 24h avant. Total de ${total} TND à régler sur place.`
                : `Acompte de ${deposit} TND (${DEPOSIT_PCT}% du total) débité maintenant — le solde de ${total - deposit} TND se règle au salon. Remboursé si annulation à plus de 24h.`}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 20 }}>
          {step > 1 && <button onClick={() => setStep(Math.max(1, step - 1))} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 11, padding: "11px 17px", fontWeight: 700, fontSize: 12.5, flex: "none" }}>← Retour</button>}
          <div style={{ flex: 1 }} />
          <button onClick={next} disabled={!proceed} style={{ background: proceed ? "var(--gold)" : "#E2D9C6", color: proceed ? "#FDF8EF" : "var(--faint)", border: "none", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 13, cursor: proceed ? "pointer" : "default", flex: "none" }}>
            {step < 4 ? "Continuer →" : payI === 3 ? "Confirmer la réservation" : `Payer ${deposit} TND et confirmer`}
          </button>
        </div>
      </div>
    </>
  )
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ color: "var(--muted)", width: 110 }}>{k}</div>
      <div style={{ fontWeight: 700 }}>{v}</div>
    </div>
  )
}
