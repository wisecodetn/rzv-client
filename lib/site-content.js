/**
 * Editorial blocks of the public site, edited from the back-office.
 *
 * Mapped to the shapes the pages already consume (`[q, a]` tuples for the FAQ,
 * `{v, l}` for the figures) so switching the source touched the data layer and
 * not every component. Falls back to the bundled copy when the API is down, as
 * lib/data.js does for salons.
 */
import { apiGet } from "./api"
import { FAQS as MOCK_FAQS, STATS as MOCK_STATS } from "./mock"

const FALLBACK_HERO = {
  badge: "★ 4,8 / 5 · 65 000 rendez-vous chaque mois",
  title: "Réservez votre moment beauté, partout en Tunisie",
  subtitle: "Coiffure, barbier, onglerie, spa — réservation en ligne 24h/24, confirmation par SMS.",
}

export async function getSiteContent() {
  try {
    const c = await apiGet("/public/site-content")
    return {
      hero: c.hero ?? FALLBACK_HERO,
      stats: (c.stats ?? []).map((s) => ({ v: s.value, l: s.label })),
      faqs: (c.faq ?? []).map((f) => [f.question, f.answer]),
    }
  } catch {
    return { hero: FALLBACK_HERO, stats: MOCK_STATS, faqs: MOCK_FAQS }
  }
}
