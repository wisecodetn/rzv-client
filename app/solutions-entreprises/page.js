import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"
import { OPERATOR } from "@/lib/site"

export const metadata = pageMeta({
  absoluteTitle: "Solutions bien-être entreprises | Rezervy",
  description:
    "Offrez à vos salariés des avantages beauté et bien-être partout en Tunisie : soins offerts, journées détente, accès aux salons partenaires. Parlons-en.",
  path: "/solutions-entreprises",
})

export default function SolutionsEntreprises() {
  return (
    <InfoPage
      title="Solutions beauté et bien-être pour les entreprises en Tunisie"
      crumb="Solutions entreprises"
      path="/solutions-entreprises"
      subtitle="Et si prendre soin de vos équipes devenait aussi simple que de réserver un rendez-vous ?"
      sections={[
        {
          h: "Pourquoi investir dans le bien-être au travail",
          p: [
            "Une équipe qui se sent reconnue est plus motivée, plus fidèle et plus sereine. Un soin capillaire, un massage ou un moment au hammam est une attention concrète, que chacun apprécie — bien plus marquante qu’une prime vite oubliée.",
          ],
          list: [
            "Renforcer la motivation et l’engagement au quotidien",
            "Réduire le stress et prévenir l’épuisement",
            "Fidéliser vos talents et soigner votre marque employeur",
            "Récompenser concrètement les réussites individuelles ou collectives",
          ],
        },
        {
          h: "Ce que nous construisons avec vous",
          p: [
            "Rezervy réunit des salons de coiffure, barbiers, instituts, ongleries, spas et hammams dans toute la Tunisie. Pour une entreprise, nous montons une offre sur mesure avec ces salons partenaires :",
          ],
          list: [
            "Soins offerts : vos collaborateurs réservent un soin dans les salons convenus, aux conditions négociées pour votre entreprise.",
            "Journées et ateliers bien-être : massages, soins ou mises en beauté organisés pour une équipe, dans un salon ou sur site, avec nos partenaires.",
            "Récompenses et événements : fin d’année, fête des mères, départs, réussites d’équipe — une attention bien-être plutôt qu’un objet.",
            "Plusieurs villes : des salons partenaires dans les principales villes du pays, pour que chaque collaborateur en profite près de chez lui.",
          ],
        },
        {
          h: "Comment ça se passe",
          ordered: true,
          list: [
            "Vous nous décrivez votre besoin : effectif, villes, occasion et budget.",
            "Nous vous proposons une formule avec les salons partenaires adaptés.",
            "Vos collaborateurs profitent de leurs soins ; vous gardez un interlocuteur unique chez Rezervy.",
          ],
          p: [
            "La carte cadeau Rezervy, qui permettra d’offrir un montant ou une prestation à dépenser librement dans un salon partenaire, arrive bientôt ; elle complétera ces formules.",
          ],
        },
        {
          h: "Pour toutes les tailles d’entreprise",
          p: [
            "De la petite équipe à la grande entreprise, la formule s’adapte à votre effectif et à votre budget. Les prestations sont réglées selon les conditions convenues ensemble ; rien n’est engagé avant votre accord.",
          ],
        },
        {
          h: "Parlons de votre projet",
          p: [`Écrivez-nous à ${OPERATOR.email} ou appelez le ${OPERATOR.phone} (${OPERATOR.hours.toLowerCase()}) : nous revenons vers vous avec une proposition.`],
        },
      ]}
      faq={[
        ["Faut-il un nombre minimum de collaborateurs ?", "Non : nous construisons l’offre à partir de votre besoin, pour une petite équipe comme pour une grande entreprise."],
        ["Mes collaborateurs choisissent-ils leur salon ?", "Oui, parmi les salons partenaires retenus pour votre formule, dans leur ville."],
        ["Les cartes cadeaux sont-elles disponibles ?", "Pas encore : la carte cadeau Rezervy arrive bientôt. En attendant, nous organisons les soins offerts directement avec nos salons partenaires."],
      ]}
      ctas={[
        { href: "/contact", label: "Demander une proposition" },
        { href: "/salons", label: "Voir les salons" },
      ]}
    />
  )
}
