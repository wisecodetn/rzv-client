"use client"
import { useFavorites } from "../FavoritesProvider"
import SalonCard from "../SalonCard"
import { Card, H, Empty } from "./shared"

/* ── Mes favoris ─────────────────────────────────────────────────── */
export function Favoris() {
  const { salons, ready } = useFavorites()
  return (
    <>
      <H>Mes favoris</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos salons préférés, à portée de clic.</div>
      {!ready ? (
        <Card style={{ textAlign: "center", padding: "30px 20px", color: "var(--faint)", fontSize: 13 }}>Chargement…</Card>
      ) : salons.length === 0 ? (
        <Empty title="Aucun favori pour le moment" sub="Ajoutez des salons à vos favoris depuis leur page." cta="Explorer les salons" href="/recherche" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16, minWidth: 0 }}>
          {/* The marketplace's own card: same photo, logo, rating and price —
              and its heart removes the favourite. */}
          {salons.map((s) => <SalonCard key={s.slug} salon={s} />)}
        </div>
      )}
    </>
  )
}
