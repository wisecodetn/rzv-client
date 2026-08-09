/** Site-wide constants used for SEO, metadata and JSON-LD. */
export const SITE = {
  name: "Rezervy",
  tagline: "Réservez votre moment beauté, partout en Tunisie",
  description:
    "Rezervy — la marketplace beauté de Tunisie. Réservez en ligne 24h/24 coiffure, barbier, onglerie, spa et esthétique près de chez vous : prix, avis vérifiés et confirmation par SMS.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.rezervy.tn").replace(/\/$/, ""),
  locale: "fr_TN",
  twitter: "@rezervy",
  phone: "+216 71 000 000",
  sameAs: [
    "https://www.instagram.com/rezervy.tn",
    "https://www.facebook.com/rezervy.tn",
  ],
}

/** Absolute URL helper for canonicals / JSON-LD. */
export const abs = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`
