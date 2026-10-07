/** schema.org JSON-LD builders. Each returns a plain object rendered inside a
 *  <script type="application/ld+json"> by the <JsonLd> component. */
import { SITE, abs, OPERATOR } from "./site"

/**
 * JSON for an inline <script>. JSON.stringify leaves `<` alone, so a review or
 * salon text containing `</script>` would close the tag and run whatever
 * follows — stored XSS on a public page. Escaping <, >, & and the two JS line
 * separators keeps the JSON identical once parsed.
 */
export function serializeJsonLd(d) {
  return JSON.stringify(d)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

/** `sameAs`: Rezervy's own profiles as entered by an admin — omitted while none is. */
export function organizationLd(sameAs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: SITE.name,
    url: SITE.url,
    // A real file (the old "/icon" URL answered 404).
    logo: abs("/brand/rezervy-icon-512.png"),
    description: SITE.description,
    areaServed: { "@type": "Country", name: "Tunisie" },
    address: {
      "@type": "PostalAddress",
      streetAddress: OPERATOR.street,
      postalCode: OPERATOR.postalCode,
      addressLocality: OPERATOR.city,
      addressCountry: OPERATOR.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: OPERATOR.phone.replace(/\s/g, ""),
      email: OPERATOR.email,
      areaServed: "TN",
      availableLanguage: ["French"],
      hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:00", closes: "22:00" },
    },
    parentOrganization: { "@type": "Organization", name: OPERATOR.name, url: "https://wisecode.tn" },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    url: SITE.url,
    name: SITE.name,
    inLanguage: "fr-TN",
    publisher: { "@id": abs("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/recherche?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
}

export function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url ? abs(it.url) : undefined,
    })),
  }
}

export function faqLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }
}

/** ItemList of salons for a category/city collection page. */
export function itemListLd(salons) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: salons.length,
    itemListElement: salons.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`/salon/${s.slug}`),
      name: s.name,
    })),
  }
}

const DAY = {
  Monday: "https://schema.org/Monday", Tuesday: "https://schema.org/Tuesday",
  Wednesday: "https://schema.org/Wednesday", Thursday: "https://schema.org/Thursday",
  Friday: "https://schema.org/Friday", Saturday: "https://schema.org/Saturday",
  Sunday: "https://schema.org/Sunday",
}

/** Rich LocalBusiness (HairSalon / NailSalon / DaySpa / BeautySalon) for a salon page. */
/** A salon published from the pro app may not have geo, hours, reviews or a
 *  price list yet — every optional block below is omitted rather than emitted
 *  empty, so the markup stays valid instead of crashing or lying. */
export function salonLd(salon, cat) {
  const prices = (salon.serviceGroups ?? []).flatMap((g) => (g.rows ?? []).map((r) => r.p)).filter((p) => Number.isFinite(p))
  const geo = salon.geo && salon.geo.lat != null && salon.geo.lng != null ? salon.geo : null
  const hours = salon.hoursSchema ?? []
  const reviews = salon.reviews ?? []
  const groups = salon.serviceGroups ?? []
  // The rating the page shows is computed from the review rows; the stored
  // average can be seeded. Structured data must say what the page says.
  const ratingCount = salon.ratings?.count ?? salon.rev ?? 0
  const ratingValue = salon.ratings?.overall ?? salon.rateNum
  return {
    "@context": "https://schema.org",
    "@type": cat?.schema || "HealthAndBeautyBusiness",
    "@id": abs(`/salon/${salon.slug}#business`),
    name: salon.name,
    url: abs(`/salon/${salon.slug}`),
    image: abs(`/salon/${salon.slug}/opengraph-image`),
    description: salon.desc,
    telephone: salon.phone,
    ...(prices.length ? { priceRange: `${Math.min(...prices)}–${Math.max(...prices)} TND` } : {}),
    currenciesAccepted: "TND",
    // No paymentAccepted: salons don't declare their payment methods, and
    // Rezervy takes no payment online — any list here would be invented.
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      addressLocality: salon.city,
      addressRegion: salon.city,
      addressCountry: "TN",
    },
    ...(geo
      ? {
          geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng },
          hasMap: `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=17/${geo.lat}/${geo.lng}`,
        }
      : {}),
    ...(hours.length
      ? {
          openingHoursSpecification: hours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days.map((d) => DAY[d]),
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    ...(ratingCount > 0 && Number.isFinite(ratingValue)
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount: ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.n },
      datePublished: r.at ? r.at.slice(0, 10) : undefined,
      reviewRating: { "@type": "Rating", ratingValue: r.starsNum, bestRating: 5 },
      reviewBody: r.txt,
    })),
    makesOffer: groups.flatMap((g) =>
      (g.rows ?? []).filter((r) => Number.isFinite(r.p)).map((r) => ({
        "@type": "Offer",
        priceCurrency: "TND",
        price: r.p,
        itemOffered: { "@type": "Service", name: r.n, category: g.cat },
      })),
    ),
    areaServed: { "@type": "City", name: salon.city },
  }
}
