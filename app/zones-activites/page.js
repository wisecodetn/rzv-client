import Link from "@/components/Link"
import InfoPage from "@/components/pages/InfoPage"
import { pageMeta } from "@/lib/meta"
import { getCities, getCoverage } from "@/lib/data"

export const metadata = pageMeta({
  absoluteTitle: "Zones d'activités en Tunisie | Rezervy",
  description:
    "Découvrez les villes et régions de Tunisie couvertes par Rezervy : Tunis, Sousse, Sfax, Nabeul et bien plus. Réservez votre salon beauté près de chez vous.",
  path: "/zones-activites",
})

/** The 24 governorates by region — the way people describe where they live. */
const REGIONS = [
  { name: "Grand Tunis", cities: ["tunis", "ariana", "ben-arous", "manouba"] },
  { name: "Nord-Est et Cap Bon", cities: ["nabeul", "bizerte", "zaghouan"] },
  { name: "Nord-Ouest", cities: ["beja", "jendouba", "le-kef", "siliana"] },
  { name: "Sahel et Centre-Est", cities: ["sousse", "monastir", "mahdia", "sfax"] },
  { name: "Centre-Ouest", cities: ["kairouan", "kasserine", "sidi-bouzid"] },
  { name: "Sud", cities: ["gabes", "medenine", "tataouine", "gafsa", "tozeur", "kebili"] },
]

export const revalidate = 300

export default async function ZonesActivites() {
  const [cities, coverage] = await Promise.all([getCities(), getCoverage()])
  const bySlug = Object.fromEntries(cities.map((c) => [c.slug, c]))
  const count = (slug) => coverage.cities?.[slug] ?? 0
  const placed = new Set(REGIONS.flatMap((r) => r.cities))
  // A ville added in the back-office that no region lists yet still appears.
  const others = cities.filter((c) => !placed.has(c.slug)).map((c) => c.slug)
  const regions = others.length ? [...REGIONS, { name: "Autres villes", cities: others }] : REGIONS
  const open = cities.filter((c) => count(c.slug) > 0)

  const grid = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
      {regions.map((r) => (
        <div key={r.name} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{r.name}</div>
          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {r.cities.filter((s) => bySlug[s]).map((s) => {
              const n = count(s)
              return (
                <li key={s} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5 }}>
                  <Link href={`/salons/${s}`} style={{ color: "var(--ink)", fontWeight: 700 }}>
                    Salons à {bySlug[s].name}
                  </Link>
                  <span style={{ color: "var(--muted)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                    {n > 0 ? `${n} salon${n > 1 ? "s" : ""}` : "bientôt"}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )

  return (
    <InfoPage
      title="Zones d'activités : où réserver vos soins beauté en Tunisie avec Rezervy"
      crumb="Zones d'activités"
      path="/zones-activites"
      subtitle="Rezervy est ouvert dans les 24 gouvernorats de Tunisie : coiffure, barbier, esthétique, onglerie, spa et hammam, du nord au sud."
      sections={[
        {
          h: "Une couverture pensée pour toute la Tunisie",
          p: [
            "Rezervy est une marketplace nationale : où que vous soyez en Tunisie, vous trouvez des salons de beauté et de bien-être, consultez leurs prestations et leurs prix en dinars, et réservez en ligne un créneau réellement libre — sans appeler.",
            open.length
              ? `Aujourd’hui, des salons réservables en ligne vous attendent à ${open.map((c) => c.name).join(", ")}. Le réseau s’agrandit à mesure que de nouveaux salons rejoignent la plateforme.`
              : "Les premiers salons rejoignent la plateforme ville par ville ; chaque page ci-dessous se remplit dès qu’un salon y est ouvert à la réservation.",
          ],
        },
        { h: "Les villes et régions desservies", node: grid },
        {
          h: "Au-delà des grandes villes",
          p: [
            "Dans chaque gouvernorat, Rezervy référence aussi les salons des quartiers et des communes voisines : l’objectif est de réserver près de chez vous ou de votre travail, sans long trajet.",
            "Les zones touristiques comme Djerba, Hammamet, Sousse ou Monastir sont incluses : résident ou de passage, vous réservez exactement de la même façon.",
          ],
        },
        {
          h: "Comment trouver un salon près de chez vous",
          ordered: true,
          list: [
            "Indiquez votre ville ou votre quartier dans la barre de recherche.",
            "Choisissez le soin : coiffure, barbier, esthétique, onglerie, spa, hammam ou massage.",
            "Comparez les salons : prestations, prix en TND, avis de clientes ayant réellement fait le soin.",
            "Choisissez un créneau libre et envoyez votre demande : le salon la confirme, vous recevez un e-mail.",
            "Réglez au salon, le jour du rendez-vous — rien n’est payé en ligne.",
          ],
        },
        {
          h: "Votre salon n’est pas encore sur Rezervy ?",
          p: [
            "Professionnel de la beauté, rejoindre Rezervy rend votre salon visible auprès des clientes qui réservent en ligne dans votre ville, et contribue à étendre la couverture de la plateforme.",
          ],
        },
      ]}
      faq={[
        ["Rezervy couvre-t-il toute la Tunisie ?", "Oui : la plateforme est ouverte dans les 24 gouvernorats. Le nombre de salons réservables varie d’une ville à l’autre et augmente à mesure que de nouveaux salons nous rejoignent."],
        ["Ma ville n’a pas encore de salon, que faire ?", "Revenez bientôt, ou parlez de Rezervy aux salons que vous fréquentez : un salon peut demander à rejoindre la plateforme en quelques minutes depuis la page « Devenir partenaire »."],
        ["Puis-je réserver pendant un séjour touristique ?", "Oui. À Djerba, Hammamet, Sousse, Monastir ou ailleurs, vous réservez vos soins comme un résident : choix du créneau en ligne, paiement au salon."],
        ["Comment savoir quels soins sont proposés dans ma ville ?", "Ouvrez la page de votre ville ci-dessus, ou lancez une recherche avec votre ville et le type de soin : vous voyez les salons, leurs prestations et leurs prix."],
      ]}
      ctas={[
        { href: "/salons", label: "Trouver un salon" },
        { href: "/devenir-partenaire", label: "Inscrire mon salon" },
      ]}
    />
  )
}
