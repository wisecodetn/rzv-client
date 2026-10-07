import { ImageResponse } from "next/og"
import { getCategory, getIndexedCategories, categoryCities } from "@/lib/data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Catégorie sur Rezervy"

export async function generateStaticParams() {
  return (await getIndexedCategories()).map((c) => ({ category: c.slug }))
}

/** OG image for /[category] — branded card with the real salon count (1200×630). */
export default async function OpengraphImage({ params }) {
  const { category } = await params
  const cat = await getCategory(category)
  const cities = cat ? await categoryCities(cat.slug) : []
  // No photo backdrop: a full-bleed city photo made this PNG 1.1–1.4 MB, too
  // heavy for WhatsApp previews (~300 KB). Branded gradient only, like the
  // salon cards (~60 KB).
  const total = cities.reduce((t, c) => t + c.count, 0)
  const title = cat ? `${cat.name} en Tunisie` : "Rezervy"

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg,#1a1a1a,#000000 55%,#333333)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", background: "linear-gradient(100deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 84px" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#e0e0e0", letterSpacing: 6, fontWeight: 700 }}>REZERVY</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#FFFFFF", marginTop: 22, maxWidth: 900, lineHeight: 1.08 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#e0e0e0", marginTop: 24 }}>
            {total > 0 ? `${total} salon${total > 1 ? "s" : ""} dans ${cities.length} ville${cities.length > 1 ? "s" : ""} — prix et avis` : "Réservez votre salon en ligne"}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#E5E5E5", marginTop: 38 }}>Réservation en ligne 24h/24 — confirmation par e-mail</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
