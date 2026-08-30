"use client"
import { usePathname, useRouter } from "next/navigation"
import { useFavorites } from "./FavoritesProvider"
import { useAuth } from "./AuthProvider"

const Heart = ({ filled, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "var(--red)" : "none"} stroke="var(--red)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
)

/* Toggle a salon in favorites. variant "icon" = round overlay for card corners;
   "button" = labelled button for the salon page. Requires login (redirects to
   /connexion, returning to the current page). */
export default function FavButton({ slug, variant = "icon", size = 40 }) {
  const { isFav, toggleFav } = useFavorites()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const on = isFav(slug)

  const handle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push(`/connexion?next=${encodeURIComponent(pathname || "/")}`); return }
    toggleFav(slug)
  }

  if (variant === "button") {
    return (
      <button onClick={handle} aria-pressed={on} className="lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: on ? "var(--red-soft)" : "var(--card)", border: `1px solid ${on ? "var(--red-soft)" : "var(--line-2)"}`, color: on ? "var(--red)" : "var(--ink)", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", flex: "none" }}>
        <Heart filled={on} />{on ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>
    )
  }

  return (
    <button onClick={handle} aria-pressed={on} aria-label={on ? "Retirer des favoris" : "Ajouter aux favoris"} title={on ? "Retirer des favoris" : "Ajouter aux favoris"} className="lift" style={{ position: "absolute", top: 10, right: 10, width: size, height: size, borderRadius: "50%", background: "rgba(253,248,239,0.95)", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(26,18,8,0.28)", zIndex: 3 }}>
      <Heart filled={on} />
    </button>
  )
}
