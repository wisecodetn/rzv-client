"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Where the salon is, on an OpenStreetMap tile layer.
 *
 * Leaflet touches `window` on import, so it is loaded lazily inside an effect
 * and only once the map scrolls into view — a map at the bottom of the page
 * shouldn't cost anything to visitors who never reach it.
 */
export default function SalonMap({ lat, lng, name, address, zoom = 15 }) {
  const holder = useRef(null)
  const map = useRef(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)

  // Only start loading when the map is close to the viewport.
  useEffect(() => {
    const el = holder.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return setVisible(true)
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "300px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || map.current || lat == null || lng == null) return
    let cancelled = false
    ;(async () => {
      try {
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")
        if (cancelled || !holder.current) return

        const m = L.map(holder.current, {
          center: [lat, lng],
          zoom,
          scrollWheelZoom: false, // don't hijack the page scroll
          attributionControl: true,
        })
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(m)

        // A plain div marker — Leaflet's default icon needs bundled image
        // assets, which Next would have to be told about for no benefit.
        const pin = L.divIcon({
          className: "",
          html:
            '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#A97C48;' +
            'transform:rotate(-45deg);border:2px solid #FDF8EF;box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 26],
        })
        L.marker([lat, lng], { icon: pin, title: name }).addTo(m)
        map.current = m
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [visible, lat, lng, zoom, name])

  if (lat == null || lng == null) return null

  // The map is drawn with OSM tiles, but turn-by-turn happens in Google Maps.
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div>
      <div
        ref={holder}
        aria-label={`Carte — ${name}`}
        style={{
          height: 220,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--line)",
          background: "var(--line-2)",
          position: "relative",
          zIndex: 0,
          isolation: "isolate",
        }}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12.5, color: "var(--muted-2)", flex: 1, minWidth: 0 }}>{address}</div>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            border: "1px solid rgba(169,124,72,0.45)",
            color: "var(--gold-dark)",
            borderRadius: 10,
            padding: "7px 14px",
            fontWeight: 800,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          Itinéraire
        </a>
      </div>
      {failed && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>La carte n’a pas pu être chargée.</div>
      )}
    </div>
  )
}
