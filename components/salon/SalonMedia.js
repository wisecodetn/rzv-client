import Image from "next/image"
import Photo from "@/components/Photo"

/**
 * The salon's photos, edge to edge.
 *
 * A cover is optional: when the salon has one it leads, otherwise the gallery
 * carries the block on its own and the identity is held by the logo in the
 * header. With no photos at all the placeholder keeps the layout intact.
 */
export default function SalonMedia({ name, cover, gallery = [] }) {
  const shots = [cover, ...gallery].filter(Boolean)
  if (!shots.length) {
    return (
      <div style={{ height: 300, borderRadius: 18, overflow: "hidden" }}>
        <Photo label={`${name} — photo`} />
      </div>
    )
  }

  const [lead, ...rest] = shots
  const side = rest.slice(0, 4)

  return (
    <div
      style={{
        display: "grid",
        // One tall shot beside a grid of the others; stacks on narrow screens.
        gridTemplateColumns: side.length ? "minmax(0,1.55fr) minmax(0,1fr)" : "1fr",
        gap: 10,
        height: 340,
      }}
      className="salon-media"
    >
      <Shot src={lead} alt={`${name} — photo principale`} eager radius={18} sizes="(max-width: 780px) 100vw, 60vw" />
      {side.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: side.length > 1 ? "1fr 1fr" : "1fr",
            gridAutoRows: "1fr",
            gap: 10,
            minWidth: 0,
          }}
        >
          {side.map((src, i) => (
            <div key={src} style={{ position: "relative", minWidth: 0, height: "100%" }}>
              <Shot src={src} alt={`${name} — photo ${i + 2}`} radius={14} sizes="(max-width: 780px) 50vw, 20vw" />
              {i === side.length - 1 && shots.length > 5 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.5)",
                    color: "#FDF8EF",
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "4px 10px",
                  }}
                >
                  +{shots.length - 5}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Shot({ src, alt, radius, eager, sizes }) {
  return (
    <div style={{ position: "relative", height: "100%", borderRadius: radius, overflow: "hidden", background: "var(--line-2)", minWidth: 0 }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        // `priority` is deprecated in Next 16 — the lead photo is the LCP element.
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        style={{ objectFit: "cover" }}
      />
    </div>
  )
}
