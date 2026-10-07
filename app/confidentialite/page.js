import Link from "next/link"
import PageShell, { Section } from "@/components/PageShell"
import { getAssistantStatus } from "@/lib/assistant"
import { pageMeta } from "@/lib/meta"
import { OPERATOR, OPERATOR_ADDRESS } from "@/lib/site"

export const metadata = pageMeta({
  title: "Politique de confidentialité",
  description: "Comment Rezervy collecte, utilise et protège vos données personnelles.",
  path: "/confidentialite",
})

/* Written to match what the site actually does — every recipient, cookie and
   retention rule below exists in the code (server: client-auth deleteAccount,
   clients lookupByPhone, marketing MARKETING_KINDS, the hourly log and
   assistant purges). Change the code and this page together. */
export default async function Confidentialite() {
  const { retentionDays: days } = await getAssistantStatus()
  const mail = <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
  return (
    <PageShell title="Politique de confidentialité" crumb="Confidentialité" maxWidth={800} subtitle="Dernière mise à jour : octobre 2026.">
      <Section h="Responsable du traitement">
        Les données personnelles traitées sur Rezervy le sont par {OPERATOR.name}, éditeur de la plateforme —{" "}
        {OPERATOR_ADDRESS}. Contact : {mail} ou {OPERATOR.phone} ({OPERATOR.hours.toLowerCase()}).
      </Section>
      <Section h="1. Données collectées">
        <b>Votre compte</b> : nom, adresse e-mail, numéro de téléphone et mot de passe (enregistré sous une forme
        irréversible, que personne — nous compris — ne peut relire). Si vous vous connectez avec Google, nous recevons
        votre nom et votre adresse e-mail.
        <br />
        <b>Vos réservations</b> : salon, prestations, date et heure, praticien choisi, statut et montant à régler au
        salon ; vos demandes de liste d&apos;attente, vos salons favoris et les avis que vous publiez.
        <br />
        <b>Vos messages</b> : ce que vous nous écrivez (formulaire de contact, centre d&apos;aide) et, si vous vous y
        inscrivez, votre adresse e-mail pour la newsletter.
        <br />
        <b>Données techniques</b> : en cas d&apos;erreur du serveur, un journal technique peut contenir l&apos;adresse IP
        de la requête. Nous n&apos;utilisons aucun outil de mesure d&apos;audience ni de publicité.
      </Section>
      <Section h="2. Utilisation des données">
        Vos données servent à créer et sécuriser votre compte, transmettre vos réservations au salon, vous envoyer les
        e-mails liés à vos rendez-vous (demande, confirmation, rappel, modification, annulation) et répondre à vos
        demandes. Nous ne vous envoyons d&apos;e-mails d&apos;information ou de promotion que si vous êtes inscrit à la
        newsletter ; chaque envoi contient un lien de désinscription.
      </Section>
      <Section h="3. Partage">
        <b>Le salon</b> où vous réservez reçoit votre nom, votre téléphone, votre adresse e-mail et les détails du
        rendez-vous, et les conserve dans son fichier clients. Vos avis sont publiés sur sa page sous votre prénom et
        l&apos;initiale de votre nom.
        <br />
        <b>Les autres salons</b> : votre numéro de téléphone sert à vous reconnaître d&apos;un salon à l&apos;autre. Un salon
        partenaire qui saisit votre numéro complet voit le nom et la ville enregistrés pour ce numéro, afin de
        pré-remplir votre fiche. Il ne voit jamais votre adresse e-mail, vos rendez-vous, vos dépenses ni les notes des
        autres salons.
        <br />
        <b>Nos prestataires techniques</b>, qui traitent des données pour notre compte : l&apos;hébergement du site,
        l&apos;envoi des e-mails, Google (uniquement si vous utilisez « Continuer avec Google », et pour l&apos;assistant —
        voir l&apos;article 7). Les cartes sont affichées depuis les serveurs d&apos;OpenStreetMap, qui reçoivent donc
        l&apos;adresse IP de votre appareil quand une carte s&apos;affiche.
        <br />
        Certains de ces prestataires (Google, OpenStreetMap) traitent les données hors de Tunisie. Nous ne vendons
        jamais vos données.
      </Section>
      <Section id="conservation" h="4. Conservation">
        Vos données de compte sont conservées tant que votre compte existe. Quand vous le supprimez :
        <br />— sont effacés : votre compte, vos favoris, vos demandes de liste d&apos;attente et votre inscription à la
        newsletter ;
        <br />— restent chez les salons concernés : l&apos;historique de vos rendez-vous et la fiche qu&apos;ils ont créée à
        votre nom (c&apos;est leur fichier clients) ;
        <br />— restent chez nous : vos échanges avec le support, pour le suivi de vos demandes ; vous pouvez en demander
        la suppression ;
        <br />— restent publiés : vos avis, sous le nom « Anonyme ».
        <br />
        L&apos;inscription à la newsletter dure jusqu&apos;à votre désinscription. Les journaux techniques sont supprimés
        automatiquement après 90 jours, les conversations avec l&apos;assistant après {days} jours (article 7).
      </Section>
      <Section h="5. Vos droits">
        Vous pouvez consulter et corriger votre nom et votre téléphone dans{" "}
        <Link href="/compte/profil">Mon profil</Link>, et y <b>supprimer votre compte</b> vous-même. Pour changer
        d&apos;adresse e-mail, obtenir une copie de vos données, vous opposer à un traitement ou pour toute autre demande,
        écrivez-nous à {mail}. Vous pouvez aussi saisir l&apos;Instance nationale de protection des données personnelles
        (INPDP).
      </Section>
      <Section h="6. Cookies et stockage local">
        Nous n&apos;utilisons que des cookies nécessaires au fonctionnement du site : ceux de votre session de connexion.
        Votre navigateur garde aussi localement quelques préférences : le thème clair ou sombre, une réservation en cours
        de saisie (effacée au bout d&apos;une heure), votre choix concernant la newsletter et, le temps de votre visite,
        votre conversation avec l&apos;assistant. Aucun cookie publicitaire ou de mesure d&apos;audience — c&apos;est
        pourquoi le site n&apos;affiche pas de bandeau de consentement.
      </Section>
      <Section id="assistant" h="7. Assistant Rezervy">
        <Link href="/assistant">L&apos;assistant du site</Link> répond à vos questions à partir des informations publiques
        des salons. Vos messages sont transmis à Google (Gemini), hors de Tunisie, pour générer les réponses ; selon les
        conditions du service utilisé, Google peut s&apos;en servir pour améliorer ses produits. Nous conservons les
        conversations {days} jours après le dernier message, pour corriger les réponses inexactes et savoir quels salons
        et quelles villes vous recherchez. Elles sont anonymes : aucun lien avec votre compte ni votre adresse IP, et les
        numéros de téléphone et adresses e-mail sont masqués avant tout enregistrement. Ne partagez pas
        d&apos;informations personnelles dans le chat. Pour faire supprimer une conversation, écrivez-nous à {mail}.
      </Section>
    </PageShell>
  )
}
