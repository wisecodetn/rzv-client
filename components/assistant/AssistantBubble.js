"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/* L'assistant Rezervy — the chat bubble.

   The AI itself is not built yet, and the bubble says so: it greets, points
   to the pages that already answer most questions, and its input is visibly
   disabled ("bientôt"). Nothing pretends to chat.

   SEO / speed: browser-only and mounted late (after the page is idle), so it
   is absent from the server HTML, never competes with the page's first paint,
   and costs ~15 KB of images once mounted. Styles: globals.css → .rzv-assist. */

const TEASER_KEY = "rzv:assist-teaser"
const MOUNT_AFTER_MS = 1800
const TEASER_AFTER_MS = 6000

const LINKS = [
  { href: "/recherche", label: "Trouver un salon", d: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3" },
  { href: "/gerer-rendez-vous", label: "Gérer un rendez-vous", d: "M4 5h16v16H4z M4 9.5h16 M8.5 3v4 M15.5 3v4" },
  { href: "/centre-aide", label: "Centre d’aide", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6 M12 17h.01" },
  { href: "/contact", label: "Contacter l’équipe", d: "M4 6h16v12H4z M4 7l8 6 8-6" },
]

const store = {
  get(k) {
    try {
      return window.sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      window.sessionStorage.setItem(k, v)
    } catch {}
  },
}

/** The robot: a face layer + a glowing-eyes layer that blinks on its own. */
export function AssistantAvatar({ size = 56, big = false }) {
  const n = big || size > 64 ? 320 : 192
  return (
    <span className="rzv-assist-face" style={{ width: size, height: size }} aria-hidden="true">
      <img src={`/assistant/face-${n}.webp`} alt="" width={size} height={size} draggable={false} />
      <img className="rzv-assist-eyes" src={`/assistant/eyes-${n}.webp`} alt="" width={size} height={size} draggable={false} />
    </span>
  )
}

/** Three little strokes that pop beside the head — the "ding!" of the image. */
function Sparks() {
  return (
    <svg className="rzv-assist-sparks" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 9 12 3" />
      <path d="M12 13 20 9" />
      <path d="M13 18.5 21 19" />
    </svg>
  )
}

export default function AssistantBubble() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [typing, setTyping] = useState(true)
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  // Mount once the page has settled — never during the first paint.
  useEffect(() => {
    let idle
    const t = setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 2500 })
      else setReady(true)
    }, MOUNT_AFTER_MS)
    return () => {
      clearTimeout(t)
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle)
    }
  }, [])

  // A one-line hello, once per visit.
  useEffect(() => {
    if (!ready || store.get(TEASER_KEY)) return
    const t = setTimeout(() => {
      // Never on top of another invitation (e.g. the newsletter modal).
      if (!document.documentElement.classList.contains("rzv-modal-open")) setTeaser(true)
    }, TEASER_AFTER_MS)
    return () => clearTimeout(t)
  }, [ready])

  // Leaving a page closes the panel (its links navigate).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Opening: a short "typing…" before the greeting; focus moves into the panel.
  useEffect(() => {
    if (!open) return
    setTyping(true)
    const t = setTimeout(() => setTyping(false), 1100)
    panelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const dismissTeaser = () => {
    setTeaser(false)
    store.set(TEASER_KEY, "1")
  }
  const toggle = () => {
    dismissTeaser()
    setOpen((o) => !o)
  }

  if (!ready) return null

  return (
    <div className={`rzv-assist ${open ? "is-open" : ""}`}>
      {open && (
        <div
          ref={panelRef}
          id="rzv-assist-panel"
          className="rzv-assist-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="rzv-assist-title"
          tabIndex={-1}
        >
          <div className="rzv-assist-head">
            <span className="rzv-assist-head-avatar">
              <AssistantAvatar size={44} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div id="rzv-assist-title" className="rzv-assist-title">
                Assistant Rezervy
              </div>
              <div className="rzv-assist-sub">
                <span className="rzv-assist-soon">Bientôt disponible</span>
              </div>
            </div>
            <button type="button" className="rzv-assist-x" onClick={() => setOpen(false)} aria-label="Fermer l’assistant">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18 M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="rzv-assist-body" aria-live="polite">
            {typing ? (
              <div className="rzv-assist-msg rzv-assist-typing" aria-label="L’assistant écrit…">
                <i />
                <i />
                <i />
              </div>
            ) : (
              <>
                <div className="rzv-assist-msg">
                  Bonjour 👋 Je suis l’assistant Rezervy.
                </div>
                <div className="rzv-assist-msg" style={{ animationDelay: "120ms" }}>
                  Je serai bientôt là pour répondre à vos questions et vous aider à réserver. En attendant, voici où trouver
                  ce qu’il vous faut :
                </div>
                <div className="rzv-assist-links" style={{ animationDelay: "240ms" }}>
                  {LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="rzv-assist-link">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={l.d} />
                      </svg>
                      {l.label}
                      <span aria-hidden="true" className="rzv-assist-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Visibly not a working chat yet. */}
          <div className="rzv-assist-foot">
            <input className="rzv-assist-input" disabled placeholder="Le chat arrive bientôt…" aria-label="Message (bientôt disponible)" />
            <button type="button" className="rzv-assist-send" disabled aria-label="Envoyer (bientôt disponible)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13 M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {teaser && !open && (
        <div className="rzv-assist-teaser" role="status">
          <button type="button" className="rzv-assist-teaser-body" onClick={toggle}>
            Bonjour ! Besoin d’un coup de main&nbsp;?
          </button>
          <button type="button" className="rzv-assist-teaser-x" onClick={dismissTeaser} aria-label="Masquer">
            ×
          </button>
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        className="rzv-assist-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="rzv-assist-panel"
        aria-label={open ? "Fermer l’assistant Rezervy" : "Ouvrir l’assistant Rezervy"}
      >
        <span className="rzv-assist-ring" aria-hidden="true" />
        <span className="rzv-assist-bob">
          <AssistantAvatar size={58} />
        </span>
        {!open && <Sparks />}
        <span className="rzv-assist-close" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18 M6 6l12 12" />
          </svg>
        </span>
      </button>
    </div>
  )
}
