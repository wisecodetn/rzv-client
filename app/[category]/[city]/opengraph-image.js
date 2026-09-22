import { ImageResponse } from "next/og"
import { getCategory, getCity, getIndexedCategories, getCities, salonsFor } from "@/lib/data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Salons sur Rezervy"

export async function generateStaticParams() {
  const [cats, cities] = await Promise.all([getIndexedCategories(), getCities()])
  return cats.flatMap((c) => cities.map((city) => ({ category: c.slug, city: city.slug })))
}

/** OG image for /[category]/[city] — the REAL ville photo as backdrop, branded. */
export default async function OpengraphImage({ params }) {
  const { category, city } = await params
  const [cat, ct] = await Promise.all([getCategory(category), getCity(city)])
  const n = cat && ct ? (await salonsFor(cat.slug, ct.slug)).length : 0
  const title = cat && ct ? `${cat.name} à ${ct.name}` : "Rezervy"
  // satori can't decode WebP — use the API's JPEG transcode for the backdrop.
  const bg = ct?.image ? ct.image.replace("/media/", "/media-jpeg/") : null

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg,#1a1a1a,#000000 55%,#333333)" }}>
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", background: "linear-gradient(100deg, rgba(26,18,8,0.92) 0%, rgba(26,18,8,0.72) 45%, rgba(26,18,8,0.3) 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 84px" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#e0e0e0", letterSpacing: 6, fontWeight: 700 }}>REZERVY</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#FDF8EF", marginTop: 22, maxWidth: 940, lineHeight: 1.08 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#e0e0e0", marginTop: 24 }}>
            {n > 0 ? `${n} salon${n > 1 ? "s" : ""} à réserver en ligne — prix et avis vérifiés` : "Réservez votre salon en ligne"}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#F0E4CE", marginTop: 38 }}>Réservation en ligne 24h/24 — confirmation par SMS</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
