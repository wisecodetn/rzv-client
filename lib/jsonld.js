/** schema.org JSON-LD builders. Each returns a plain object rendered inside a
 *  <script type="application/ld+json"> by the <JsonLd> component. */
import { SITE, abs } from "./site"

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: SITE.name,
    url: SITE.url,
    logo: abs("/icon"),
    description: SITE.description,
    areaServed: { "@type": "Country", name: "Tunisie" },
    sameAs: SITE.sameAs,
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
export function salonLd(salon, cat) {
  const prices = salon.serviceGroups.flatMap((g) => g.rows.map((r) => r.p))
  const min = Math.min(...prices), max = Math.max(...prices)
  return {
    "@context": "https://schema.org",
    "@type": cat?.schema || "HealthAndBeautyBusiness",
    "@id": abs(`/salon/${salon.slug}#business`),
    name: salon.name,
    url: abs(`/salon/${salon.slug}`),
    image: abs(`/salon/${salon.slug}/opengraph-image`),
    description: salon.desc,
    telephone: salon.phone,
    priceRange: `${min}–${max} TND`,
    currenciesAccepted: "TND",
    paymentAccepted: "Flouci, e-Dinar SmartPay, Carte bancaire, Espèces",
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      addressLocality: salon.city,
      addressRegion: salon.city,
      addressCountry: "TN",
    },
    geo: { "@type": "GeoCoordinates", latitude: salon.geo.lat, longitude: salon.geo.lng },
    hasMap: `https://www.openstreetmap.org/?mlat=${salon.geo.lat}&mlon=${salon.geo.lng}#map=17/${salon.geo.lat}/${salon.geo.lng}`,
    openingHoursSpecification: salon.hoursSchema.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAY[d]),
      opens: h.opens,
      closes: h.closes,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: salon.rateNum,
      reviewCount: salon.rev,
      bestRating: 5,
      worstRating: 1,
    },
    review: salon.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.n },
      datePublished: undefined,
      reviewRating: { "@type": "Rating", ratingValue: r.starsNum, bestRating: 5 },
      reviewBody: r.txt,
    })),
    makesOffer: salon.serviceGroups.flatMap((g) =>
      g.rows.map((r) => ({
        "@type": "Offer",
        priceCurrency: "TND",
        price: r.p,
        itemOffered: { "@type": "Service", name: r.n, category: g.cat },
      })),
    ),
    areaServed: { "@type": "City", name: salon.city },
  }
}
