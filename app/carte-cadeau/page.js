import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"

export const metadata = pageMeta({
  absoluteTitle: "Carte Cadeau Beauté en Tunisie | Rezervy",
  description:
    "Carte cadeau Rezervy, bientôt : offrez coiffure, soins, onglerie, spa ou hammam dans les meilleurs salons de Tunisie. Montant libre, envoi par e-mail.",
  path: "/carte-cadeau",
})

export default function CarteCadeau() {
  return (
    <InfoPage
      title="Carte Cadeau Rezervy : offrez un moment beauté en Tunisie"
      crumb="Carte cadeau"
      path="/carte-cadeau"
      subtitle="Un cadeau qui fait plaisir à coup sûr : la personne gâtée choisit son salon, son soin et son créneau."
      soon="La carte cadeau n’est pas encore disponible : il n’est pas possible d’en commander ni d’en utiliser pour le moment."
      sections={[
        {
          h: "Pourquoi offrir une carte cadeau beauté",
          list: [
            "Le choix reste au destinataire : son salon, sa prestation, son horaire.",
            "Pour toutes les occasions : anniversaire, fête des mères, mariage, remerciement.",
            "Dans tous les univers : coiffure, barbier, esthétique, onglerie, spa, hammam et massage.",
          ],
        },
        {
          h: "Comment elle fonctionnera",
          ordered: true,
          list: [
            "Vous composez la carte : un montant libre ou des prestations précises, dans un salon ou au choix du destinataire.",
            "La carte est envoyée par e-mail au destinataire, avec son code et sa date de validité.",
            "Le destinataire réserve en ligne et présente sa carte au salon.",
          ],
        },
        {
          h: "En attendant",
          p: [
            "Vous pouvez réserver un soin pour un proche dans le salon de son choix et le régler au salon. Pour une commande d’entreprise ou de groupe, contactez-nous : nous l’organisons avec nos salons partenaires.",
          ],
        },
      ]}
      faq={[
        ["Quand la carte cadeau sera-t-elle disponible ?", "Elle est en préparation ; nous l’annoncerons sur le site et dans la newsletter Rezervy."],
        ["Puis-je déjà l’acheter en ligne ?", "Non. Rezervy n’encaisse aucun paiement en ligne aujourd’hui : les soins se règlent au salon."],
      ]}
      ctas={[
        { href: "/salons", label: "Trouver un salon" },
        { href: "/solutions-entreprises", label: "Offre entreprises" },
      ]}
    />
  )
}
