"use client"
import { Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LogoMark } from "./brand/Logo"

/* Page-to-page loading indicator — SEO-safe by construction.

   Why not `loading.js`: it makes every route stream, and once a response has
   started streaming its status code is locked to 200 — a missing salon or
   city would then answer "200 + noindex" (a soft 404) instead of a real 404.
   This site relies on `notFound()`, so routes must not stream early.

   So the loader lives only in the browser, only between pages:
   - nothing is rendered on the server or on first load (no splash: the first
     paint — and Google's speed metrics — stay exactly as they are);
   - a click on an internal link starts a thin progress bar at once;
   - if the next page takes longer than ~half a second, a small branded
     loader fades in on top — never covering the page for a fast navigation;
   - it never blocks clicks (pointer-events: none) and always clears itself:
     when the URL changes, on back/forward, or after 12 s at worst.

   Programmatic navigations can opt in with `startNavigationLoader()`. */

const START = "rzv:navstart"
const OVERLAY_AFTER_MS = 450
const FAILSAFE_MS = 12000

/** Call before a router.push() that may take a while. */
export function startNavigationLoader() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(START))
}

/** Is this click a same-site navigation to another page that Next will handle? */
function isInternalNav(e) {
  // Not `defaultPrevented`: next/link itself prevents the default to navigate client-side.
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  const a = e.target.closest?.("a[href]")
  if (!a || a.target && a.target !== "_self" || a.hasAttribute("download")) return false
  if (a.dataset.noLoader !== undefined) return false
  let url
  try {
    url = new URL(a.href, window.location.href)
  } catch {
    return false
  }
  if (url.origin !== window.location.origin) return false
  if (!/^https?:$/.test(url.protocol)) return false
  // Same page (or only its #anchor): nothing loads.
  return url.pathname + url.search !== window.location.pathname + window.location.search
}

function Loader() {
  const pathname = usePathname()
  const search = useSearchParams()
  const routeKey = `${pathname}?${search?.toString() ?? ""}`
  const [phase, setPhase] = useState("idle") // idle | loading | done
  const [overlay, setOverlay] = useState(false)
  const timers = useRef([])
  const lastKey = useRef(routeKey)

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const start = () => {
    clear()
    setPhase("loading")
    setOverlay(false)
    timers.current.push(setTimeout(() => setOverlay(true), OVERLAY_AFTER_MS))
    timers.current.push(setTimeout(() => finish(), FAILSAFE_MS))
  }
  const finish = () => {
    clear()
    setOverlay(false)
    setPhase((p) => (p === "loading" ? "done" : p))
    timers.current.push(setTimeout(() => setPhase("idle"), 380))
  }

  // Start on internal link clicks, back/forward, and explicit requests.
  useEffect(() => {
    const onClick = (e) => isInternalNav(e) && start()
    const onPop = () => start()
    document.addEventListener("click", onClick)
    window.addEventListener("popstate", onPop)
    window.addEventListener(START, start)
    return () => {
      document.removeEventListener("click", onClick)
      window.removeEventListener("popstate", onPop)
      window.removeEventListener(START, start)
      clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // The new page is in: finish.
  useEffect(() => {
    if (routeKey !== lastKey.current) {
      lastKey.current = routeKey
      finish()
    }
  }, [routeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "idle") return null
  return (
    <>
      <div className={`rzv-navbar-progress ${phase === "done" ? "is-done" : ""}`} aria-hidden="true" />
      {overlay && (
        <div className="rzv-nav-overlay" role="status" aria-live="polite">
          <div className="rzv-nav-card">
            <span className="rzv-mark-loop" style={{ color: "var(--ink)" }}>
              <LogoMark size={34} />
            </span>
            <span className="rzv-nav-label">Chargement…</span>
          </div>
        </div>
      )}
    </>
  )
}

/* useSearchParams must sit under a Suspense boundary: without it, Next would
   opt every page out of static rendering — exactly what we must not do. */
export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <Loader />
    </Suspense>
  )
}
