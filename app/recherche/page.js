import RechercheResults, { parseSearch } from "@/components/recherche/RechercheResults"

export const metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
}

export default async function RecherchePage({ searchParams }) {
  const sp = (await searchParams) || {}
  return <RechercheResults params={parseSearch(sp)} page={1} />
}
