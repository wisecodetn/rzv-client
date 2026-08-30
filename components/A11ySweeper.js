"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

/* Global guarantee: every <a> gets a title and every <img> gets alt + title.
   The important, crawl-relevant spots also set them server-side; this sweeper
   backfills anything missed (menus, drawers, dynamic content) — falling back to
   the link text, an aria-label, or "Rezervy". */
const fixLink = (a) => {
  const label = (a.getAttribute("aria-label") || a.textContent || "").trim().replace(/\s+/g, " ")
  a.setAttribute("title", label ? label.slice(0, 90) : "Rezervy")
}
const fixImg = (img) => {
  const fallback = (img.getAttribute("alt") || img.getAttribute("title") || "Rezervy").trim() || "Rezervy"
  if (!img.getAttribute("alt")) img.setAttribute("alt", fallback)
  if (!img.getAttribute("title")) img.setAttribute("title", fallback)
}

/** Fix one subtree (the whole document on mount, added nodes afterwards). */
const sweep = (root) => {
  if (root.matches?.("a:not([title]), a[title='']")) fixLink(root)
  if (root.matches?.("img")) fixImg(root)
  root.querySelectorAll?.("a:not([title]), a[title='']").forEach(fixLink)
  root.querySelectorAll?.("img").forEach(fixImg)
}

export default function A11ySweeper() {
  const pathname = usePathname()
  useEffect(() => {
    sweep(document.body)
    // Catch late-mounted nodes (dropdowns, drawers, fetched content). Only the
    // ADDED subtrees are processed — re-scanning the whole document on every
    // mutation made typing in the search box measurably janky.
    let queued = []
    let timer = null
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) if (node.nodeType === 1) queued.push(node)
      }
      if (!queued.length || timer) return
      timer = setTimeout(() => {
        const batch = queued
        queued = []
        timer = null
        for (const node of batch) if (node.isConnected) sweep(node)
      }, 200)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { clearTimeout(timer); mo.disconnect() }
  }, [pathname])
  return null
}
