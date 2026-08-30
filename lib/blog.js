/**
 * Blog content, served by the API and authored in the back-office.
 *
 * The fixtures below are the fallback: they keep `next build` working when the
 * API is unreachable, exactly like lib/data.js does for salons. They use a
 * small block model, normalised to the same HTML shape the API returns so the
 * pages only ever deal with one contract.
 */
import { apiGet, mediaPath } from "./api"
import { slugify } from "./mock"

const RAW_POSTS = [
  {
    title: "Comment choisir son salon de coiffure en Tunisie",
    cat: "coiffure",
    excerpt: "Avis vérifiés, prix affichés, prise de rendez-vous en ligne : le guide pour trouver le bon salon près de chez vous — sans mauvaise surprise.",
    date: "2026-08-01",
    readMins: 5,
    author: { name: "Rania Ben Salah", role: "Rédaction Rezervy" },
    body: [
      { p: "Trouver un bon salon de coiffure ne devrait pas être un pari. Entre le bouche‑à‑oreille et les publications sur les réseaux, il est facile de se perdre. Voici comment décider en quelques minutes." },
      { h2: "1. Regardez les avis vérifiés" },
      { p: "Un avis vérifié provient d'une cliente qui a réellement réservé et honoré son rendez‑vous. C'est le signal le plus fiable : privilégiez les salons avec une note supérieure à 4,5 et un nombre d'avis conséquent." },
      { h2: "2. Comparez les prix à l'avance" },
      { p: "Un salon sérieux affiche ses tarifs par prestation. Comparez le « dès X TND » et le détail des services avant de vous déplacer — vous éviterez les surprises à l'encaissement." },
      { h2: "3. Réservez en ligne" },
      { list: ["Choisissez votre créneau sans appeler ni attendre.", "Sélectionnez votre praticien·ne préféré·e.", "Recevez une confirmation et un rappel par SMS."] },
      { p: "Sur Rezervy, chaque salon partenaire affiche ses services, ses prix, ses avis et ses disponibilités en temps réel. La réservation prend moins de 30 secondes." },
    ],
  },
  {
    title: "Balayage, ombré, mèches : quelles différences ?",
    cat: "coiffure",
    excerpt: "Trois techniques de coloration, trois rendus très différents. On vous explique laquelle choisir selon votre couleur de base et l'effet recherché.",
    date: "2026-07-24",
    readMins: 4,
    author: { name: "Amira Trabelsi", role: "Coloriste" },
    body: [
      { p: "Balayage, ombré hair, mèches… ces mots reviennent sans cesse mais recouvrent des techniques bien distinctes. Petit décryptage avant votre prochain rendez‑vous coloration." },
      { h2: "Le balayage" },
      { p: "Un éclaircissement peint à main levée pour un effet naturel et lumineux, comme un retour de vacances. Idéal pour un rendu doux et un entretien espacé." },
      { h2: "L'ombré hair" },
      { p: "Un dégradé marqué du foncé (racines) vers le clair (pointes). Plus contrasté que le balayage, très graphique." },
      { h2: "Les mèches" },
      { p: "Des sections de cheveux éclaircies à l'aide de papillotes, pour un résultat régulier et couvrant. Parfait pour illuminer l'ensemble de la chevelure." },
      { p: "Le bon choix dépend de votre base et de l'entretien souhaité. Un·e coloriste saura vous orienter — pensez à réserver un essai." },
    ],
  },
  {
    title: "Prendre soin de sa barbe : le guide du barbier",
    cat: "barbier",
    excerpt: "Taille, contour, rasage à la serviette chaude et soins : les gestes essentiels pour une barbe nette au quotidien.",
    date: "2026-07-15",
    readMins: 4,
    author: { name: "Khalil Mansour", role: "Barbier" },
    body: [
      { p: "Une belle barbe se construit autant à la maison qu'au fauteuil du barbier. Voici les fondamentaux." },
      { h2: "La taille régulière" },
      { p: "Une taille toutes les deux à trois semaines maintient la forme et la densité. Le contour (joues, cou) fait toute la différence entre une barbe soignée et négligée." },
      { h2: "Le rasage traditionnel" },
      { p: "Serviette chaude, mousse et rasoir : un rituel qui adoucit la peau et sublime les contours. À s'offrir de temps en temps chez un barbier." },
      { h2: "Les soins" },
      { list: ["Lavez la barbe 2 à 3 fois par semaine avec un shampoing doux.", "Hydratez avec une huile ou un baume pour éviter les démangeaisons.", "Peignez quotidiennement pour discipliner le poil."] },
    ],
  },
  {
    title: "Manucure : gel, semi‑permanent ou classique ?",
    cat: "onglerie",
    excerpt: "Tenue, rendu, entretien : le comparatif des trois grandes options pour choisir la manucure faite pour vous.",
    date: "2026-07-06",
    readMins: 3,
    author: { name: "Nour Gharbi", role: "Prothésiste ongulaire" },
    body: [
      { p: "Devant la carte d'un institut, on hésite vite. Voici comment trancher entre les trois grandes familles de manucure." },
      { h2: "Manucure classique" },
      { p: "Vernis traditionnel, séchage à l'air. Tenue de quelques jours, changement facile à la maison. Le plus économique." },
      { h2: "Vernis semi‑permanent" },
      { p: "Catalysé sous lampe UV/LED, il tient une à deux semaines sans s'écailler. Le bon compromis brillance / durée." },
      { h2: "Pose gel" },
      { p: "Renforce et rallonge l'ongle, tenue de trois semaines et plus. Idéal pour les ongles fragiles ou les occasions." },
    ],
  },
  {
    title: "Le hammam tunisien : un rituel bien‑être",
    cat: "spa-massage",
    excerpt: "Vapeur, gommage au savon noir, massage : les étapes d'un hammam traditionnel et ses bienfaits pour la peau et l'esprit.",
    date: "2026-06-28",
    readMins: 5,
    author: { name: "Mehdi Ayari", role: "Spa & bien‑être" },
    body: [
      { p: "Ancré dans la culture tunisienne, le hammam est bien plus qu'un bain de vapeur : c'est un moment de détente complète et de soin de la peau." },
      { h2: "Les étapes du rituel" },
      { list: ["La vapeur pour ouvrir les pores et détendre les muscles.", "Le gommage au savon noir et au gant de kessa pour éliminer les peaux mortes.", "Le rinçage et l'enveloppement au ghassoul (argile).", "Le massage relaxant pour finir en douceur."] },
      { h2: "Les bienfaits" },
      { p: "Peau nette et adoucie, circulation stimulée, tensions relâchées. Un rendez‑vous à s'offrir régulièrement, seul·e ou à plusieurs." },
    ],
  },
]


const FALLBACK_CATS = { coiffure: "Coiffure", barbier: "Barbier", onglerie: "Onglerie", "spa-massage": "Spa & Massage", esthetique: "Esthétique" }

/** Fixture blocks → the same HTML the editor produces. */
const blocksToHtml = (body = []) =>
  body
    .map((b) => {
      if (b.h2) return `<h2>${b.h2}</h2>`
      if (b.list) return `<ul>${b.list.map((li) => `<li>${li}</li>`).join("")}</ul>`
      return `<p>${b.p}</p>`
    })
    .join("")

const fromFixture = (p) => ({
  slug: slugify(p.title),
  title: p.title,
  excerpt: p.excerpt,
  cover: null,
  date: p.date,
  readMins: p.readMins,
  author: p.author,
  categories: p.cat ? [{ slug: p.cat, name: FALLBACK_CATS[p.cat] ?? p.cat }] : [],
  content: blocksToHtml(p.body),
})

const FALLBACK = RAW_POSTS.map(fromFixture).sort((a, b) => (a.date < b.date ? 1 : -1))

/** API post → the page contract. `cover` becomes a same-origin path for <Image>. */
const fromApi = (p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  cover: mediaPath(p.cover),
  date: p.date,
  readMins: p.readMins,
  author: p.author ?? { name: "Rédaction Rezervy", role: null },
  categories: p.categories ?? [],
  content: p.content ?? "",
})

export async function getPosts() {
  try {
    const rows = await apiGet("/public/blog")
    // An empty blog is a legitimate answer; only a failure falls back.
    return rows.map(fromApi)
  } catch {
    return FALLBACK
  }
}

export async function getPost(slug) {
  try {
    return fromApi(await apiGet(`/public/blog/${encodeURIComponent(slug)}`))
  } catch {
    return FALLBACK.find((p) => p.slug === slug) ?? null
  }
}

/** Enumerable set for generateStaticParams and the sitemap. */
export async function getPostSlugs() {
  try {
    return await apiGet("/public/blog/slugs")
  } catch {
    return FALLBACK.map((p) => p.slug)
  }
}

export const CAT_LABEL = FALLBACK_CATS

/** An article can carry several categories, or none — never assume the first. */
export const catOf = (post) => post?.categories?.[0] ?? null
export const catLabel = (post) => catOf(post)?.name ?? "Guide"
/** Where "voir les salons" should point; the blog itself when uncategorised. */
export const catHref = (post) => (catOf(post) ? `/${catOf(post).slug}` : "/blog")

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""
