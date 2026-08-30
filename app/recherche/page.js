import { redirect } from "next/navigation"
import RechercheResults, { parseSearch } from "@/components/recherche/RechercheResults"

export const metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
}

export default async function RecherchePage({ searchParams }) {
  const sp = (await searchParams) || {}
  const params = parseSearch(sp)
  // City-only search has a canonical, indexable home at /recherche/<ville>.
  if (params.city && !params.q && !params.category && !params.rate && !params.dispo && params.sort === "note") {
    redirect(`/recherche/${params.city}`)
  }
  return <RechercheResults params={params} page={1} />
}
