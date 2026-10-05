"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Long copy shown as a few lines with "Lire la suite".
 *
 * The full text is always in the HTML (search engines read it all); only its
 * visible height is clipped. Short texts are shown whole, with no button.
 */
export default function Expandable({ children, collapsedHeight = 220 }) {
  const box = useRef(null)
  const [open, setOpen] = useState(false)
  const [long, setLong] = useState(true) // assume long until measured, so the SSR page is already clipped

  useEffect(() => {
    if (box.current) setLong(box.current.scrollHeight > collapsedHeight + 40)
  }, [collapsedHeight])

  const clipped = long && !open
  return (
    <div>
      <div
        ref={box}
        className={clipped ? "expandable is-clipped" : "expandable"}
        style={{ maxHeight: clipped ? collapsedHeight : "none", overflow: "hidden", position: "relative" }}
      >
        {children}
      </div>
      {long && (
        <button type="button" className="expandable-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Réduire" : "Lire la suite"}
        </button>
      )}
    </div>
  )
}
