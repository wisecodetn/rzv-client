"use client"
import { useState } from "react"

export default function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(0)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {faqs.map(([q, a], i) => {
        const isOpen = open === i
        return (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="row-hover"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", width: "100%", background: "transparent", border: "none", textAlign: "left" }}
            >
              <span style={{ fontWeight: 800, fontSize: 13.5, flex: 1, minWidth: 0, color: "var(--ink)" }}>{q}</span>
              <span style={{ color: "var(--gold)", fontWeight: 800, fontSize: 16 }}>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <div style={{ padding: "0 18px 16px", fontSize: 13, color: "var(--muted-2)", lineHeight: 1.7 }}>{a}</div>}
          </div>
        )
      })}
    </div>
  )
}
