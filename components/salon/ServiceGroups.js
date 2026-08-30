"use client"

import { useState } from "react"
import Link from "next/link"

/** A long menu is unreadable — show a category's first few, then unfold. */
const VISIBLE = 6

/**
 * The salon's menu, one card per category. Booking links carry the service id
 * so the booking page can preselect it and add more.
 */
export default function ServiceGroups({ slug, groups }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g) => (
        <Group key={g.cat} slug={slug} group={g} />
      ))}
    </div>
  )
}

function Group({ slug, group }) {
  const [open, setOpen] = useState(false)
  const hidden = group.rows.length - VISIBLE
  const rows = open ? group.rows : group.rows.slice(0, VISIBLE)

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
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

      {rows.map((sv) => (
        <div
          key={sv.id ?? sv.n}
          className="row-hover"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{sv.n}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{sv.d}</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>
            {sv.p} <span style={{ fontSize: 10.5, color: "var(--gold)" }}>TND</span>
          </div>
          <Link
            href={`/salon/${slug}/reserver?svc=${encodeURIComponent(sv.id ?? "")}`}
            className="btn-outline"
            style={{
              background: "transparent",
              border: "1px solid rgba(169,124,72,0.45)",
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
