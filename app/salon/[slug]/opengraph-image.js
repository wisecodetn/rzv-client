import { ImageResponse } from "next/og"
import { salonSlugs, getSalon } from "@/lib/data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Salon sur Rezervy"

export async function generateStaticParams() {
  return (await salonSlugs()).map((slug) => ({ slug }))
}

export default async function OpengraphImage({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  const name = s?.name || "Rezervy"
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "84px", background: "linear-gradient(135deg,#5E35B1,#7C4DFF 55%,#4527A0)", color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 26, color: "#B388FF", letterSpacing: 6, fontWeight: 700 }}>REZERVY</div>
        <div style={{ fontSize: 62, fontWeight: 700, marginTop: 24, maxWidth: 960, lineHeight: 1.08 }}>{name}</div>
        {s && (
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#B388FF" }}>
            Note {s.rate}/5 · {s.rev} avis · {s.city} · dès {s.from} TND
          </div>
        )}
        <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "#F0E4CE" }}>Réservez en ligne — confirmation par SMS</div>
      </div>
    ),
    { ...size },
  )
}
