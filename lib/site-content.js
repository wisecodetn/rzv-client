/**
 * Editorial blocks of the public site, edited from the back-office.
 *
 * Mapped to the shapes the pages already consume (`[q, a]` tuples for the FAQ,
 * `{v, l}` for the figures) so switching the source touched the data layer and
 * not every component. When the API is down: the bundled copy in development,
 * nothing invented in production (same rule as lib/data.js).
 */
import { apiGet, mockAllowed } from "./api"
import { FAQS as MOCK_FAQS, STATS as MOCK_STATS } from "./mock"

const FALLBACK_HERO = {
  badge: "Réservation 100 % gratuite",
  title: "Réservez votre moment beauté en Tunisie",
  subtitle: "Coiffure, barbier, onglerie, spa — réservez en ligne, 24h/24.",
}

export async function getSiteContent() {
  try {
    const c = await apiGet("/public/site-content")
    return {
      hero: c.hero ?? FALLBACK_HERO,
      stats: (c.stats ?? []).map((s) => ({ v: s.value, l: s.label })),
      faqs: (c.faq ?? []).map((f) => [f.question, f.answer]),
      social: cleanSocial(c.social),
    }
  } catch {
    // The bundled figures and FAQ are development copy: in production an
    // outage shows no figures rather than invented ones.
    const mock = mockAllowed()
    return { hero: FALLBACK_HERO, stats: mock ? MOCK_STATS : [], faqs: mock ? MOCK_FAQS : [], social: cleanSocial(null) }
  }
}

/**
 * Rezervy's own social profiles, entered by an admin (admin → Site client →
 * Réseaux sociaux). Empty until then: the footer shows no icon and the
 * Organization JSON-LD declares no `sameAs`, rather than "#" links or
 * accounts nobody has confirmed.
 */
const SOCIAL_KEYS = ["instagram", "facebook", "tiktok", "x"]
function cleanSocial(raw) {
  const out = {}
  for (const k of SOCIAL_KEYS) {
    const v = typeof raw?.[k] === "string" ? raw[k].trim() : ""
    out[k] = /^https:\/\//.test(v) ? v : ""
  }
  return out
}

/** The filled-in profile URLs, in display order. */
export const socialUrls = (social) => SOCIAL_KEYS.map((k) => social?.[k]).filter(Boolean)
