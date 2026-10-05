"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import MediaLightbox from "./MediaLightbox"

/**
 * The salon's photos, edge to edge.
 *
 * Desktop: one tall shot beside a grid of four, a "+N" badge for the rest.
 * Phones: the same markup becomes a swipeable strip (CSS in globals.css →
 * .salon-media) — one large photo per slide, the next one peeking so the swipe
 * is obvious, every photo reachable, a "1 / N" counter on top. A 2×2 grid of
 * 70px tiles made every photo unreadable on a phone.
 *
 * A cover is optional: when the salon has one it leads, otherwise the gallery
 * carries the block on its own. With no photos at all the block is omitted.
 * Every shot opens the full-size viewer.
 */
export default function SalonMedia({ name, cover, gallery = [] }) {
  const [openAt, setOpenAt] = useState(null)
  const [index, setIndex] = useState(0)
  const strip = useRef(null)
  const shots = [cover, ...gallery].filter(Boolean)
  if (!shots.length) return null

  const [lead, ...rest] = shots

  // Which slide is in view (phones only — on desktop the strip never scrolls).
  const onScroll = () => {
    const el = strip.current
    if (!el || !el.firstElementChild) return
    const w = el.firstElementChild.getBoundingClientRect().width + 10
    setIndex(Math.min(shots.length - 1, Math.round(el.scrollLeft / w)))
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={strip}
        onScroll={onScroll}
        className={`salon-media ${rest.length ? "" : "is-single"}`}
        style={{
          display: "grid",
          gridTemplateColumns: rest.length ? "minmax(0,1.55fr) minmax(0,1fr)" : "1fr",
          gap: 10,
          height: 340,
        }}
      >
        <Shot src={lead} alt={`${name} — photo principale`} eager radius={18} sizes="(max-width: 780px) 90vw, 60vw" onOpen={() => setOpenAt(0)} />
        {rest.length > 0 && (
          <div className="salon-media-side" style={{ display: "grid", gridTemplateColumns: rest.length > 1 ? "1fr 1fr" : "1fr", gridAutoRows: "1fr", gap: 10, minWidth: 0 }}>
            {rest.map((src, i) => (
              // Beyond the fourth, a photo has no tile on desktop — only the strip shows it.
              <div key={src} className={`salon-media-tile ${i >= 4 ? "is-extra" : ""}`} style={{ position: "relative", minWidth: 0, height: "100%" }}>
                <Shot src={src} alt={`${name} — photo ${i + 2}`} radius={14} sizes="(max-width: 780px) 90vw, 20vw" onOpen={() => setOpenAt(i + 1)} />
                {i === 3 && shots.length > 5 && (
                  <span
                    className="salon-media-more"
                    role="button"
                    tabIndex={0}
                    aria-label={`Voir les ${shots.length} photos`}
                    onClick={(e) => { e.stopPropagation(); setOpenAt(4) }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpenAt(4) } }}
                    style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#FFFFFF", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 10px", cursor: "pointer" }}
                  >
                    +{shots.length - 5}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phones: where you are in the strip. */}
      {shots.length > 1 && (
        <span className="salon-media-count" aria-hidden="true">
          {index + 1} / {shots.length}
        </span>
      )}

      <MediaLightbox shots={shots} name={name} openAt={openAt} onClose={() => setOpenAt(null)} />
    </div>
  )
}

function Shot({ src, alt, radius, eager, sizes, onOpen }) {
  return (
    <div
      onClick={onOpen}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } } : undefined}
      aria-label={onOpen ? `${alt} — agrandir` : undefined}
      className="salon-shot"
      style={{ position: "relative", height: "100%", borderRadius: radius, overflow: "hidden", background: "var(--line-2)", minWidth: 0, cursor: onOpen ? "zoom-in" : undefined }}
    >
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
