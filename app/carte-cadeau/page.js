import PageShell from "@/components/PageShell"
import GiftCardPanel from "@/components/pages/GiftCardPanel"

export const metadata = {
  title: "Carte cadeau",
  description: "Offrez un moment beauté avec une carte cadeau Rezervy, valable dans tous les salons partenaires en Tunisie.",
  alternates: { canonical: "/carte-cadeau" },
}

export default function CarteCadeauPage() {
  return (
    <PageShell
      title="Offrez un moment beauté"
      subtitle="La carte cadeau Rezervy s'utilise dans tous les salons partenaires — coiffure, barbier, onglerie, spa. Valable 12 mois."
    >
      <GiftCardPanel />
    </PageShell>
  )
}
