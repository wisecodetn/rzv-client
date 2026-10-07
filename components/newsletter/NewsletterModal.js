"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import NewsletterForm, { nlStore } from "./NewsletterForm"
import { LogoMark } from "../brand/Logo"

/* The home page's newsletter invitation.

   SEO-safe by construction: browser-only (absent from the server HTML), and
   never on landing — it waits for the visitor to engage (a good scroll, or
   ~15 s on the page), which is what keeps it clear of Google's "intrusive
   interstitial" rule. Once per visitor: after a sign-up it never returns, and
   after a "non merci" it stays away for 30 days. */

const DELAY_MS = 15000
const SCROLL_RATIO = 0.4
const SNOOZE_MS = 30 * 86_400_000

const PERKS = [
  "Les nouveaux salons près de chez vous",
  "Nos conseils et tendances beauté",
  "Les nouveautés de Rezervy",
]

/** No auto-focus on touch screens: it would throw the keyboard up unasked. */
const finePointer = () => typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches

function shouldOffer() {
  const s = nlStore.get()
  if (!s) return true
  if (s.status === "subscribed") return false
  return Date.now() - (s.at || 0) > SNOOZE_MS
}

export default function NewsletterModal() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const boxRef = useRef(null)
  const lastFocus = useRef(null)

  // Arm the triggers — whichever comes first.
  useEffect(() => {
    if (!shouldOffer()) return
    let fired = false
    const fire = () => {
      if (fired) return
      // A visitor busy with another dialog — or talking to the assistant — is
      // not interrupted; try later.
      if (document.querySelector('[role="dialog"][aria-modal="true"], .rzv-assist.is-open')) return
      // Nor is someone typing: a modal snatching focus mid-word from the
      // search field sent keystrokes into the newsletter box.
      const el = document.activeElement
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      fired = true
      cleanup()
      lastFocus.current = document.activeElement
      setOpen(true)
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_RATIO) fire()
    }
    const t = setInterval(() => {
      if (performance.now() >= DELAY_MS) fire()
    }, 1000)
    window.addEventListener("scroll", onScroll, { passive: true })
    function cleanup() {
      clearInterval(t)
      window.removeEventListener("scroll", onScroll)
    }
    return cleanup
  }, [])

  // Declared before the effect that uses it, and tracking `done`: the Escape
  // handler used to keep the `close` from when the modal opened, which still
  // saw done=false — so Escape after subscribing recorded "dismissed".
  const close = useCallback(() => {
    if (!done) nlStore.set({ status: "dismissed", at: Date.now() })
    setOpen(false)
    lastFocus.current?.focus?.()
  }, [done])

  // While open: Esc closes, focus stays inside, the page does not scroll.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.classList.add("rzv-modal-open")
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e) => {
      if (e.key === "Escape") close()
      if (e.key === "Tab" && boxRef.current) {
        const f = boxRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]):not([disabled])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      root.classList.remove("rzv-modal-open")
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  if (!open) return null

  return (
    <div className="nl-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={boxRef} className="nl-modal" role="dialog" aria-modal="true" aria-labelledby="nl-modal-title" aria-describedby="nl-modal-desc">
        <button type="button" className="nl-modal-x" onClick={close} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18 M6 6l12 12" />
          </svg>
        </button>

        <div className="nl-modal-art" aria-hidden="true">
          <span className="nl-modal-mark">
            <LogoMark size={64} animate />
          </span>
          <div className="nl-modal-art-line">La beauté en Tunisie, dans votre boîte mail.</div>
        </div>

        <div className="nl-modal-body">
          <div className="nl-modal-kicker">Newsletter Rezervy</div>
          <h2 id="nl-modal-title" className="nl-modal-title">
            {done ? "Bienvenue parmi nous !" : "Restez au courant"}
          </h2>
          {done ? (
            <p id="nl-modal-desc" className="nl-modal-text">
              Votre inscription est enregistrée. À très vite dans votre boîte mail.
            </p>
          ) : (
            <>
              <p id="nl-modal-desc" className="nl-modal-text">
                Recevez de temps en temps le meilleur de Rezervy :
              </p>
              <ul className="nl-modal-perks">
                {PERKS.map((p) => (
                  <li key={p}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </>
          )}

          {done ? (
            <button type="button" className="nl-btn" style={{ marginTop: 18 }} onClick={close}>
              Continuer la visite
            </button>
          ) : (
            <>
              <div style={{ marginTop: 16 }}>
                <NewsletterForm source="home_modal" autoFocus={finePointer()} onDone={() => setDone(true)} />
              </div>
              <p className="nl-fine">
                Pas de spam, désinscription en un clic. Voir notre{" "}
                <Link href="/confidentialite" prefetch={false}>
                  politique de confidentialité
                </Link>
                .
              </p>
              <button type="button" className="nl-modal-later" onClick={close}>
                Non merci
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
