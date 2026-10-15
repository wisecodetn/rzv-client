"use client"
import { useState } from "react"

/**
 * The price list's tabs. Every panel is rendered (so search engines read the
 * whole list); the inactive ones are just hidden. Keyboard: arrow keys move
 * between tabs, as on a native tab list.
 */
export default function TarifsTabs({ tabs }) {
  const [active, setActive] = useState(0)
  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    setActive(next)
    document.getElementById(`tarifs-tab-${next}`)?.focus()
  }
  return (
    <div>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Catégories de tarifs" onKeyDown={onKey} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {tabs.map((t, i) => (
            <button
              key={i}
              id={`tarifs-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`tarifs-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                border: "1px solid " + (i === active ? "var(--gold-dark)" : "var(--line)"),
                background: i === active ? "var(--gold-dark)" : "var(--card)",
                color: i === active ? "#fff" : "var(--ink)",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
      {tabs.map((t, i) => (
        <div key={i} id={`tarifs-panel-${i}`} role="tabpanel" aria-labelledby={`tarifs-tab-${i}`} hidden={i !== active}>
          {t.intro && <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.7, margin: "0 0 18px", maxWidth: 680 }}>{t.intro}</p>}
          {t.groups.map((g, gi) => (
            <section key={gi} style={{ marginBottom: 22 }}>
              {g.heading && <h2 className="serif" style={{ fontSize: 19, fontWeight: 400, margin: "0 0 10px" }}>{g.heading}</h2>}
              <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--accent-soft)" }}>
                      <th scope="col" style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--muted)" }}>Désignation</th>
                      <th scope="col" style={{ textAlign: "right", padding: "10px 18px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--muted)" }}>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r, ri) => (
                      <tr key={ri} style={{ borderTop: "1px solid var(--line)" }}>
                        <td style={{ padding: "13px 18px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                          {r.note && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.55 }}>{r.note}</div>}
                        </td>
                        <td style={{ padding: "13px 18px", textAlign: "right", fontWeight: 800, fontSize: 14, color: "var(--gold-dark)", whiteSpace: "nowrap", verticalAlign: "top" }}>{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ))}
    </div>
  )
}
