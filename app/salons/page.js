import { redirect } from "next/navigation"
import { pageMeta } from "@/lib/meta"
import RechercheResults, { parsePageParam, parseSearch } from "@/components/recherche/RechercheResults"

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {}
  const filtered = Object.keys(sp).length > 0
  return {
    ...pageMeta({
      absoluteTitle: "Tous les Salons de Beauté en Tunisie | Réservez en Ligne | Rezervy",
      description:
        "Découvrez tous nos salons de beauté en Tunisie. Coiffure, manucure, massage, barbier et plus. Réservez votre rendez-vous en quelques clics 24h/24.",
      path: "/salons",
    }),
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function RecherchePage({ searchParams }) {
  const sp = (await searchParams) || {}
  const params = parseSearch(sp)
  const page = parsePageParam(sp)
  // City-only search has a canonical, indexable home at /salons/<ville>.
  if (page === 1 && params.city && !params.q && !params.category && !params.rate && !params.dispo && params.sort === "note") {
    redirect(`/salons/${params.city}`)
  }
  return <RechercheResults params={params} page={page} />
}
