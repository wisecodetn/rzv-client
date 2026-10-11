import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"

export const metadata = pageMeta({
  absoluteTitle: "Programme de Parrainage : invitez vos amis | Rezervy",
  description:
    "Le parrainage Rezervy arrive bientôt : partagez votre lien, vos amis découvrent la réservation beauté en ligne en Tunisie, et chacun est récompensé.",
  path: "/parrainage",
})

export default function Parrainage() {
  return (
    <InfoPage
      title="Programme de Parrainage Rezervy : invitez vos amis"
      crumb="Parrainage"
      path="/parrainage"
      subtitle="Faites découvrir la réservation beauté en ligne à vos proches."
      soon="Le parrainage n’est pas encore ouvert : aucun code ni lien de parrainage n’est délivré ou accepté pour le moment. Nous l’annoncerons dans votre compte dès son lancement."
      sections={[
        {
          h: "Comment il fonctionnera",
          ordered: true,
          list: [
            "Depuis votre compte Rezervy, vous copiez votre lien ou votre code personnel.",
            "Vous le partagez avec vos amis : message, e-mail, WhatsApp ou réseaux sociaux.",
            "Votre ami crée son compte avec votre lien et honore son premier rendez-vous dans un salon partenaire.",
            "Chacun reçoit son avantage, utilisable sur une prochaine réservation.",
          ],
        },
        {
          h: "Pour le parrain et pour le filleul",
          p: [
            "Le filleul profite d’un avantage de bienvenue sur sa première réservation ; le parrain est récompensé pour chaque ami qui honore son premier rendez-vous. Le détail des récompenses (montant en TND ou avantage équivalent) et les conditions seront publiés ici avant l’ouverture.",
          ],
        },
        {
          h: "Des règles simples et justes",
          list: [
            "Seul un premier rendez-vous réellement honoré au salon déclenche une récompense.",
            "Un compte par personne : l’auto-parrainage n’est pas accepté.",
            "Les avantages s’appliquent sur des réservations futures, selon les conditions publiées au lancement.",
          ],
        },
      ]}
      faq={[
        ["Quand le parrainage ouvre-t-il ?", "Il est en préparation ; nous l’annoncerons dans votre compte, sur le site et dans la newsletter Rezervy."],
        ["Puis-je déjà inviter des amis ?", "Vous pouvez leur faire découvrir Rezervy dès maintenant, mais aucun parrainage ne sera comptabilisé avant l’ouverture du programme."],
      ]}
      ctas={[
        { href: "/salons", label: "Trouver un salon" },
        { href: "/inscription", label: "Créer mon compte" },
      ]}
    />
  )
}
