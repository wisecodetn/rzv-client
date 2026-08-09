import PageShell, { Section } from "@/components/PageShell"

export const metadata = {
  title: "Politique de confidentialité",
  description: "Comment Rezervy collecte, utilise et protège vos données personnelles.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
}

export default function Confidentialite() {
  return (
    <PageShell title="Politique de confidentialité" crumb="Confidentialité" maxWidth={800} subtitle="Dernière mise à jour : janvier 2026.">
      <Section h="1. Données collectées">
        Nous collectons les informations que vous fournissez (nom, e-mail, téléphone), les détails de vos réservations,
        ainsi que des données techniques (appareil, pages consultées) pour améliorer le service.
      </Section>
      <Section h="2. Utilisation des données">
        Vos données servent à gérer vos rendez-vous, vous envoyer confirmations et rappels par SMS ou e-mail, gérer la
        fidélité, et — avec votre accord — vous informer d'offres pertinentes.
      </Section>
      <Section h="3. Partage">
        Les informations nécessaires à une réservation sont transmises au salon concerné. Nous ne vendons jamais vos
        données. Des prestataires techniques (paiement, envoi de SMS) peuvent les traiter pour notre compte.
      </Section>
      <Section h="4. Conservation">
        Vos données sont conservées le temps nécessaire à la fourniture du service et au respect de nos obligations
        légales, puis supprimées ou anonymisées.
      </Section>
      <Section h="5. Vos droits">
        Vous pouvez accéder à vos données, les rectifier, les supprimer ou vous opposer à leur traitement, directement
        depuis votre compte ou en nous écrivant à contact@rezervy.io.
      </Section>
      <Section h="6. Cookies">
        Nous utilisons des cookies pour le bon fonctionnement du site et la mesure d'audience. Vous pouvez les gérer
        depuis les paramètres de votre navigateur.
      </Section>
    </PageShell>
  )
}
