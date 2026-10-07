import { ImageResponse } from "next/og"
import { MARK } from "@/components/brand/mark"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Rezervy — Réservez votre moment beauté en Tunisie"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "84px", background: "linear-gradient(135deg,#333333,#1a1a1a 55%,#000000)", color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={Math.round(64 * MARK.ratio)} height={64} viewBox={MARK.viewBox} fill="#FFFFFF">
            <path d={MARK.body} />
            <path d={MARK.dot} />
          </svg>
          <div style={{ fontSize: 40, color: "#FFFFFF", fontWeight: 700, letterSpacing: 1 }}>Rezervy</div>
        </div>
        <div style={{ fontSize: 66, fontWeight: 700, marginTop: 26, maxWidth: 940, lineHeight: 1.08 }}>
          Réservez votre moment beauté en Tunisie
        </div>
        <div style={{ fontSize: 30, color: "#e0e0e0", marginTop: 30 }}>
          Coiffure · Barbier · Onglerie · Spa — réservation en ligne 24h/24
        </div>
        <div style={{ display: "flex", marginTop: 46, fontSize: 24, color: "#E5E5E5" }}>Réservation gratuite · paiement au salon</div>
      </div>
    ),
    { ...size },
  )
}
