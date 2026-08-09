import PageShell from "@/components/PageShell"
import ParrainagePanel from "@/components/pages/ParrainagePanel"

export const metadata = {
  title: "Parrainage",
  description: "Parrainez vos amies sur Rezervy : offrez-leur −20% sur leur première réservation et gagnez des points de fidélité à chaque venue.",
  alternates: { canonical: "/parrainage" },
}

export default function ParrainagePage() {
  return (
    <PageShell
      title="Parrainez vos amies"
      subtitle="Offrez −20% à vos amies sur leur première visite — et gagnez des points de fidélité à chacune de leurs venues."
    >
      <ParrainagePanel />
    </PageShell>
  )
}
