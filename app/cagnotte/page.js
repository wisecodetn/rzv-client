import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"

export const metadata = pageMeta({
  absoluteTitle: "Cagnotte beauté : offrez un soin à plusieurs | Rezervy",
  description:
    "La cagnotte Rezervy arrive bientôt : réunir les participations de vos proches pour offrir un soin ou un forfait beauté dans un salon partenaire en Tunisie.",
  path: "/cagnotte",
})

export default function Cagnotte() {
  return (
    <InfoPage
      title="La cagnotte Rezervy : offrir un soin beauté à plusieurs"
      crumb="Cagnotte"
      path="/cagnotte"
      subtitle="Un anniversaire, une future mariée, un départ, un merci : se mettre à plusieurs pour offrir un vrai moment beauté."
      soon="La cagnotte n’est pas encore ouverte : il n’est pas possible d’en créer une ni d’y participer pour le moment. Rezervy n’encaisse aujourd’hui aucun paiement en ligne."
      sections={[
        {
          h: "L’idée",
          p: [
            "Plutôt que chacun cherche un cadeau de son côté, les proches mettent en commun leur participation pour offrir un soin marquant : coiffure, onglerie, soin du visage, spa, hammam ou massage, dans l’un des salons partenaires en Tunisie.",
            "Chacun donnerait selon ses moyens, et la personne gâtée choisirait son salon, sa prestation et son créneau.",
          ],
        },
        {
          h: "Comment elle fonctionnera",
          ordered: true,
          list: [
            "Une personne lance la cagnotte : l’occasion, la personne à gâter, éventuellement un montant cible.",
            "Elle partage le lien avec les proches, qui participent du montant de leur choix.",
            "Une fois la collecte close, le total sert à réserver le soin choisi dans un salon partenaire.",
          ],
        },
        {
          h: "En attendant",
          p: [
            "Vous pouvez réserver vous-même un soin pour un proche dans le salon de son choix, et le régler au salon le jour du rendez-vous. Pour un projet de groupe (mariage, entreprise), écrivez-nous : nous vous aidons à l’organiser avec nos salons.",
          ],
        },
      ]}
      faq={[
        ["Quand la cagnotte sera-t-elle disponible ?", "Elle est en préparation ; nous l’annoncerons sur le site et dans la newsletter Rezervy."],
        ["Puis-je déjà collecter de l’argent sur Rezervy ?", "Non : Rezervy n’encaisse aucun paiement en ligne aujourd’hui. Les soins se règlent au salon."],
      ]}
      ctas={[
        { href: "/salons", label: "Trouver un salon" },
        { href: "/contact", label: "Nous contacter" },
      ]}
    />
  )
}
