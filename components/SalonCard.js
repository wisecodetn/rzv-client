import Link from "next/link"
import Photo from "./Photo"
import FavButton from "./FavButton"

/** Marketplace salon card (home + search). */
export default function SalonCard({ salon }) {
  return (
    <div style={{ position: "relative" }}>
    <FavButton slug={salon.slug} variant="icon" size={36} />
    <Link
      href={`/salon/${salon.slug}`}
      title={`${salon.name} — ${salon.kind}, ${salon.city}`}
      className="card-hover"
      style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", display: "block", color: "var(--ink)" }}
    >
      <div style={{ height: 140, position: "relative" }}>
        <Photo label={`Photo — ${salon.name}`} />
        <div
          style={{
            position: "absolute", right: 12, bottom: -14, width: 44, height: 44, borderRadius: 13, background: "var(--card)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          }}
          className="serif"
        >
          <span style={{ fontSize: 20 }}>{salon.ini}</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>{salon.name}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{salon.kind} · {salon.city}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gold-dark)" }}>★ {salon.rate}</span>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>({salon.rev} avis)</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
            dès <span style={{ fontWeight: 800, color: "var(--ink)" }}>{salon.from} TND</span>
          </span>
        </div>
      </div>
    </Link>
    </div>
  )
}
