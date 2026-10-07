import PageShell from "@/components/PageShell"
import ComingSoon from "@/components/pages/ComingSoon"
import { pageMeta } from "@/lib/meta"

// Not built yet: no gift card can be bought or redeemed, so the page is not
// offered to search engines either.
export const metadata = pageMeta({
  title: "Carte cadeau — bientôt disponible",
  description: "La carte cadeau Rezervy n'est pas encore disponible.",
  path: "/carte-cadeau",
  robots: { index: false, follow: true },
})

export default function CarteCadeauPage() {
  return (
    <PageShell title="Carte cadeau" subtitle="Offrir un moment beauté dans un salon partenaire.">
      <ComingSoon>
        La carte cadeau Rezervy n&apos;est pas encore disponible : il n&apos;est pas possible d&apos;en acheter ni d&apos;en
        utiliser pour le moment. En attendant, vous pouvez réserver directement dans le salon de votre choix.
      </ComingSoon>
    </PageShell>
  )
}
