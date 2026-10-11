import InfoPage from "@/components/pages/InfoPage"
import Link from "@/components/Link"
import { pageMeta } from "@/lib/meta"
import { SITE, OPERATOR, OPERATOR_ADDRESS, LEGAL, HOST } from "@/lib/site"

export const metadata = pageMeta({
  absoluteTitle: "Mentions légales | Rezervy",
  description:
    "Consultez les mentions légales de Rezervy : éditeur, hébergeur, propriété intellectuelle, données personnelles et droit applicable en Tunisie.",
  path: "/mentions-legales",
})

const host = new URL(SITE.url).hostname

export default function MentionsLegales() {
  // Only what is known: an empty legal field is left out rather than printed
  // as a placeholder (see LEGAL in lib/site.js).
  const publisher = [
    `Éditeur : ${OPERATOR.name}`,
    LEGAL.legalForm && `Forme juridique : ${LEGAL.legalForm}`,
    LEGAL.taxId && `Matricule fiscal / RNE : ${LEGAL.taxId}`,
    LEGAL.capital && `Capital social : ${LEGAL.capital}`,
    `Siège : ${OPERATOR_ADDRESS}`,
    `Téléphone : ${OPERATOR.phone}`,
    `E-mail : ${OPERATOR.email}`,
    LEGAL.publicationDirector && `Directeur·rice de la publication : ${LEGAL.publicationDirector}`,
  ].filter(Boolean)

  return (
    <InfoPage
      title="Mentions légales"
      path="/mentions-legales"
      subtitle={`Informations légales relatives au site ${host} et aux services Rezervy.`}
      sections={[
        {
          h: "Éditeur du site",
          p: [`Le site ${host} (ci-après « le Site ») et le service Rezervy sont édités par ${OPERATOR.name}.`],
          list: publisher,
        },
        {
          h: "Hébergeur du site",
          p: ["Le Site est hébergé par le prestataire ci-dessous, qui assure le stockage technique des contenus sans intervenir dans leur ligne éditoriale."],
          list: [`Hébergeur : ${HOST.name}`, `Adresse : ${HOST.address}`, `Site web : ${HOST.website}`],
        },
        {
          h: "Propriété intellectuelle",
          p: [
            "La marque Rezervy, son logo, les textes, illustrations, photographies, la charte graphique, l’architecture du Site, ses bases de données et ses développements logiciels sont protégés par le droit de la propriété intellectuelle et appartiennent à l’éditeur, sauf mention contraire.",
            "Toute reproduction, représentation, modification ou diffusion, totale ou partielle, de ces éléments sans autorisation écrite préalable est interdite.",
            "Les noms, logos et photos des salons présentés sur le Site restent la propriété de leurs titulaires ; ils y figurent pour le seul service de mise en relation et de réservation proposé par Rezervy.",
          ],
        },
        {
          h: "Données personnelles",
          p: [
            "Rezervy traite les données nécessaires au service (nom, e-mail, téléphone, rendez-vous, avis) conformément à la législation tunisienne relative à la protection des données personnelles, notamment la loi organique n° 2004-63 du 27 juillet 2004.",
            `Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression. Vous pouvez supprimer votre compte depuis votre espace, ou écrire à ${OPERATOR.email}.`,
          ],
          node: (
            <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8, margin: 0 }}>
              Le détail figure dans notre{" "}
              <Link href="/confidentialite" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>politique de confidentialité</Link>.
            </p>
          ),
        },
        {
          h: "Cookies",
          p: [
            "Le Site utilise des cookies strictement nécessaires à son fonctionnement : votre connexion, la sécurité de votre compte et vos préférences d’affichage. Vous pouvez les gérer dans les réglages de votre navigateur ; les refuser peut empêcher la connexion à votre compte.",
          ],
        },
        {
          h: "Responsabilité",
          p: [
            "Rezervy met en relation les clients et les salons partenaires pour la réservation de prestations de beauté et de bien-être. Les prestations sont réalisées sous la seule responsabilité des salons, qui restent responsables de leur qualité, de leurs tarifs, de leurs horaires et des informations qu’ils publient.",
            "Aucun paiement n’est encaissé en ligne par Rezervy : les prestations se règlent au salon, le jour du rendez-vous.",
            "L’éditeur veille à l’exactitude des informations publiées sans pouvoir garantir l’absence d’erreur ou d’interruption du service. Les liens vers des sites tiers n’engagent pas sa responsabilité quant à leur contenu.",
          ],
        },
        {
          h: "Droit applicable",
          p: [
            "Le Site et les présentes mentions légales sont régis par le droit tunisien. À défaut de résolution amiable, tout litige relève des tribunaux tunisiens compétents.",
          ],
        },
        {
          h: "Contact",
          p: [`Pour toute question sur ces mentions légales ou sur le Site : ${OPERATOR.email} · ${OPERATOR.phone} (${OPERATOR.hours.toLowerCase()}).`],
        },
      ]}
      ctas={[
        { href: "/cgv", label: "Conditions générales" },
        { href: "/confidentialite", label: "Politique de confidentialité" },
      ]}
    />
  )
}
