"use client"

import { useState } from "react"
import Link from "next/link"

/** A long menu is unreadable — show a category's first few, then unfold. */
const VISIBLE = 6

/**
 * The salon's menu, one card per category. Booking links carry the service id
 * so the booking page can preselect it and add more.
 *
 * Also renders the salon's packages ("prestations personnalisées") so both lists
 * look and behave the same: a row may bring its own `href`, a struck-through
 * `was` price, and a `featured` flag. A group with no `cat` has no header row.
 */
export default function ServiceGroups({ slug, groups }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g, i) => (
        <Group key={g.cat ?? `g${i}`} slug={slug} group={g} />
      ))}
    </div>
  )
}

function Group({ slug, group }) {
  const [open, setOpen] = useState(false)
  const hidden = group.rows.length - VISIBLE
  // Every service is in the HTML; past the first few they are only hidden
  // until "Voir plus" — a salon's full price list is what people search for.

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
      {group.cat && (
      <div
        style={{
          padding: "12px 18px",
          fontWeight: 800,
          borderBottom: "1px solid var(--line-soft)",
          color: "var(--gold-dark)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontSize: 11.5,
          display: "flex",
          gap: 8,
        }}
      >
        <span>{group.cat}</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--muted)", fontWeight: 700 }}>{group.rows.length}</span>
      </div>
      )}

      {group.rows.map((sv, i) => (
        <div
          key={sv.id ?? sv.n}
          className="row-hover"
          hidden={!open && i >= VISIBLE}
          style={{ display: !open && i >= VISIBLE ? "none" : "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span>{sv.n}</span>
              {sv.featured && (
                <span style={{ background: "var(--gold)", color: "var(--on-gold)", fontSize: 9.5, fontWeight: 800, borderRadius: 999, padding: "2px 8px", letterSpacing: "0.04em" }}>
                  RECOMMANDÉ
                </span>
              )}
            </div>
            {sv.d && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{sv.d}</div>}
            {/* The salon's own words about this prestation — optional, so only
                when written. */}
            {sv.desc && (
              <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 4, lineHeight: 1.5 }}>{sv.desc}</div>
            )}
          </div>
          <div style={{ fontWeight: 800, fontSize: 13.5, textAlign: "right", whiteSpace: "nowrap" }}>
            {sv.p} <span style={{ fontSize: 10.5, color: "var(--gold)" }}>TND</span>
            {sv.was != null && sv.was > sv.p && (
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textDecoration: "line-through" }}>{sv.was} TND</div>
            )}
          </div>
          <Link
            href={sv.href ?? `/salon/${slug}/reserver?svc=${encodeURIComponent(sv.id ?? "")}`}
            className="btn-outline"
            style={{
              background: "transparent",
              border: "1px solid var(--accent-line)",
              color: "var(--gold-dark)",
              borderRadius: 10,
              padding: "8px 16px",
              fontWeight: 800,
              fontSize: 12,
              whiteSpace: "nowrap",
              flex: "none",
            }}
          >
            Réserver
          </Link>
        </div>
      ))}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            padding: "12px 18px",
            fontWeight: 800,
            fontSize: 12.5,
            color: "var(--gold-dark)",
            cursor: "pointer",
          }}
        >
          {open ? "Voir moins" : `Voir plus (${hidden})`}
        </button>
      )}
    </div>
  )
}
