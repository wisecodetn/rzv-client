import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Rezervy — Réservez votre moment beauté, partout en Tunisie"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "84px", background: "linear-gradient(135deg,#333333,#1a1a1a 55%,#000000)", color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 30, color: "#e0e0e0", letterSpacing: 8, fontWeight: 700 }}>REZERVY</div>
        <div style={{ fontSize: 66, fontWeight: 700, marginTop: 26, maxWidth: 940, lineHeight: 1.08 }}>
          Réservez votre moment beauté, partout en Tunisie
        </div>
        <div style={{ fontSize: 30, color: "#e0e0e0", marginTop: 30 }}>
          Coiffure · Barbier · Onglerie · Spa — réservation en ligne 24h/24
        </div>
        <div style={{ display: "flex", marginTop: 46, fontSize: 24, color: "#F0E4CE" }}>Note 4,8 / 5 · 480+ salons · 65 000 rendez-vous / mois</div>
      </div>
    ),
    { ...size },
  )
}
