"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useDialogFocus } from "@/lib/use-dialog-focus"

/**
 * Full-size viewer for a salon's photos.
 *
 * A gallery thumbnail is a crop; the photo a salon chose to upload deserves to
 * be seen whole, and with eight or more shots the grid alone cannot show them.
 * Opens on any image, moves with the arrow keys or the on-screen controls, and
 * closes on Escape or a click outside.
 *
 * Mounted by the server-rendered page, which stays a server component — only
 * this piece is interactive.
 */
export default function MediaLightbox({ shots = [], name, openAt = null, onClose }) {
  const [i, setI] = useState(openAt ?? 0)
  const open = openAt !== null
  const boxRef = useRef(null)
  useDialogFocus(open && shots.length > 0, boxRef)

  useEffect(() => { if (openAt !== null) setI(openAt) }, [openAt])

  const prev = useCallback(() => setI((n) => (n - 1 + shots.length) % shots.length), [shots.length])
  const next = useCallback(() => setI((n) => (n + 1) % shots.length), [shots.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    // The page behind must not scroll under the viewer.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose, prev, next])

  if (!open || !shots.length) return null
  const src = shots[i]

  const ctrl = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.92)",
    color: "#111111",
    fontSize: 20,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos — ${name}`}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{ position: "absolute", top: 14, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", color: "#111111", fontSize: 18, cursor: "pointer" }}
      >
        ×
      </button>

      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(1100px, 100%)", height: "min(78vh, 100%)" }}>
        <Image
          src={src}
          alt={`${name} — photo ${i + 1} sur ${shots.length}`}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "contain" }}
        />
        {shots.length > 1 && (
          <>
            <button onClick={prev} aria-label="Photo précédente" style={{ ...ctrl, left: -4 }}>‹</button>
            <button onClick={next} aria-label="Photo suivante" style={{ ...ctrl, right: -4 }}>›</button>
          </>
        )}
      </div>

      {shots.length > 1 && (
        <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: 12.5, fontWeight: 700 }}>
          {i + 1} / {shots.length}
        </div>
      )}
    </div>
  )
}
