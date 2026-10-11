import { redirect } from "next/navigation"
import RechercheResults, { parsePageParam, parseSearch } from "@/components/recherche/RechercheResults"

export const metadata = {
  title: "Trouver un salon",
  robots: { index: false, follow: true },
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
