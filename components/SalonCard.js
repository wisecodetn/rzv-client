import Link from "next/link"
import Photo from "./Photo"
import FavButton from "./FavButton"
import Image from "next/image"

/** Marketplace salon card (home + search). `first`: the card at the top of a
 *  listing, likely the largest thing on screen — its photo is preloaded. */
export default function SalonCard({ salon, first = false }) {
  return (
    <div style={{ position: "relative" }}>
    <FavButton slug={salon.slug} name={salon.name} variant="icon" size={36} />
    <Link
      href={`/salon/${salon.slug}`}
      title={`${salon.name} — ${salon.kind}, ${salon.city}`}
      className="card-hover"
      style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", display: "block", color: "var(--ink)" }}
    >
      <div style={{ height: 140, position: "relative" }}>
        <Photo label={`Photo — ${salon.name}`}>{salon.cover && <Image src={salon.cover} alt={`${salon.name} — photo du salon`} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 100vw, 360px" preload={first} />}</Photo>
        <div
          style={{
            position: "absolute", right: 12, bottom: -14, width: 44, height: 44, borderRadius: 13, background: "var(--card)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
          className="serif"
        >
          {/* 44px tile: ask for a 44px image (it used to fetch 300px for every card). */}
          {salon.logo ? <Image src={salon.logo} alt={`${salon.name} — logo`} fill sizes="44px" style={{ objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>{salon.ini}</span>}
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>{salon.name}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{salon.kind} · {salon.city}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
          {Number(salon.rev) > 0 ? (
            <>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gold-dark)" }}>★ {salon.rate}</span>
              <span style={{ fontSize: 11.5, color: "var(--muted)" }}>({salon.rev} avis)</span>
            </>
          ) : (
            // No reviews yet: say so plainly rather than "★ (0 avis)".
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--ink)", background: "var(--accent-soft)", borderRadius: 999, padding: "3px 9px" }}>Nouveau</span>
          )}
          <span style={{ flex: 1 }} />
          {salon.from != null && (
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              dès <span style={{ fontWeight: 800, color: "var(--ink)" }}>{salon.from} TND</span>
            </span>
          )}
        </div>
      </div>
    </Link>
    </div>
  )
}
