import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"
import { getCatalog } from "@/lib/data"
import { PAY_RULE, CANCEL_RULE } from "@/lib/site"

export const metadata = pageMeta({
  absoluteTitle: "Glossaire des termes beauté et bien-être | Rezervy",
  description:
    "Coiffure, ongles, spa, hammam, réservation : retrouvez les définitions claires de tous les termes beauté et bien-être utilisés sur Rezervy.",
  path: "/glossaire",
})

// [term, definition, category slug to link when the site has that page]
const COIFFURE = [
  ["Brushing", "Mise en forme et séchage des cheveux à la brosse ronde et au sèche-cheveux, pour un effet lisse, ondulé ou volumineux. Souvent proposé seul ou après une coupe ou une coloration.", "brushing"],
  ["Coloration", "Application d’une couleur sur toute la chevelure pour changer de teinte, couvrir les cheveux blancs ou raviver l’éclat. Elle peut être permanente, semi-permanente ou ton sur ton.", "coloration"],
  ["Balayage", "Technique qui éclaircit certaines mèches de façon progressive et naturelle, comme un effet de soleil, avec un entretien généralement espacé.", "balayage-meches"],
  ["Mèches", "Éclaircissement ou coloration de fines sections de cheveux pour apporter relief et lumière, sans changer la couleur de base.", "balayage-meches"],
  ["Lissage", "Technique qui discipline et lisse les cheveux pour les rendre plus souples et faciles à coiffer, du lissage temporaire aux soins plus durables (lissage brésilien, kératine).", "lissage-bresilien"],
  ["Soin kératine", "Soin qui nourrit la fibre capillaire et réduit les frisottis, pour des cheveux plus lisses et brillants pendant plusieurs semaines.", "soin-keratine"],
  ["Barbier", "Professionnel de la coupe et de l’entretien des cheveux et de la barbe pour hommes : taille de barbe, rasage traditionnel, dégradés et soins du visage masculins.", "barbier"],
  ["Taille de barbe", "Mise en forme de la barbe et des contours, souvent finie au rasoir et à la serviette chaude.", "taille-de-barbe"],
]
const ESTHETIQUE = [
  ["Manucure", "Soin des mains et des ongles : mise en forme, soin des cuticules et, au choix, pose de vernis.", "manucure"],
  ["Pédicure", "Soin des pieds et des ongles des orteils : limage, cuticules et souvent pose de vernis, pour des pieds nets et soignés.", "pedicure"],
  ["Vernis semi-permanent", "Vernis durci sous lampe UV ou LED, qui tient bien plus longtemps qu’un vernis classique. Sa dépose se fait en salon.", "vernis-semi-permanent"],
  ["Pose de gel", "Gel durci sous lampe pour renforcer, allonger ou remodeler les ongles, avec un rendu résistant et durable.", "pose-gel"],
  ["Nail art", "Décoration des ongles : motifs, dégradés, strass ou effets, réalisés à la main par une prothésiste ongulaire.", "nail-art"],
  ["Soin du visage", "Nettoyage, exfoliation, masque et hydratation adaptés au type de peau, pour un teint net et lumineux.", "soins-du-visage"],
  ["Gommage", "Exfoliation de la peau du visage ou du corps qui élimine les cellules mortes et laisse la peau plus douce.", "gommage-corps"],
  ["Épilation", "Élimination des poils du visage ou du corps à la cire, au fil ou au laser selon le salon, pour une peau nette plus longtemps qu’avec un rasage.", "epilation"],
  ["Maquillage", "Mise en beauté du teint, des yeux et des lèvres, pour le jour, une soirée ou un mariage.", "maquillage"],
]
const BIEN_ETRE = [
  ["Spa", "Espace de détente qui réunit soins du corps, massages et parfois sauna ou bain à remous.", "spa-massage"],
  ["Hammam", "Bain de vapeur traditionnel, très ancré dans la culture tunisienne : il ouvre les pores, détend les muscles et prépare la peau au gommage au savon noir.", "hammam-gommage"],
  ["Massage", "Gestes manuels sur les muscles et les tissus pour détendre le corps et soulager les tensions ; chaque technique a son objectif (relaxant, profond, pierres chaudes…).", "massage"],
  ["Soin du corps", "Gommage, enveloppement, hydratation ou modelage pour nourrir la peau et procurer une détente globale.", "soins-du-corps"],
]
const RESERVATION = [
  ["Réservation en ligne", "Choisir une prestation, une date et un créneau libre dans un salon, depuis Rezervy, à toute heure et sans téléphoner. Le salon confirme ensuite votre demande, et vous recevez un e-mail."],
  ["Créneau", "Horaire libre proposé par un salon pour une prestation. Rezervy n’affiche que les créneaux réellement disponibles dans l’agenda du salon."],
  ["Paiement au salon", `${PAY_RULE} Le prix affiché avant de réserver est celui que vous réglerez.`],
  ["Avance", "Somme qu’un salon peut vous demander de régler à l’avance, directement au salon. Elle est déduite du total le jour du rendez-vous et vous est due si le rendez-vous est annulé."],
  ["Annulation", `${CANCEL_RULE} Plus vous prévenez tôt, plus le créneau peut profiter à une autre cliente.`],
  ["Liste d’attente", "Aucun créneau ne vous convient ? Inscrivez-vous sur la liste d’attente du salon : il vous propose un créneau dès qu’il s’en libère un."],
  ["Avis client", "Note et commentaire laissés après un rendez-vous réellement honoré, pour aider les autres clientes à choisir. Un seul avis par cliente et par salon, que l’on peut mettre à jour."],
  ["Salon partenaire", "Établissement de beauté ou de bien-être présent sur Rezervy, dont les prestations, les prix et les horaires sont réservables en ligne."],
  ["Carnet de séances", "Formule vendue par un salon : plusieurs séances d’une prestation, valables un temps donné, que vous réservez ensuite en ligne sans rien payer de plus."],
]

export default async function Glossaire() {
  // A term links to its category page only when the site has that page.
  const { nodeBySlug } = await getCatalog()
  const link = (rows) => rows.map(([t, d, slug]) => [t, d, slug && nodeBySlug[slug] ? `/${slug}` : undefined])
  return (
    <InfoPage
      title="Glossaire des termes beauté, bien-être et réservation"
      crumb="Glossaire"
      path="/glossaire"
      subtitle="Les mots de la coiffure, de l’esthétique, des ongles et du bien-être — et ceux de la réservation en ligne — expliqués simplement."
      sections={[
        {
          p: [
            "Les définitions sont regroupées par thème. Les noms, durées et tarifs des prestations varient d’un salon à l’autre : la fiche du salon et le détail de la prestation font foi au moment de réserver.",
          ],
        },
        { h: "Coiffure et barbier", dl: link(COIFFURE) },
        { h: "Esthétique et ongles", dl: link(ESTHETIQUE) },
        { h: "Bien-être", dl: link(BIEN_ETRE) },
        { h: "Réservation en ligne", dl: RESERVATION },
      ]}
      ctas={[
        { href: "/salons", label: "Trouver un salon" },
        { href: "/faqs", label: "Questions fréquentes" },
      ]}
    />
  )
}
