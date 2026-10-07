/** Site-wide constants used for SEO, metadata and JSON-LD. */
export const SITE = {
  name: "Rezervy",
  tagline: "Réservez votre moment beauté en Tunisie",
  description:
    "Rezervy — la marketplace beauté de Tunisie. Réservez en ligne 24h/24 coiffure, barbier, onglerie, spa et esthétique près de chez vous : prix, avis et réservation gratuite.",
  // Set per environment at build time (NEXT_PUBLIC_SITE_URL): today
  // https://rzv.wisecode.tn, at launch https://rezervy.io — the default.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://rezervy.io").replace(/\/$/, ""),
  /** Rezervy Pro (salon dashboard) — NEXT_PUBLIC_PRO_URL; pro.rezervy.io at launch. */
  proUrl: (process.env.NEXT_PUBLIC_PRO_URL || "https://pro.rezervy.io").replace(/\/$/, ""),
  locale: "fr_TN",
  // Social profiles are not here: an admin manages them (Site client →
  // Réseaux sociaux) and they arrive with the site content (lib/site-content).
}

/**
 * Who operates Rezervy — shown on /contact, in the CGU, the privacy policy,
 * the footer and the Organization JSON-LD. One place to change it.
 */
export const OPERATOR = {
  name: "Wise Code",
  street: "ST. Badiaa Zaman Hamdhani, Khzema",
  postalCode: "4051",
  city: "Sousse",
  country: "Tunisie",
  countryCode: "TN",
  phone: "+216 28 065 313",
  email: "contact@rezervy.io",
  /** Customer support hours. */
  hours: "Tous les jours, de 8h à 22h",
  /** schema.org openingHours for the support line. */
  hoursSchema: "Mo-Su 08:00-22:00",
}
export const OPERATOR_ADDRESS = `${OPERATOR.street}, ${OPERATOR.postalCode} ${OPERATOR.city}, ${OPERATOR.country}`
export const telHref = (phone) => `tel:${phone.replace(/\s/g, "")}`

/**
 * Three environments share this code: localhost, the team preview
 * (rzv.wisecode.tn) and production (rezervy.io). Only production may be
 * indexed — a crawlable preview would put a second copy of every page in
 * Google, competing with rezervy.io. Off production every response carries
 * `X-Robots-Tag: noindex` (next.config.js) and the robots.txt has no sitemap.
 */
export const INDEXABLE = /^(www\.)?rezervy\.io$/.test(new URL(SITE.url).hostname)

/**
 * How booking actually works — written once, used by every page that mentions
 * it. Mirrors the API: payment always at the salon (nothing is taken online),
 * and a customer can cancel from their account until the appointment starts
 * (`canCancel` in server/src/client-area). Change these only with the server.
 */
export const PAY_RULE = "Paiement au salon, le jour du rendez-vous — rien n’est réglé en ligne."
export const CANCEL_RULE = "Annulation gratuite depuis votre compte, jusqu’au début du rendez-vous."

/** Absolute URL helper for canonicals / JSON-LD. */
export const abs = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`
