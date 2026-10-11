import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"
import { OPERATOR } from "@/lib/site"

export const metadata = pageMeta({
  absoluteTitle: "Partenariats marques beauté | Rezervy",
  description:
    "Marques de cosmétiques et de beauté, collaborez avec Rezervy pour gagner en visibilité auprès d'une audience tunisienne engagée. Nos formats de partenariat.",
  path: "/collaboration-marques",
})

export default function CollaborationMarques() {
  return (
    <InfoPage
      title="Collaboration avec les marques beauté en Tunisie"
      crumb="Collaboration marques"
      path="/collaboration-marques"
      subtitle="Marques de cosmétiques, de soins et d’équipement : rencontrez les salons et les clientes là où se décident les soins beauté."
      sections={[
        {
          h: "Pourquoi collaborer avec Rezervy",
          p: [
            "Rezervy relie les clientes aux salons de coiffure, barbiers, instituts, ongleries, spas et hammams de Tunisie. Pour une marque, c’est une présence au moment précis où l’on choisit un soin — et auprès des professionnels qui utilisent et recommandent les produits au quotidien.",
            "Marque locale en croissance ou acteur international qui s’implante en Tunisie, nous construisons avec vous un partenariat adapté à vos objectifs et à votre budget.",
          ],
        },
        {
          h: "Les opportunités",
          list: [
            "Visibilité auprès d’une audience intéressée par la beauté et le bien-être, sur le site et dans nos communications.",
            "Présence de vos produits dans les salons partenaires : recommandation, échantillons, mise en situation.",
            "Contenus éditoriaux et conseils sur le blog Rezervy, associant votre expertise produit à nos guides beauté.",
            "Opérations saisonnières : fête des mères, Aïd, été, mariages.",
          ],
        },
        {
          h: "Les formats de partenariat",
          p: ["Plusieurs formats se combinent ; nous vous aidons à choisir les plus pertinents :"],
          list: [
            "Partenariat de contenu : articles, tutoriels et conseils d’experts",
            "Présence en salon : kits de découverte et supports de présentation chez nos partenaires",
            "Campagne co-marketing autour d’un lancement ou d’une gamme",
            "Sponsoring d’événements beauté et bien-être",
          ],
        },
        {
          h: "Comment se déroule un partenariat",
          ordered: true,
          list: [
            "Un premier échange sur vos objectifs : notoriété, lancement, essai produit.",
            "Une proposition de formats, de calendrier et de budget.",
            "La mise en œuvre avec notre équipe et les salons concernés.",
            "Un bilan partagé : ce qui a été diffusé, auprès de qui, avec quels retours.",
          ],
        },
        {
          h: "Contact",
          p: [`Présentez-nous votre marque à ${OPERATOR.email} ou au ${OPERATOR.phone} : nous revenons vers vous rapidement.`],
        },
      ]}
      ctas={[
        { href: "/contact", label: "Nous contacter" },
        { href: "/blog", label: "Voir le blog" },
      ]}
    />
  )
}
