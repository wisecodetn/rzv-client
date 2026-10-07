import { SITE, INDEXABLE } from "@/lib/site"

export default function robots() {
  // Team preview / local: crawling stays allowed so search engines can SEE the
  // X-Robots-Tag noindex header on every page (a URL blocked here can still be
  // indexed from links); no sitemap is advertised.
  if (!INDEXABLE) return { rules: [{ userAgent: "*", allow: "/" }] }
  return {
    rules: [
      // /recherche is NOT disallowed: the city pages (/recherche/tunis) are
      // indexable SEO landings; the query-search variants carry their own
      // noindex meta — which crawlers can only see if the URL isn't blocked.
      { userAgent: "*", allow: "/", disallow: ["/compte", "/rdv/", "/api/", "/verifier-email", "/reinitialiser-mot-de-passe"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
