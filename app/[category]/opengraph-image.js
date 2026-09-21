import { ImageResponse } from "next/og"
import { getCategory, getIndexedCategories, categoryCities } from "@/lib/data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Catégorie sur Rezervy"

export async function generateStaticParams() {
  return (await getIndexedCategories()).map((c) => ({ category: c.slug }))
}

/** OG image for /[category] — the category's leading city photo as backdrop,
 *  branded (1200×630, the size social crawlers want). */
export default async function OpengraphImage({ params }) {
  const { category } = await params
  const cat = await getCategory(category)
  const cities = cat ? await categoryCities(cat.slug) : []
  // satori can't decode WebP — use the API's JPEG transcode for the backdrop.
  const bg = (cities.find((c) => c.image)?.image || null)?.replace("/media/", "/media-jpeg/") || null
  const total = cities.reduce((t, c) => t + c.count, 0)
  const title = cat ? `${cat.name} en Tunisie` : "Rezervy"

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg,#5E35B1,#7C4DFF 55%,#4527A0)" }}>
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", background: "linear-gradient(100deg, rgba(26,18,8,0.92) 0%, rgba(26,18,8,0.75) 45%, rgba(26,18,8,0.35) 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 84px" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#B388FF", letterSpacing: 6, fontWeight: 700 }}>REZERVY</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#FDF8EF", marginTop: 22, maxWidth: 900, lineHeight: 1.08 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#B388FF", marginTop: 24 }}>
            {total > 0 ? `${total} salon${total > 1 ? "s" : ""} dans ${cities.length} ville${cities.length > 1 ? "s" : ""} — prix et avis vérifiés` : "Réservez votre salon en ligne"}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#F0E4CE", marginTop: 38 }}>Réservation en ligne 24h/24 — confirmation par SMS</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
