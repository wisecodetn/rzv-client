import { notFound, redirect } from "next/navigation"
import RechercheResults, { parseSearch } from "@/components/recherche/RechercheResults"

export const metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
}

const parsePage = (seg) => {
  const m = /^page-(\d+)$/.exec(seg || "")
  return m ? parseInt(m[1], 10) : null
}

export default async function RecherchePaged({ params, searchParams }) {
  const { page } = await params
  const sp = (await searchParams) || {}
  const n = parsePage(page)
  if (!n) notFound()
  if (n === 1) {
    const qs = new URLSearchParams(sp).toString()
    redirect("/recherche" + (qs ? `?${qs}` : ""))
  }
  return <RechercheResults params={parseSearch(sp)} page={n} />
}
