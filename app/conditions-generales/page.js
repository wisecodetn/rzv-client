import PageShell, { Section } from "@/components/PageShell"

export const metadata = {
  title: "Conditions générales d'utilisation",
  description: "Les conditions générales d'utilisation de la plateforme Rezervy.",
  alternates: { canonical: "/conditions-generales" },
  robots: { index: true, follow: true },
}

export default function CGU() {
  return (
    <PageShell title="Conditions générales d'utilisation" crumb="Conditions générales" maxWidth={800} subtitle="Dernière mise à jour : janvier 2026.">
      <Section h="1. Objet">
        Les présentes conditions régissent l'utilisation de la plateforme Rezervy, qui met en relation des clients avec
        des salons de beauté, barbershops et spas partenaires en Tunisie pour la prise de rendez-vous en ligne.
      </Section>
      <Section h="2. Compte utilisateur">
        La création d'un compte requiert des informations exactes. Vous êtes responsable de la confidentialité de vos
        identifiants et de toute activité effectuée depuis votre compte.
      </Section>
      <Section h="3. Réservations et acomptes">
        Rezervy facilite la réservation auprès des salons partenaires. Certaines prestations peuvent exiger un acompte,
        entièrement déduit du prix final. Les prix affichés sont fournis par les établissements.
      </Section>
      <Section h="4. Annulation et absence">
        L'annulation est gratuite jusqu'à 24h avant le rendez-vous, sauf conditions particulières du salon. En cas
        d'absence non signalée, l'acompte peut être conservé par l'établissement.
      </Section>
      <Section h="5. Responsabilité">
        Rezervy agit en tant qu'intermédiaire technique. La prestation est fournie par le salon, seul responsable de sa
        qualité. Nous mettons tout en œuvre pour assurer la disponibilité du service sans pouvoir la garantir en continu.
      </Section>
      <Section h="6. Propriété intellectuelle">
        La marque, le logo et les contenus de la plateforme sont la propriété de Rezervy et ne peuvent être reproduits
        sans autorisation.
      </Section>
      <Section h="7. Contact">
        Pour toute question relative à ces conditions, écrivez-nous à contact@rezervy.io.
      </Section>
    </PageShell>
  )
}
