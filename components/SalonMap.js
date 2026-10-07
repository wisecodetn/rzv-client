"use client"
import { useEffect, useLayoutEffect, useRef } from "react"
import "./salon-map.css"

/**
 * Leaflet from the npm package, fetched once and shared with the salon page's
 * map (components/salon/SalonMap.js). It used to be injected from unpkg with
 * no integrity check — a second copy of a library already in the bundle.
 */
let leaflet = null
function loadLeaflet() {
  return (leaflet ||= Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([m]) => m.default))
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))

/** A pin: a teardrop with a dot. Styled in globals.css (.rzv-pin), active state via class. */
const PIN_HTML = `<div class="rzv-pin"><svg viewBox="0 0 30 40" width="30" height="40" aria-hidden="true"><path class="rzv-pin-body" d="M15 1C7.3 1 1 7.1 1 14.7 1 25 15 39 15 39s14-14 14-24.3C29 7.1 22.7 1 15 1z"/><circle class="rzv-pin-dot" cx="15" cy="14.5" r="5"/></svg></div>`

/** The popup: what a visitor needs to decide — and the two ways forward. */
function popupHtml(s, withListButton) {
  const where = [s.area, s.city].filter(Boolean).join(", ")
  const logo = s.logo
    ? `<a class="rzv-pop-media" href="/salon/${esc(s.slug)}" aria-hidden="true" tabindex="-1"><img src="${esc(s.logo)}" alt="" loading="lazy"/></a>`
    : ""
  return `<div class="rzv-pop">
    ${logo}
    <div class="rzv-pop-body">
      <a class="rzv-pop-name" href="/salon/${esc(s.slug)}">${esc(s.name)}</a>
      <div class="rzv-pop-meta">${Number(s.rev) > 0 ? `<span class="rzv-pop-rate">★ ${esc(s.rate)}</span> <span>(${esc(s.rev)} avis)</span>` : `<span class="rzv-pop-new">Nouveau</span>`}${where ? ` · ${esc(where)}` : ""}</div>
      ${s.address ? `<div class="rzv-pop-addr">${esc(s.address)}</div>` : ""}
      <div class="rzv-pop-row">
        ${s.slotLabel ? `<span class="rzv-pop-badge ${s.open ? "is-open" : ""}">${esc(s.slotLabel)}</span>` : ""}
        <span class="rzv-pop-price">dès <b>${esc(s.from)} TND</b></span>
      </div>
      <div class="rzv-pop-actions">
        <a class="rzv-pop-btn is-primary" href="/salon/${esc(s.slug)}/reserver">Réserver</a>
        <a class="rzv-pop-btn" href="/salon/${esc(s.slug)}">Voir le salon</a>
      </div>
      ${withListButton ? `<button type="button" class="rzv-pop-list" data-list="${esc(s.slug)}">Voir dans la liste ↓</button>` : ""}
    </div>
  </div>`
}

/**
 * Salons on a map: a pin per salon. Clicking a pin opens a popup and tells the
 * page (`onSelect(slug)`) so it can bring that salon into view in the list.
 * `activeSlug` highlights a pin (e.g. while its row is hovered).
 * `onShowInList(slug)` adds a "Voir dans la liste" button to the popup — for
 * the mobile drawer, where the list is not beside the map.
 */
export default function SalonMap({ salons = [], height = 520, onSearchArea, areaActive, onResetArea, onSelect, activeSlug, onShowInList }) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const ptsRef = useRef([])
  const markersRef = useRef(new Map())
  const sigRef = useRef(null)
  const salonsRef = useRef(salons)
  // Callbacks change identity on every render; read them through refs so the
  // map is not torn down and rebuilt each time.
  const cb = useRef({})
  // Updated after commit, not during render (a render may be thrown away).
  useLayoutEffect(() => {
    cb.current = { onSelect, onShowInList, areaActive }
  })

  /**
   * Put the current salons on the map. The map itself is built once; a new
   * list (a filter, another page) only swaps the pins — rebuilding the whole
   * map re-downloaded its tiles and jumped the view on every click. The view
   * is refitted to the pins, except after "Rechercher dans cette zone": there
   * the visitor chose the view, and it stays.
   */
  const syncMarkers = () => {
    const L = leafletRef.current
    const map = mapRef.current
    if (!L || !map) return
    const withGeo = salonsRef.current.filter((s) => s.geo)
    const sig = withGeo.map((s) => s.slug).join("|")
    if (sig === sigRef.current) return
    sigRef.current = sig
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = new Map()
    const icon = L.divIcon({ className: "rzv-pin-wrap", html: PIN_HTML, iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -38] })
    withGeo.forEach((s) => {
      const m = L.marker([s.geo.lat, s.geo.lng], { icon, title: s.name, riseOnHover: true, keyboard: true })
        .addTo(map)
        .bindPopup(popupHtml(s, !!cb.current.onShowInList), { className: "rzv-popup", minWidth: 264, maxWidth: 264, autoPanPaddingTopLeft: [24, 80], autoPanPaddingBottomRight: [24, 24] })
      m.on("click", () => cb.current.onSelect?.(s.slug))
      markersRef.current.set(s.slug, m)
    })
    const pts = withGeo.map((s) => [s.geo.lat, s.geo.lng])
    ptsRef.current = pts
    if (cb.current.areaActive) return
    if (pts.length > 1) map.fitBounds(pts, { padding: [46, 46] })
    else if (pts.length === 1) map.setView(pts[0], 14)
  }

  // The map: built once, when it first comes on screen.
  useEffect(() => {
    let alive = true
    let ro = null

    const build = (L) => {
      if (!alive || !ref.current || mapRef.current || !L) return
      // Defer init until the container has a real size (it may start hidden on mobile).
      if (ref.current.offsetHeight === 0 || ref.current.offsetWidth === 0) return
      const pts = salonsRef.current.filter((s) => s.geo).map((s) => [s.geo.lat, s.geo.lng])
      const center = pts.length ? [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] : [36.845, 10.24]
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, 12)
      mapRef.current = map
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map)
      // "Voir dans la liste" lives inside the popup's HTML.
      map.on("popupopen", (e) => {
        const btn = e.popup.getElement()?.querySelector("[data-list]")
        if (btn) btn.addEventListener("click", () => cb.current.onShowInList?.(btn.getAttribute("data-list")), { once: true })
      })
      sigRef.current = null
      syncMarkers()
    }

    const start = () =>
      loadLeaflet().then((L) => {
        if (!alive || !ref.current || !L) return
        leafletRef.current = L
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

    // Fetch Leaflet only once the map is actually on screen. On phones the side
    // map is display:none (it never intersects) and the drawer map mounts only
    // when opened — so a phone that never opens the map downloads nothing.
    let io = null
    if (typeof IntersectionObserver === "undefined") start()
    else {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return
          io.disconnect()
          io = null
          start()
        },
        { rootMargin: "200px" },
      )
      io.observe(ref.current)
    }

    return () => {
      alive = false
      if (io) io.disconnect()
      if (ro) ro.disconnect()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current = new Map()
      sigRef.current = null
    }
    // Built once; the pins follow `salons` in the effect below.
  }, [])

  // The pins: follow the list.
  useEffect(() => {
    salonsRef.current = salons
    syncMarkers()
  }, [salons])

  // Highlight the active pin and bring it to the front.
  useEffect(() => {
    markersRef.current.forEach((m, slug) => {
      const el = m.getElement?.()
      if (!el) return
      const on = slug === activeSlug
      el.classList.toggle("is-active", on)
      m.setZIndexOffset(on ? 1000 : 0)
    })
  }, [activeSlug, salons])

  const searchArea = () => {
    const m = mapRef.current
    if (!m || !onSearchArea) return
    const b = m.getBounds()
    onSearchArea({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() })
  }
  const resetArea = () => {
    const m = mapRef.current
    if (m && ptsRef.current.length > 1) m.fitBounds(ptsRef.current, { padding: [46, 46] })
    onResetArea && onResetArea()
  }

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={ref} style={{ position: "absolute", inset: 0, background: "var(--inset)" }} aria-label="Carte des salons" />
      {onSearchArea && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 500 }}>
          <button onClick={searchArea} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, boxShadow: "0 2px 12px var(--shadow-strong)", cursor: "pointer", whiteSpace: "nowrap" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2.2" strokeLinecap="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" /></svg>
            Rechercher dans cette zone
          </button>
          {areaActive && (
            <button onClick={resetArea} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 999, padding: "9px 15px", fontSize: 12.5, fontWeight: 800, boxShadow: "0 2px 12px var(--shadow-strong)", cursor: "pointer", whiteSpace: "nowrap" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4" /></svg>
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  )
}
