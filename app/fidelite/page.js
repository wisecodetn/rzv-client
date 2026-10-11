import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"

export const metadata = pageMeta({
  absoluteTitle: "Programme de Fidélité Beauté | Rezervy",
  description:
    "Le programme de fidélité Rezervy : chaque rendez-vous honoré vous rapporte des points, visibles dans votre compte. Les récompenses associées arrivent bientôt.",
  path: "/fidelite",
})

export default function Fidelite() {
  return (
    <InfoPage
      title="Programme de Fidélité Rezervy : vos rendez-vous beauté comptent"
      crumb="Fidélité"
      path="/fidelite"
      subtitle="Chaque rendez-vous honoré dans un salon partenaire s’ajoute à votre compteur de fidélité."
      soon="Vos points sont déjà comptés dans votre compte. Les récompenses à échanger contre ces points ne sont pas encore disponibles : nous les annoncerons ici et par e-mail."
      sections={[
        {
          h: "Le principe",
          p: [
            "Le programme de fidélité Rezervy valorise les clientes qui réservent régulièrement leurs soins — coiffure, barbier, esthétique, onglerie, spa, hammam ou massage — dans les salons partenaires, partout en Tunisie.",
            "Rien à activer : tout est rattaché à votre compte Rezervy, qui garde l’historique de vos rendez-vous et le total de vos points.",
          ],
        },
        {
          h: "Comment vous cumulez des points",
          list: [
            "Réservez votre soin sur Rezervy avec votre compte.",
            "Honorez votre rendez-vous : 1 point par dinar (TND) dépensé est crédité après la visite.",
            "Retrouvez votre total à tout moment dans votre compte, rubrique « Carnets & fidélité ».",
          ],
        },
        {
          h: "Ce qui arrive bientôt",
          p: [
            "Les points pourront être échangés contre des avantages sur vos prochains rendez-vous. Les seuils, la valeur des récompenses et leurs conditions seront publiés ici avant leur lancement — vos points déjà cumulés compteront.",
          ],
        },
        {
          h: "Déjà disponible : les carnets de séances",
          p: [
            "Certains salons vendent des carnets — plusieurs séances d’une prestation, valables un temps donné. Un carnet acheté au salon apparaît dans votre compte, et vous réservez vos séances en ligne sans rien payer de plus.",
          ],
        },
      ]}
      faq={[
        ["Mes points sont-ils déjà comptés ?", "Oui : chaque rendez-vous honoré réservé avec votre compte ajoute ses points, visibles dans « Carnets & fidélité »."],
        ["Que puis-je faire de mes points aujourd’hui ?", "Pas encore d’échange possible : les récompenses arrivent bientôt, et les points déjà cumulés seront pris en compte."],
        ["Un rendez-vous annulé rapporte-t-il des points ?", "Non : seuls les rendez-vous honorés au salon comptent."],
      ]}
      ctas={[
        { href: "/salons", label: "Réserver un soin" },
        { href: "/compte/abonnements", label: "Voir mes points" },
      ]}
    />
  )
}
