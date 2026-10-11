"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import SalonCard from "./SalonCard"

const DELAY_MS = 4500

/**
 * Home page partners carousel — Rezervy's partner salons (admin "Mettre en
 * avant"). 4 cards per view on a laptop, 3 then 2 on narrower screens, 1 on a
 * phone (widths in globals.css, `.partners-track`). It advances one card at a
 * time on its own and loops back at the end.
 *
 * Built on native horizontal scrolling with scroll-snap, so a phone swipes it
 * like any carousel and every card stays a plain, crawlable link. The motion
 * stops while the visitor is on it (hover, focus, touch), while the tab is
 * hidden, and entirely for people who asked for reduced motion.
 */
export default function PartnersCarousel({ salons }) {
  const track = useRef(null)
  const [paused, setPaused] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const step = useCallback(() => {
    const el = track.current
    const card = el?.firstElementChild
    if (!el || !card) return 0
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    return card.getBoundingClientRect().width + gap
  }, [])

  const go = useCallback(
    (dir) => {
      const el = track.current
      if (!el) return
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (dir > 0 && end) el.scrollTo({ left: 0, behavior: "smooth" })
      else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" })
      else el.scrollBy({ left: dir * step(), behavior: "smooth" })
    },
    [step],
  )

  // Whether there is anything to scroll, and where we are — for the arrows.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => {
      setOverflow(el.scrollWidth > el.clientWidth + 4)
      setAtStart(el.scrollLeft <= 4)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      el.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [salons])

  // Auto-advance.
  useEffect(() => {
    if (paused || !overflow) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      if (!document.hidden) go(1)
    }, DELAY_MS)
    return () => clearInterval(id)
  }, [paused, overflow, go])

  if (!salons?.length) return null
  return (
    <div
      style={{ position: "relative", marginTop: 18 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div ref={track} className="partners-track" role="list" aria-label="Salons partenaires de Rezervy">
        {salons.map((s) => (
          <div key={s.slug} role="listitem" className="partners-item">
            <SalonCard salon={s} />
          </div>
        ))}
      </div>
      {overflow && (
        <>
          <button type="button" className="partners-arrow" data-side="prev" aria-label="Salons précédents" onClick={() => go(-1)} disabled={atStart && atEnd}>
            ‹
          </button>
          <button type="button" className="partners-arrow" data-side="next" aria-label="Salons suivants" onClick={() => go(1)} disabled={atStart && atEnd}>
            ›
          </button>
        </>
      )}
    </div>
  )
}
