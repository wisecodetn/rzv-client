"use client"

/* Pay this visit with a subscription credit, or at the salon.

   Shown on the booking page only when one of the customer's subscriptions at
   this salon includes the chosen service and has a credit left. Two explicit
   choices rather than a checkbox: what it costs either way is the decision.

   Theme tokens only — the site is monochrome and has a dark theme. */

const fmtDay = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })

function Pips({ qty, used, taking }) {
  // Past ten, dots stop being readable — a bar says the same thing.
  if (qty > 10) {
    return (
      <div style={{ height: 6, background: "var(--line)", borderRadius: 99, overflow: "hidden", width: 160 }}>
        <div style={{ width: `${Math.round(((used + (taking ? 1 : 0)) / qty) * 100)}%`, height: "100%", background: "var(--ink)", borderRadius: 99 }} />
      </div>
    )
  }
  return (
    <div style={{ display: "flex", gap: 5 }} aria-hidden="true">
      {Array.from({ length: qty }, (_, i) => {
        const isUsed = i < used
        const isThis = taking && i === used
        return (
          <span
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: isUsed ? "var(--faint)" : isThis ? "var(--green)" : "transparent",
              border: `1.5px solid ${isUsed ? "var(--faint)" : isThis ? "var(--green)" : "var(--line-strong)"}`,
              boxShadow: isThis ? "0 0 0 3px var(--green-soft)" : "none",
              transition: "all .15s",
            }}
          />
        )
      })}
    </div>
  )
}

function Option({ on, onClick, title, sub, price, was, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        flex: "1 1 200px",
        textAlign: "left",
        cursor: "pointer",
        background: "var(--card)",
        border: `1.5px solid ${on ? "var(--ink)" : "var(--line-2)"}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        color: "var(--ink)",
      }}
    >
      <span
        style={{
          flex: "none",
          marginTop: 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1.5px solid ${on ? "var(--ink)" : "var(--line-strong)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ink)" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "2px 8px", background: "var(--green-soft)", color: "var(--green)" }}>{badge}</span>
          )}
        </span>
        <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{ flex: "none", textAlign: "right" }}>
        {was != null && <span style={{ display: "block", fontSize: 11, color: "var(--faint)", textDecoration: "line-through" }}>{was} TND</span>}
        <span className="serif" style={{ fontSize: 18 }}>{price} <span style={{ fontSize: 11 }}>TND</span></span>
      </span>
    </button>
  )
}

export default function AboChooser({ abo, credit, options, onPickAbo, useAbo, setUseAbo, price, endDate, dateOk }) {
  const left = credit.left
  const after = useAbo ? left - 1 : left
  return (
    <section
      aria-label="Payer avec mon carnet"
      style={{ marginTop: 18, border: "1px solid var(--line-2)", borderRadius: 16, overflow: "hidden", background: "var(--bg)" }}
    >
      {/* Header: which subscription, until when */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
        <span
          style={{ flex: "none", width: 36, height: 36, borderRadius: 10, background: "var(--ink)", color: "var(--card)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
            <path d="M14 6v12" strokeDasharray="2 2.5" />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Votre carnet</div>
          {options.length > 1 ? (
            <select
              value={abo.id}
              onChange={(e) => onPickAbo(e.target.value)}
              style={{ marginTop: 2, background: "transparent", border: "none", padding: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)", cursor: "pointer", maxWidth: "100%" }}
            >
              {options.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{abo.name}</div>
          )}
        </div>
        {endDate && (
          <div style={{ flex: "none", fontSize: 11.5, color: "var(--muted)", textAlign: "right" }}>
            Valable jusqu'au
            <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: 12.5 }}>{fmtDay(endDate)}</div>
          </div>
        )}
      </div>

      {/* Credits for this service */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Pips qty={credit.qty} used={Math.min(credit.used, credit.qty)} taking={useAbo} />
        <div style={{ fontSize: 12.5, color: "var(--muted-2)" }}>
          <b style={{ color: "var(--ink)" }}>{credit.service}</b> · {left} séance{left > 1 ? "s" : ""} disponible{left > 1 ? "s" : ""}
          {useAbo && <> · il vous en restera <b style={{ color: "var(--ink)" }}>{after}</b></>}
        </div>
      </div>

      {/* The choice */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "0 16px 14px" }}>
        <Option
          on={useAbo}
          onClick={() => setUseAbo(true)}
          title="Avec mon carnet"
          badge="1 séance"
          sub="Rien à régler pour cette prestation"
          price={0}
          was={price}
        />
        <Option on={!useAbo} onClick={() => setUseAbo(false)} title="Régler au salon" sub="Votre séance reste disponible" price={price} />
      </div>

      {useAbo && !dateOk && endDate && (
        <div style={{ margin: "0 16px 14px", background: "var(--red-soft)", border: "1px solid var(--red-line)", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "var(--red)", fontWeight: 700, lineHeight: 1.5 }}>
          Votre carnet est valable jusqu'au {fmtDay(endDate)}. Choisissez une date avant, ou réglez au salon.
        </div>
      )}
    </section>
  )
}
