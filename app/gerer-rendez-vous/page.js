import PageShell from "@/components/PageShell"
import GererRdvForm from "@/components/pages/GererRdvForm"

export const metadata = {
  title: "Gérer un rendez-vous",
  description: "Retrouvez, reprogrammez ou annulez votre rendez-vous Rezervy à l'aide de sa référence.",
  alternates: { canonical: "/gerer-rendez-vous" },
  robots: { index: false, follow: true },
}

export default function GererRdvPage() {
  return (
    <PageShell
      title="Gérer un rendez-vous"
      subtitle="Reprogrammez, annulez ou consultez votre réservation à l'aide de la référence reçue par SMS."
    >
      <GererRdvForm />
    </PageShell>
  )
}
