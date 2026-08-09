"use client"
import { useEffect, useRef } from "react"

const CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
const JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L)
    if (!document.querySelector(`link[data-leaflet]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = CSS
      link.setAttribute("data-leaflet", "1")
      document.head.appendChild(link)
    }
    let sc = document.querySelector(`script[data-leaflet]`)
    if (sc) {
      if (window.L) return resolve(window.L)
      sc.addEventListener("load", () => resolve(window.L))
      return
    }
    sc = document.createElement("script")
    sc.src = JS
    sc.setAttribute("data-leaflet", "1")
    sc.onload = () => resolve(window.L)
    document.body.appendChild(sc)
  })
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))

export default function SalonMap({ salons = [], height = 520, onSearchArea, areaActive, onResetArea }) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const ptsRef = useRef([])

  useEffect(() => {
    let alive = true
    const withGeo = salons.filter((s) => s.geo)
    const pts = withGeo.map((s) => [s.geo.lat, s.geo.lng])
    ptsRef.current = pts
    let ro = null

    const build = (L) => {
      if (!alive || !ref.current || mapRef.current || !L) return
      // Defer init until the container has a real size (it may start hidden on mobile).
      if (ref.current.offsetHeight === 0 || ref.current.offsetWidth === 0) return
      const center = pts.length ? [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] : [36.845, 10.24]
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, 12)
      mapRef.current = map
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map)
      withGeo.forEach((s) => {
        L.marker([s.geo.lat, s.geo.lng], { icon: L.divIcon({ className: "", html: `<div class="map-pin">${esc(s.name)}</div>`, iconSize: null, iconAnchor: [40, 14] }) })
          .addTo(map)
          .bindPopup(`<b>${esc(s.name)}</b><br>★ ${esc(s.rate)} · dès ${s.from} TND<br><a href="/salon/${s.slug}">Voir la page</a>`)
      })
      if (pts.length > 1) map.fitBounds(pts, { padding: [34, 34] })
    }

    loadLeaflet().then((L) => {
      if (!alive || !ref.current || !L) return
      build(L)
      // Re-check size on resize / when the container is revealed (mobile list↔map toggle).
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (!mapRef.current) build(L)
          else mapRef.current.invalidateSize()
        })
        ro.observe(ref.current)
      }
    })

    return () => {
      alive = false
      if (ro) ro.disconnect()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [salons])

  const searchArea = () => {
    const m = mapRef.current
    if (!m || !onSearchArea) return
    const b = m.getBounds()
    onSearchArea({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() })
  }
  const resetArea = () => {
    const m = mapRef.current
    if (m && ptsRef.current.length > 1) m.fitBounds(ptsRef.current, { padding: [34, 34] })
    onResetArea && onResetArea()
  }

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={ref} style={{ position: "absolute", inset: 0, background: "#e9e3d6" }} aria-label="Carte des salons" />
      {onSearchArea && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 500 }}>
          <button onClick={searchArea} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, boxShadow: "0 2px 12px var(--shadow-strong)", cursor: "pointer", whiteSpace: "nowrap" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2.2" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
            Rechercher dans cette zone
          </button>
          {areaActive && (
            <button onClick={resetArea} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 999, padding: "9px 15px", fontSize: 12.5, fontWeight: 800, boxShadow: "0 2px 12px var(--shadow-strong)", cursor: "pointer", whiteSpace: "nowrap" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4" /></svg>
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  )
}
