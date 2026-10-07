import PageShell from "@/components/PageShell"
import ComingSoon from "@/components/pages/ComingSoon"
import { pageMeta } from "@/lib/meta"

// Not built yet: no referral code is issued or honoured, so the page is not
// offered to search engines either.
export const metadata = pageMeta({
  title: "Parrainage — bientôt disponible",
  description: "Le programme de parrainage Rezervy n'est pas encore disponible.",
  path: "/parrainage",
  robots: { index: false, follow: true },
})

export default function ParrainagePage() {
  return (
    <PageShell title="Parrainage" subtitle="Inviter vos proches à découvrir Rezervy.">
      <ComingSoon>
        Le programme de parrainage n&apos;est pas encore ouvert : aucun code de parrainage n&apos;est délivré ni accepté
        pour le moment. Nous l&apos;annoncerons dans votre espace client dès son lancement.
      </ComingSoon>
    </PageShell>
  )
}
