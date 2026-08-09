"use client"
import { useEffect, useState } from "react"

const Sun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" />
  </svg>
)
const Moon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light")
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light")
  }, [])
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", next)
    try {
      localStorage.setItem("theme", next)
    } catch {}
    setTheme(next)
  }
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
      style={{
        width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line-2)", background: "transparent",
        color: "var(--muted-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
      }}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  )
}
