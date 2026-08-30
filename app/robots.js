import { SITE } from "@/lib/site"

export default function robots() {
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
