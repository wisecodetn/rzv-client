"use client"

import { useState } from "react"

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n)
const fr = (n) => (n == null ? "—" : String(n).replace(".", ","))

/**
 * The salon's reputation, in one compact card.
 *
 * "Note globale" breaks the score down by criterion — a salon rated 4,8 on
 * savoir-faire but 3,2 on propreté is a very different proposition from one
 * that averages 4,0 everywhere, and a single number hides that. "Avis" lists
 * what people actually wrote.
 */
export default function SalonReviews({ ratings, reviews = [] }) {
  const [tab, setTab] = useState("note")
  const count = ratings?.count ?? 0
  const criteria = (ratings?.criteria ?? []).filter((c) => c.score != null)

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--line-soft)", marginBottom: 14 }}>
        <Tab active={tab === "note"} onClick={() => setTab("note")}>
          Note globale
        </Tab>
        <Tab active={tab === "avis"} onClick={() => setTab("avis")}>
          Avis ({count})
        </Tab>
      </div>

      {count === 0 ? (
        <Empty>Aucun avis pour le moment.</Empty>
      ) : tab === "note" ? (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{fr(ratings.overall)}</div>
            <div>
              <div style={{ color: "var(--amber)", fontSize: 13, letterSpacing: 2 }}>
                {stars(Math.round(ratings.overall ?? 0))}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                {count} avis vérifié{count > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {criteria.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {criteria.map((c) => (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ fontSize: 12, color: "var(--muted-2)", flex: 1, minWidth: 0 }}>{c.label}</div>
                  <div style={{ width: 74, height: 6, borderRadius: 999, background: "var(--line-2)", overflow: "hidden", flex: "none" }}>
                    <div style={{ width: `${(c.score / 5) * 100}%`, height: "100%", borderRadius: 999, background: "var(--gold)" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, width: 26, textAlign: "right", flex: "none" }}>{fr(c.score)}</div>
                </div>
              ))}
            </div>
          ) : (
            // Reviews imported before the criteria existed only carry a total.
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Détail par critère indisponible sur ces avis.</div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 330, overflowY: "auto" }}>
          {reviews.map((rv, i) => (
            <div key={rv.id ?? i} style={{ borderBottom: i < reviews.length - 1 ? "1px solid var(--line-soft)" : "none", paddingBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 12.5 }}>{rv.n}</div>
                <div style={{ fontSize: 11, color: "var(--amber)", letterSpacing: 1.5 }}>{stars(rv.starsNum)}</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{rv.date}</div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted-2)", lineHeight: 1.6, marginTop: 5 }}>{rv.txt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
        padding: "0 0 9px",
        marginBottom: -1,
        fontWeight: active ? 800 : 600,
        fontSize: 13,
        color: active ? "var(--ink)" : "var(--muted)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

function Empty({ children }) {
  return (
    <div
      style={{
        background: "var(--line-2)",
        borderRadius: 12,
        padding: "34px 16px",
        textAlign: "center",
        fontSize: 13,
        color: "var(--muted)",
      }}
    >
      {children}
    </div>
  )
}
