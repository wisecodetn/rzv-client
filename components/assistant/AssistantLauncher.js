"use client"
import { useEffect, useRef, useState } from "react"

/**
 * Loads the assistant bubble's code only once the page has finished loading
 * and gone idle. The bubble (≈700 lines) used to be imported by the root
 * layout, so every page shipped and parsed it up front even though it only
 * appears seconds later. It still shows at about the same moment: the bubble
 * keeps its own short delay after mounting.
 *
 * A question asked from the page before the code is here (AskAssistant fires
 * "rzv:assistant") is not lost: it triggers the load at once and is handed
 * over as soon as the bubble listens.
 */
export default function AssistantLauncher() {
  const [Bubble, setBubble] = useState(null)
  const queued = useRef(null)
  const loading = useRef(false)

  useEffect(() => {
    const load = () => {
      if (loading.current) return
      loading.current = true
      import("./AssistantBubble").then((m) => setBubble(() => m.default)).catch(() => { loading.current = false })
    }
    const onAsk = (e) => {
      if (Bubble) return // the bubble handles it itself
      queued.current = e.detail
      load()
    }
    window.addEventListener("rzv:assistant", onAsk)

    let idle, timer
    const whenIdle = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(load, { timeout: 3000 })
      else timer = setTimeout(load, 1500)
    }
    if (document.readyState === "complete") whenIdle()
    else window.addEventListener("load", whenIdle, { once: true })

    return () => {
      window.removeEventListener("rzv:assistant", onAsk)
      window.removeEventListener("load", whenIdle)
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle)
      clearTimeout(timer)
    }
  }, [Bubble])

  // Child effects run before this one, so the bubble's listener is in place.
  useEffect(() => {
    if (!Bubble || !queued.current) return
    const detail = queued.current
    queued.current = null
    window.dispatchEvent(new CustomEvent("rzv:assistant", { detail }))
  }, [Bubble])

  return Bubble ? <Bubble /> : null
}
