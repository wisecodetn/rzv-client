import PageShell, { Section } from "@/components/PageShell"
import { pageMeta } from "@/lib/meta"
import { OPERATOR, OPERATOR_ADDRESS } from "@/lib/site"

export const metadata = pageMeta({
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de Rezervy : compte, réservations, paiement au salon, annulation, avis et responsabilités.",
  path: "/conditions-generales",
})

export default function CGU() {
  return (
    <PageShell title="Conditions générales d'utilisation" crumb="Conditions générales" maxWidth={800} subtitle="Dernière mise à jour : octobre 2026.">
      <Section h="1. Objet">
        La plateforme Rezervy est éditée par {OPERATOR.name}, {OPERATOR_ADDRESS} — téléphone {OPERATOR.phone},
        e-mail {OPERATOR.email}. Les présentes conditions régissent l'utilisation de la plateforme Rezervy, qui met en relation des clients avec
        des salons de beauté, barbershops et spas partenaires en Tunisie pour la prise de rendez-vous en ligne.
      </Section>
      <Section h="2. Compte utilisateur">
        La création d'un compte requiert des informations exactes, dont un numéro de téléphone où le salon peut vous
        joindre. Le service s'adresse aux personnes majeures ; un mineur ne peut l'utiliser qu'avec l'accord de son
        représentant légal. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité
        effectuée depuis votre compte.
      </Section>
      <Section h="3. Réservations et paiement">
        Rezervy facilite la réservation auprès des salons partenaires. Une réservation est une demande : le salon la
        confirme, et son statut s'affiche dans votre compte. Aucune somme n'est prélevée en ligne — la prestation se
        règle directement au salon. Les prix affichés sont fournis par les établissements.
      </Section>
      <Section h="4. Annulation et absence">
        Vous pouvez annuler ou déplacer un rendez-vous gratuitement depuis votre compte, jusqu'à son heure de début.
        En cas d'empêchement de dernière minute, merci de prévenir le salon. Pour une séance réservée sur un carnet,
        une absence non signalée compte comme une séance utilisée.
      </Section>
      <Section h="5. Avis">
        Vous pouvez donner un avis sur un salon après un rendez-vous terminé — un seul avis par salon : en redonner un
        depuis un autre rendez-vous terminé dans ce salon remplace le précédent. Il est publié sous votre prénom et
        l'initiale de votre nom. Rezervy peut masquer un avis injurieux, hors sujet ou contenant des données
        personnelles.
      </Section>
      <Section h="6. Liste d'attente, carnets et codes promo">
        Quand un salon le propose, vous pouvez rejoindre sa liste d'attente ; un créneau qui se libère peut alors vous être
        proposé dans votre compte, sans garantie. Les carnets de séances et les codes promo sont proposés par les salons
        selon leurs propres conditions ; la remise est toujours calculée par Rezervy sur les prix affichés.
      </Section>
      <Section h="7. Assistant">
        L'assistant du site répond à partir des informations publiques des salons. Ses réponses sont indicatives et
        peuvent contenir des erreurs ; il ne réserve pas à votre place. Les prix, horaires et disponibilités qui font foi
        sont ceux affichés sur la page du salon et au moment de la réservation.
      </Section>
      <Section h="8. Votre compte">
        Vous pouvez supprimer votre compte à tout moment depuis « Mon profil » (après avoir annulé vos rendez-vous à
        venir). Rezervy peut suspendre un compte en cas d'usage abusif, notamment de fausses réservations ou des avis
        injurieux.
      </Section>
      <Section h="9. Responsabilité">
        Rezervy agit en tant qu'intermédiaire technique. La prestation est fournie par le salon, seul responsable de sa
        qualité. Nous mettons tout en œuvre pour assurer la disponibilité du service sans pouvoir la garantir en continu.
      </Section>
      <Section h="10. Propriété intellectuelle">
        La marque Rezervy, son logo et les contenus de la plateforme sont la propriété de {OPERATOR.name} et ne peuvent
        être reproduits sans autorisation. Les photos et descriptions des salons restent la propriété de chaque salon.
      </Section>
      <Section h="11. Modification des conditions">
        Ces conditions peuvent évoluer avec le service. La date de dernière mise à jour figure en haut de cette page ;
        une modification importante vous est signalée par e-mail ou sur le site avant d'entrer en vigueur. Continuer à
        utiliser Rezervy ensuite vaut acceptation des nouvelles conditions — vous pouvez aussi supprimer votre compte.
      </Section>
      <Section h="12. Droit applicable">
        Ces conditions sont soumises au droit tunisien. En cas de différend, nous vous invitons à nous contacter d'abord
        pour chercher une solution amiable ; à défaut, les tribunaux compétents de {OPERATOR.city} seront saisis.
      </Section>
      <Section h="13. Contact">
        Pour toute question relative à ces conditions : {OPERATOR.email} ou {OPERATOR.phone}
        ({OPERATOR.hours.toLowerCase()}).
      </Section>
    </PageShell>
  )
}
