"use client"
import { useEffect } from "react"

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard behaviour of a modal dialog, as the newsletter modal already does
 * it: focus moves into the dialog when it opens, Tab / Shift+Tab stay inside
 * it, and focus goes back to whatever opened it when it closes. Escape is left
 * to the dialog itself (each one already closes on it).
 */
export function useDialogFocus(open, ref) {
  useEffect(() => {
    if (!open || !ref.current) return
    const opener = document.activeElement
    const box = ref.current
    const items = () => [...box.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0)
    ;(items()[0] || box).focus()

    const onKey = (e) => {
      if (e.key !== "Tab") return
      const list = items()
      if (!list.length) return e.preventDefault()
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus()
    }
  }, [open, ref])
}
