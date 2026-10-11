import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"
import { SITE } from "@/lib/site"
import { getPlans, fromLabel } from "@/lib/plans"

export const metadata = pageMeta({
  absoluteTitle: "Référentiel de candidature salon | Rezervy",
  description:
    "Découvrez les critères, pièces à fournir et étapes pour rejoindre Rezervy en tant que salon beauté partenaire en Tunisie. Candidatez sereinement.",
  path: "/referentiel-candidature",
})

export default async function ReferentielCandidature() {
  const plans = await getPlans()
  const trial = plans?.trialDays > 0 ? ` Un essai gratuit de ${plans.trialDays} jours peut vous être proposé à l’activation.` : ""
  const price = plans ? ` Les offres Rezervy Pro démarrent ${fromLabel(plans)}.` : ""

  return (
    <InfoPage
      title="Référentiel de candidature : devenir salon partenaire Rezervy"
      crumb="Référentiel de candidature"
      path="/referentiel-candidature"
      subtitle="Qui peut rejoindre Rezervy, ce que nous vérifions, et les étapes jusqu’à la mise en ligne de votre salon."
      sections={[
        {
          h: "Qui peut candidater ?",
          p: [
            "Rezervy s’adresse aux établissements de beauté et de bien-être qui exercent légalement en Tunisie et reçoivent leurs clients dans un lieu identifiable — salon installé de longue date ou tout juste ouvert.",
          ],
          list: [
            "Salons de coiffure (femme, homme, mixte)",
            "Barbiers",
            "Instituts d’esthétique et de soins du visage et du corps",
            "Ongleries (manucure, pédicure, pose de gel, nail art)",
            "Spas, hammams et centres de massage",
          ],
        },
        {
          h: "Les critères de qualité attendus",
          p: [
            "Chaque salon contribue à la confiance des clientes envers tout le réseau. Avant d’activer un compte, nous nous assurons que l’établissement répond à un socle commun :",
          ],
          list: [
            "Une activité déclarée et autorisée",
            "Un local qui accueille le public, propre et conforme aux règles d’hygiène",
            "Des prestations réalisées par un personnel qualifié",
            "Des tarifs clairs, en dinars tunisiens (TND), identiques en ligne et au salon",
            "Un agenda tenu à jour, pour ne proposer que des créneaux réellement libres",
            "L’engagement d’honorer les rendez-vous confirmés et de prévenir la cliente en cas d’imprévu",
          ],
        },
        {
          h: "Les informations à fournir",
          p: [
            "La demande tient en deux étapes de quelques champs ; aucun document n’est exigé pour l’envoyer.",
          ],
          list: [
            "Vous : nom complet, e-mail et téléphone du gérant ou de la gérante",
            "Votre salon : nom, activité principale, ville (et adresse si vous le souhaitez)",
          ],
          node: (
            <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8, margin: "6px 0 0" }}>
              Lors de l’appel de vérification, notre équipe peut vous demander un justificatif d’activité (patente, registre) ou une pièce
              d’identité du gérant. Vous compléterez ensuite vous-même, depuis Rezervy Pro, ce que verront les clientes : photos, prestations et
              tarifs, équipe, horaires et emplacement.
            </p>
          ),
        },
        {
          h: "Les étapes jusqu’à la mise en ligne",
          ordered: true,
          list: [
            "Vous envoyez votre demande en ligne (quelques minutes).",
            "Notre équipe vérifie le salon et vous contacte par téléphone.",
            "Votre compte Rezervy Pro est activé : vous recevez vos identifiants par e-mail.",
            "Vous complétez votre fiche : activité, ville, téléphone, emplacement sur la carte, au moins une prestation, un membre de l’équipe et vos horaires.",
            "Dès que ces sept points sont remplis, votre salon est publié automatiquement sur Rezervy — sans autre validation à attendre.",
          ],
        },
        {
          h: "Notre engagement commun",
          p: [
            "Vous vous engagez à offrir le service présenté sur votre fiche ; Rezervy s’engage à rendre votre salon visible auprès des clientes qui réservent en ligne dans votre ville, et vous donne les outils pour gérer agenda, équipe, clients et encaissements." +
              price +
              trial,
            "Les avis sont laissés uniquement par des clientes venues au rendez-vous : ils vous aident à progresser et rassurent les nouvelles clientes.",
          ],
        },
      ]}
      faq={[
        ["Combien de temps prend la validation ?", "Nous traitons les demandes au fil de l’eau et vous appelons pour vérifier le salon. Une fois le compte activé, votre mise en ligne ne dépend que de vous : elle est automatique dès que votre fiche est complète."],
        ["Faut-il un équipement particulier ?", "Non : Rezervy Pro fonctionne dans un navigateur (ordinateur, tablette) et dans l’application mobile pour toute l’équipe."],
        ["Les clientes paient-elles en ligne ?", "Non. Les clientes règlent au salon, le jour du rendez-vous ; vous pouvez enregistrer une avance si vous en demandez une."],
      ]}
      ctas={[
        { href: `${SITE.proUrl}/demande`, label: "Déposer ma candidature" },
        { href: "/devenir-partenaire", label: "Découvrir Rezervy Pro" },
      ]}
    />
  )
}
